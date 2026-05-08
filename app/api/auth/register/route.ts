import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { RegistrationTokenStatus, UserStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  createRegistrationToken,
  hashRegistrationToken,
  normalizeEmail,
} from "@/lib/registration-token";
import { getOrCreateSettings } from "@/lib/settings";
import { isAccountActive } from "@/lib/account-status";
import { isSignupEmailDomainAllowed } from "@/lib/user-access";
import { checkAndAwardBadges } from "@/lib/badges";

type RegisterAction = "verify_otp" | "accept_policy_and_register" | "reject_policy";

// Email sending helper
async function sendConfirmationEmail(email: string, name: string, policyVersion: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Welcome to Neki - Privacy Policy Confirmation",
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2>Welcome to Neki, ${name || "there"}!</h2>
        <p>Your account has been created successfully.</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <h3>Privacy Policy & Consent Confirmation</h3>
        <p>You have accepted the following:</p>
        <ul style="background: #f9f9f9; padding: 16px; border-radius: 8px;">
          <li><strong>Privacy Policy Version:</strong> ${policyVersion}</li>
          <li><strong>Consent Date:</strong> ${new Date().toLocaleString()}</li>
          <li><strong>Consent Given:</strong> Yes</li>
        </ul>
        <p style="margin-top: 20px;">
          By accepting the privacy policy, you consent to the collection and processing of your personal data 
          as outlined in the policy. You can withdraw your consent at any time by contacting us 
          or updating your account settings.
        </p>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          If you did not create this account, please contact us immediately.
        </p>
      </div>
    `,
  });
}

function getClientIp(req: Request): string | null {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return req.headers.get("x-real-ip");
}

function getUserAgent(req: Request): string | null {
  return req.headers.get("user-agent");
}

function getDomainFromEmail(email: string): string {
  return email.split("@")[1] || "";
}

async function handleVerifyOtp(req: Request, body: Record<string, unknown>) {
  const rawEmail = String(body.email || "");
  const code = String(body.code || "");
  const email = normalizeEmail(rawEmail);

  if (!email || !code) {
    return NextResponse.json(
      { error: "Email and code are required", code: "INVALID_INPUT" },
      { status: 400 }
    );
  }

  const settings = await getOrCreateSettings();
  const otpRecord = await prisma.oTP.findUnique({
    where: { email },
  });

  if (!otpRecord || otpRecord.code !== code || otpRecord.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "Invalid or expired verification code", code: "OTP_INVALID" },
      { status: 400 }
    );
  }

  const emailDomain = getDomainFromEmail(email);
  if (!isSignupEmailDomainAllowed(emailDomain, settings.allowedDomains)) {
    return NextResponse.json(
      {
        error: `The domain @${emailDomain} is not authorized for registration.`,
        code: "DOMAIN_NOT_ALLOWED",
      },
      { status: 403 }
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: {
      password: true,
      status: true,
      banned: true,
    },
  });

  if (existingUser?.password) {
    return NextResponse.json(
      { error: "User already exists. Please sign in.", code: "USER_ALREADY_EXISTS" },
      { status: 409 }
    );
  }

  if (existingUser && !isAccountActive(existingUser.status, existingUser.banned)) {
    return NextResponse.json(
      { error: "This account is blocked.", code: "ACCOUNT_BLOCKED" },
      { status: 403 }
    );
  }

  const { rawToken, tokenHash, expiresAt } = createRegistrationToken();
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.registrationToken.updateMany({
      where: {
        email,
        status: RegistrationTokenStatus.ACTIVE,
      },
      data: {
        status: RegistrationTokenStatus.REVOKED,
        revokedAt: now,
        revokedReason: "REPLACED_BY_NEW_TOKEN",
      },
    });

    await tx.registrationToken.create({
      data: {
        email,
        tokenHash,
        status: RegistrationTokenStatus.ACTIVE,
        policyVersion: settings.privacyPolicyVersion,
        expiresAt,
        createdIp: getClientIp(req),
        createdUserAgent: getUserAgent(req),
      },
    });

    await tx.oTP.delete({ where: { email } });
  });

  return NextResponse.json({
    success: true,
    registrationToken: rawToken,
    tokenExpiresAt: expiresAt.toISOString(),
    policyVersion: settings.privacyPolicyVersion,
  });
}

async function handleAcceptPolicyAndRegister(req: Request, body: Record<string, unknown>) {
  const rawEmail = String(body.email || "");
  const rawPassword = String(body.password || "");
  const registrationToken = String(body.registrationToken || "");
  const policyVersion = String(body.policyVersion || "");
  const policyAccepted = Boolean(body.policyAccepted);

  const email = normalizeEmail(rawEmail);
  const password = rawPassword.trim();

  if (!email || !password || !registrationToken || !policyVersion || !policyAccepted) {
    return NextResponse.json(
      {
        error: "Email, password, token, and policy acceptance are required",
        code: "INVALID_INPUT",
      },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters", code: "INVALID_PASSWORD" },
      { status: 400 }
    );
  }

  const tokenHash = hashRegistrationToken(registrationToken);
  const now = new Date();

  try {
    const settings = await getOrCreateSettings();
    let registeredUserId: string | undefined;

    await prisma.$transaction(async (tx) => {
      if (policyVersion !== settings.privacyPolicyVersion) {
        throw new Error("POLICY_VERSION_MISMATCH");
      }

      const tokenRecord = await tx.registrationToken.findUnique({
        where: { tokenHash },
      });

      if (!tokenRecord || tokenRecord.email !== email) {
        throw new Error("TOKEN_INVALID");
      }

      if (tokenRecord.status === RegistrationTokenStatus.REVOKED) {
        throw new Error("TOKEN_REVOKED");
      }

      if (tokenRecord.status === RegistrationTokenStatus.CONSUMED) {
        throw new Error("TOKEN_CONSUMED");
      }

      if (tokenRecord.expiresAt < now) {
        await tx.registrationToken.update({
          where: { tokenHash },
          data: {
            status: RegistrationTokenStatus.REVOKED,
            revokedAt: now,
            revokedReason: "TOKEN_EXPIRED",
          },
        });
        throw new Error("TOKEN_EXPIRED");
      }

      const emailDomain = getDomainFromEmail(email);
      if (!isSignupEmailDomainAllowed(emailDomain, settings.allowedDomains)) {
        throw new Error("DOMAIN_NOT_ALLOWED");
      }

      const existingUser = await tx.user.findUnique({
        where: { email },
        select: {
          id: true,
          password: true,
          status: true,
          banned: true,
        },
      });

      if (existingUser?.password) {
        throw new Error("USER_ALREADY_EXISTS");
      }

      if (existingUser && !isAccountActive(existingUser.status, existingUser.banned)) {
        throw new Error("ACCOUNT_BLOCKED");
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      let userId: string;

      if (existingUser) {
        await tx.user.update({
          where: { id: existingUser.id },
          data: {
            password: hashedPassword,
            status: UserStatus.ACTIVE,
            statusReason: null,
            statusChangedAt: now,
            banned: false,
            banReason: null,
            privacyPolicyAcceptedAt: now,
            privacyPolicyVersion: settings.privacyPolicyVersion,
          },
        });
        userId = existingUser.id;
        registeredUserId = existingUser.id;
      } else {
        const newUser = await tx.user.create({
          data: {
            email,
            name: email.split("@")[0],
            password: hashedPassword,
            role: "MEMBER",
            status: UserStatus.ACTIVE,
            privacyPolicyAcceptedAt: now,
            privacyPolicyVersion: settings.privacyPolicyVersion,
          },
        });
        userId = newUser.id;
        registeredUserId = newUser.id;
      }

      const allCommunities = await tx.community.findMany({
        select: { id: true },
      });

      if (allCommunities.length > 0) {
        await tx.communityMember.createMany({
          data: allCommunities.map((c) => ({
            userId,
            communityId: c.id,
          })),
          skipDuplicates: true,
        });
      }

      await tx.registrationToken.update({
        where: { tokenHash },
        data: {
          status: RegistrationTokenStatus.CONSUMED,
          acceptedAt: now,
          consumedAt: now,
          finalizedIp: getClientIp(req),
          finalizedUserAgent: getUserAgent(req),
        },
      });
    });

    // Send confirmation email with privacy policy details (fire & forget - don't await)
    const userName = email.split("@")[0];
    sendConfirmationEmail(email, userName, policyVersion).catch(console.error);

    if (registeredUserId) {
      checkAndAwardBadges(registeredUserId).catch(console.error);
    }

    return NextResponse.json({ success: true, message: "Registration successful" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";

    if (message === "TOKEN_INVALID") {
      return NextResponse.json(
        { error: "Invalid registration session", code: "TOKEN_INVALID" },
        { status: 403 }
      );
    }

    if (message === "TOKEN_REVOKED" || message === "TOKEN_CONSUMED") {
      return NextResponse.json(
        { error: "Registration session is no longer valid", code: message },
        { status: 403 }
      );
    }

    if (message === "TOKEN_EXPIRED") {
      return NextResponse.json(
        { error: "Registration session expired. Request a new code.", code: "TOKEN_EXPIRED" },
        { status: 403 }
      );
    }

    if (message === "DOMAIN_NOT_ALLOWED") {
      return NextResponse.json(
        { error: "This email domain is not authorized.", code: "DOMAIN_NOT_ALLOWED" },
        { status: 403 }
      );
    }

    if (message === "USER_ALREADY_EXISTS") {
      return NextResponse.json(
        { error: "User already exists with a password.", code: "USER_ALREADY_EXISTS" },
        { status: 409 }
      );
    }

    if (message === "ACCOUNT_BLOCKED") {
      return NextResponse.json(
        { error: "This account is blocked.", code: "ACCOUNT_BLOCKED" },
        { status: 403 }
      );
    }

    if (message === "POLICY_VERSION_MISMATCH") {
      return NextResponse.json(
        { error: "Privacy policy changed. Please restart signup.", code: "POLICY_VERSION_MISMATCH" },
        { status: 409 }
      );
    }

    console.error("Registration Error:", error);
    return NextResponse.json(
      { error: "Internal server error during registration", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

async function handleRejectPolicy(body: Record<string, unknown>) {
  const rawEmail = String(body.email || "");
  const registrationToken = String(body.registrationToken || "");
  const reason = String(body.reason || "USER_REJECTED_POLICY");

  const email = normalizeEmail(rawEmail);

  if (!email || !registrationToken) {
    return NextResponse.json(
      { error: "Email and token are required", code: "INVALID_INPUT" },
      { status: 400 }
    );
  }

  const tokenHash = hashRegistrationToken(registrationToken);
  const now = new Date();

  const updateResult = await prisma.registrationToken.updateMany({
    where: {
      email,
      tokenHash,
      status: RegistrationTokenStatus.ACTIVE,
    },
    data: {
      status: RegistrationTokenStatus.REVOKED,
      revokedAt: now,
      revokedReason: reason,
    },
  });

  if (updateResult.count > 0) {
    return NextResponse.json({ success: true, revoked: true });
  }

  const existing = await prisma.registrationToken.findUnique({
    where: { tokenHash },
    select: {
      email: true,
      status: true,
    },
  });

  if (!existing || existing.email !== email) {
    return NextResponse.json(
      { error: "Invalid registration session", code: "TOKEN_INVALID" },
      { status: 403 }
    );
  }

  return NextResponse.json({ success: true, revoked: existing.status === RegistrationTokenStatus.REVOKED });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const action = String(body.action || "") as RegisterAction;

    if (action === "verify_otp") {
      return handleVerifyOtp(req, body);
    }

    if (action === "accept_policy_and_register") {
      return handleAcceptPolicyAndRegister(req, body);
    }

    if (action === "reject_policy") {
      return handleRejectPolicy(body);
    }

    return NextResponse.json(
      { error: "Unsupported registration action", code: "INVALID_ACTION" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      { error: "Internal server error during registration", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
