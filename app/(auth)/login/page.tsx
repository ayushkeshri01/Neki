"use client";

import Image from "next/image";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface BlockedAccountState {
  open: boolean;
  title: string;
  message: string;
}

function parseBlockedAuthMessage(value?: string | null): { title: string; message: string } | null {
  if (!value) {
    return null;
  }

  const decoded = decodeURIComponent(value);

  if (decoded.startsWith("Blacklisted:") || decoded.startsWith("Banned:")) {
    return {
      title: "Account Blacklisted",
      message: decoded.split(":").slice(1).join(":") || "Your account has been blacklisted.",
    };
  }

  if (decoded.startsWith("Removed:")) {
    return {
      title: "Account Removed",
      message: decoded.split(":").slice(1).join(":") || "Your account has been removed.",
    };
  }

  return null;
}

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [prefix, setPrefix] = useState("");
  const [domain, setDomain] = useState("");
  const [allowedDomains, setAllowedDomains] = useState<string[]>([]);

  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [registrationToken, setRegistrationToken] = useState("");
  const [policyVersion, setPolicyVersion] = useState("v1");

  const [showPolicyDialog, setShowPolicyDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const urlError = searchParams.get("error");
  const urlCode = searchParams.get("code");
  const currentUrlKey = urlCode || urlError;
  const urlBlockedParsed = parseBlockedAuthMessage(currentUrlKey);

  const [blockedAccount, setBlockedAccount] = useState<BlockedAccountState>(() => {
    if (urlBlockedParsed) {
      return {
        open: true,
        title: urlBlockedParsed.title,
        message: urlBlockedParsed.message,
      };
    }
    return { open: false, title: "", message: "" };
  });

  useEffect(() => {
    fetch("/api/auth/domains")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.domains)) {
          setAllowedDomains(data.domains);
          if (data.domains.length > 0) {
            setDomain(data.domains[0]);
          }
        }

        if (typeof data.privacyPolicyVersion === "string" && data.privacyPolicyVersion) {
          setPolicyVersion(data.privacyPolicyVersion);
        }
      })
      .catch(() => {
        setAllowedDomains([]);
      });
  }, []);

  function resetSignupState() {
    setOtpSent(false);
    setOtpCode("");
    setRegistrationToken("");
    setShowPolicyDialog(false);
    setShowRejectDialog(false);
  }

  function handleTabSwitch(value: string) {
    setActiveTab(value as "signin" | "signup");
    setErrorMsg("");
    resetSignupState();
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();

    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setErrorMsg("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: email.trim().toLowerCase(),
        password,
      });

      const blocked = parseBlockedAuthMessage(result?.code);
      if (blocked) {
        setBlockedAccount({
          open: true,
          title: blocked.title,
          message: blocked.message,
        });
        return;
      }

      if (result?.error) {
        setErrorMsg("Invalid login credentials.");
        return;
      }

      router.push("/feed");
      router.refresh();
    } catch {
      setErrorMsg("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSendOtpForm(e: React.FormEvent) {
    e.preventDefault();

    if (!prefix || !domain || !password) {
      setErrorMsg("Please fill out all fields.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    const targetEmail = `${prefix.trim().toLowerCase()}@${domain.trim().toLowerCase()}`;

    setErrorMsg("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Failed to send code");
        return;
      }

      setOtpSent(true);
      setEmail(targetEmail);
    } catch {
      setErrorMsg("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRegisterVerify(e: React.FormEvent) {
    e.preventDefault();

    if (!otpCode || otpCode.length < 6) {
      setErrorMsg("Please enter the complete 6-digit code");
      return;
    }

    setErrorMsg("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify_otp",
          email,
          code: otpCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Verification failed");
        return;
      }

      setRegistrationToken(data.registrationToken);
      setPolicyVersion(data.policyVersion || "v1");
      setShowPolicyDialog(true);
    } catch {
      setErrorMsg("Failed to verify code.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAcceptPolicyAndRegister() {
    if (!registrationToken) {
      setErrorMsg("Registration session is missing. Please restart signup.");
      resetSignupState();
      return;
    }

    setErrorMsg("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "accept_policy_and_register",
          email,
          password,
          registrationToken,
          policyAccepted: true,
          policyVersion,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Registration failed");
        if (data.code === "TOKEN_EXPIRED" || data.code === "TOKEN_REVOKED") {
          resetSignupState();
        }
        return;
      }

      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      const blocked = parseBlockedAuthMessage(result?.code);
      if (blocked) {
        setBlockedAccount({
          open: true,
          title: blocked.title,
          message: blocked.message,
        });
        return;
      }

      if (result?.error) {
        setErrorMsg(
          "Successfully registered, but automatic login failed. Please use the Sign In tab."
        );
        setActiveTab("signin");
        resetSignupState();
        return;
      }

      router.push("/feed");
      router.refresh();
    } catch {
      setErrorMsg("Failed to complete registration.");
    } finally {
      setIsLoading(false);
      setShowPolicyDialog(false);
    }
  }

  async function handleRejectAndDontSignup() {
    if (!registrationToken) {
      resetSignupState();
      router.push("/");
      return;
    }

    setIsLoading(true);

    try {
      await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject_policy",
          email,
          registrationToken,
          reason: "USER_REJECTED_POLICY",
        }),
      });
    } finally {
      setIsLoading(false);
      setShowRejectDialog(false);
      setErrorMsg("");
      resetSignupState();
      router.push("/");
    }
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-background p-4 font-sans">
        <Card className="w-full max-w-md shadow-xl border-primary/10">
          <CardHeader className="text-center space-y-6 pb-4">
            <div className="mx-auto relative h-20 w-20 overflow-hidden rounded-[22px] shadow-premium-lg border border-primary/10 bg-white p-1">
              <Image src="/logo.png" alt="Neki Logo" fill className="object-contain p-1" priority />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-4xl font-black tracking-tight text-primary drop-shadow-sm">Neki</CardTitle>
              <CardDescription className="text-base">
                Share social work and empower your community.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {errorMsg && (
              <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive font-medium animate-in slide-in-from-top-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p>{errorMsg}</p>
              </div>
            )}

            {!otpSent ? (
              <Tabs value={activeTab} onValueChange={handleTabSwitch} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="signin" className="focus-visible:ring-0">
                  <form onSubmit={handleSignIn} className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-300">
                    <div className="space-y-2">
                      <Label>Company Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="you@company.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-10"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <Button className="w-full h-11 text-base font-semibold mt-2" disabled={isLoading}>
                      {isLoading ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      ) : (
                        <ArrowRight className="mr-2 h-5 w-5" />
                      )}
                      Sign In
                    </Button>
                    <div className="text-center">
                      <Link
                        href="/forgot-password"
                        className="text-sm text-muted-foreground hover:text-primary underline-offset-4 hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="focus-visible:ring-0">
                  <form onSubmit={handleSendOtpForm} className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                    <div className="space-y-2">
                      <Label>Company Email</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          placeholder="you"
                          value={prefix}
                          onChange={(e) => setPrefix(e.target.value)}
                          className="w-1/2"
                          required
                        />
                        <span className="text-muted-foreground font-medium">@</span>
                        <Select
                          value={domain}
                          onValueChange={setDomain}
                        >
                          <SelectTrigger aria-label="Email domain" className="w-1/2">
                            <SelectValue placeholder="Select domain" />
                          </SelectTrigger>
                          <SelectContent>
                            {allowedDomains.length === 0 ? (
                              <SelectItem value="" disabled>
                                No domains
                              </SelectItem>
                            ) : (
                              allowedDomains.map((dom) => (
                                <SelectItem key={dom} value={dom}>
                                  {dom}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Create a Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-10"
                          required
                          minLength={6}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      You will be asked to accept the Privacy Policy before your account is created.
                    </p>
                    <Button
                      className="w-full h-11 text-base font-semibold focus:ring-2 mt-2"
                      disabled={isLoading || allowedDomains.length === 0}
                    >
                      {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                      Verify Email via Code
                    </Button>
                    {allowedDomains.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center">
                        No domains available. Please wait for an admin to configure them.
                      </p>
                    )}
                  </form>
                </TabsContent>
              </Tabs>
            ) : (
              <form onSubmit={handleRegisterVerify} className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-500">
                <div className="flex flex-col items-center justify-center space-y-3 text-center mb-6">
                  <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Check your email</h3>
                    <p className="text-sm text-muted-foreground">
                      We&apos;ve sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-center block">Enter Code to Continue</Label>
                  <Input
                    type="text"
                    placeholder="123456"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ""))}
                    className="text-center text-2xl tracking-widest font-mono h-14"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Button className="w-full h-11 text-base font-semibold" disabled={isLoading || otpCode.length !== 6}>
                    {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                    Continue
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-muted-foreground text-xs"
                    onClick={() => {
                      resetSignupState();
                      setErrorMsg("");
                    }}
                    disabled={isLoading}
                  >
                    Go back and change email
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
          <CardFooter className="justify-center border-t border-border/50 bg-muted/20 py-4">
            <p className="text-xs text-muted-foreground text-center px-4">
              Neki Community &copy; {new Date().getFullYear()}
            </p>
          </CardFooter>
        </Card>
      </div>

      <Dialog
        open={showPolicyDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowPolicyDialog(false);
            setShowRejectDialog(true);
          }
        }}
      >
        <DialogContent
          onEscapeKeyDown={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Privacy Policy Agreement</DialogTitle>
            <DialogDescription>
              To create your account, you must accept our Privacy Policy and Terms.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-md border bg-muted/30 p-4 text-sm text-muted-foreground">
            We collect your account profile and activity data to provide community features,
            moderation, and safety enforcement. By accepting, you confirm that you understand
            and agree to this use.
          </div>

          <div className="text-sm text-muted-foreground">
            Read full policies:
            <div className="mt-2 flex items-center gap-2">
              <Link
                href="/privacy"
                className="text-primary underline underline-offset-2"
                target="_blank"
                rel="noreferrer"
              >
                Privacy Policy
              </Link>
              <span>and</span>
              <Link
                href="/terms"
                className="text-primary underline underline-offset-2"
                target="_blank"
                rel="noreferrer"
              >
                Terms of Service
              </Link>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowPolicyDialog(false);
                setShowRejectDialog(true);
              }}
              disabled={isLoading}
            >
              Reject
            </Button>
            <Button type="button" onClick={handleAcceptPolicyAndRegister} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Accept Privacy Policy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Continue without accepting?</AlertDialogTitle>
            <AlertDialogDescription>
              You must accept the privacy policy to create an account. Choose to accept and continue,
              or stop account creation and return to the landing page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowRejectDialog(false);
                setShowPolicyDialog(true);
              }}
              disabled={isLoading}
            >
              Accept Privacy Policy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRejectAndDontSignup}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Don&apos;t Create Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={blockedAccount.open}
        onOpenChange={(open) => setBlockedAccount((prev) => ({ ...prev, open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-destructive" />
              {blockedAccount.title}
            </AlertDialogTitle>
            <AlertDialogDescription>{blockedAccount.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setBlockedAccount({ open: false, title: "", message: "" });
                router.push("/");
              }}
            >
              Go to Home
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse flex items-center gap-2">
            <div className="h-4 w-4 bg-primary rounded-full" />
            Loading...
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
