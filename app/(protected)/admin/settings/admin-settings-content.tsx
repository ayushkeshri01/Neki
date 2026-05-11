"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Plus, X, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChangePasswordDialog } from "@/components/change-password-dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Settings {
  allowedDomains: string[];
  privacyPolicyVersion: string;
  autoLogoutDays: number | null;
}

interface AdminSettingsContentProps {
  initialSettings: Settings;
}

function normalizeDomainInput(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^@+/, "")
    .replace(/\/.*$/, "");
}

function isValidDomainInput(value: string): boolean {
  if (!value || value.length > 253) {
    return false;
  }

  if (value === "localhost") {
    return true;
  }

  if (!value.includes(".") || /\s/.test(value)) {
    return false;
  }

  return value.split(".").every((segment) => {
    if (!segment || segment.length > 63) {
      return false;
    }

    return /^(?!-)[a-z0-9-]+(?<!-)$/.test(segment);
  });
}

export function AdminSettingsContent({
  initialSettings,
}: AdminSettingsContentProps) {
  const router = useRouter();
  const [settings, setSettings] = useState(initialSettings);
  const [newDomain, setNewDomain] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        toast.success("Settings saved.");
        router.refresh();
        return;
      }

      const data = await res
        .json()
        .catch(() => ({ error: `Request failed (${res.status})` }));
      toast.error(data.error || "Failed to save settings.");
    } catch {
      toast.error("Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const addDomain = () => {
    const normalizedDomain = normalizeDomainInput(newDomain);

    if (!normalizedDomain) {
      toast.error("Enter a domain to add.");
      return;
    }

    if (!isValidDomainInput(normalizedDomain)) {
      toast.error("Enter a valid domain like example.com.");
      return;
    }

    if (settings.allowedDomains.includes(normalizedDomain)) {
      toast.error("That domain is already in the list.");
      return;
    }

    setSettings(s => ({
      ...s,
      allowedDomains: [...s.allowedDomains, normalizedDomain]
    }));
    setNewDomain("");
  };

  const removeDomain = (domain: string) => {
    setSettings(s => ({
       ...s,
       allowedDomains: s.allowedDomains.filter(d => d !== domain)
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Settings</h2>
        <ChangePasswordDialog asChild>
          <Button variant="outline" size="sm">
            <KeyRound className="h-4 w-4 mr-2" />
            Change Password
          </Button>
        </ChangePasswordDialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>App Configuration</CardTitle>
          <CardDescription>Manage your community settings and domains here.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label>Allowed Email Domains</Label>
            <div className="flex gap-2">
              <Input
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder="example.com"
                onKeyDown={(e) => e.key === "Enter" && addDomain()}
              />
              <Button onClick={addDomain} type="button" variant="secondary"><Plus className="h-4 w-4 mr-2" /> Add</Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
               {settings.allowedDomains.map(domain => (
                  <div key={domain} className="flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full text-sm">
                     <span>{domain}</span>
                  <button onClick={() => removeDomain(domain)} className="text-muted-foreground hover:text-foreground transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                  </div>
               ))}
               {settings.allowedDomains.length === 0 && (
                  <p className="text-sm text-muted-foreground">No domains added yet. Adding one will restrict logins to that domain.</p>
               )}
            </div>

            <p className="text-xs text-muted-foreground">
              Users can sign up only with an email from one of these domains.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="policyVersion">Privacy Policy Version</Label>
            <Input
              id="policyVersion"
              value={settings.privacyPolicyVersion}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  privacyPolicyVersion: e.target.value,
                }))
              }
              placeholder="v1"
            />
            <p className="text-xs text-muted-foreground">
              New registrations must accept this policy version.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="autoLogoutDays">Auto Logout (Days)</Label>
            <Input
              id="autoLogoutDays"
              type="number"
              min={1}
              value={settings.autoLogoutDays ?? ""}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  autoLogoutDays: e.target.value ? parseInt(e.target.value) : null,
                }))
              }
              placeholder="e.g. 30"
            />
            <p className="text-xs text-muted-foreground">
              Users will be automatically logged out after this many days since their last login. Leave empty to disable.
            </p>
          </div>

          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            {isSaving && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            <Save className="h-4 w-4" />
            Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
