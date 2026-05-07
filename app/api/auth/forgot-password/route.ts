import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes, createHash } from "crypto";
import nodemailer from "nodemailer";
import { normalizeEmail } from "@/lib/registration-token";

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 3;

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  
  record.count++;
  return true;
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

async function sendResetEmail(email: string, resetToken: string) {
  const resetUrl = `${process.env.AUTH_URL || "http://localhost:3000"}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
  
  const smtpHost = process.env.SMTP_HOST;
  if (!smtpHost) {
    console.log("------------------------------------------");
    console.log(`[DEV MODE] Password reset requested for ${email}`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log("------------------------------------------");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
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
    subject: "Reset your Neki password",
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2>Reset Your Password</h2>
        <p>Click the button below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Reset Password
        </a>
        <p>Or copy this link: ${resetUrl}</p>
        <p style="color: #666; font-size: 12px;">This link expires in 15 minutes.</p>
      </div>
    `,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = normalizeEmail(email);

    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() 
      || req.headers.get("x-real-ip") 
      || "unknown";
    
    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Don't reveal if user exists
      return NextResponse.json({
        success: true,
        message: "If the email exists, a reset link has been sent",
      });
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString("hex");
    const tokenHash = hashToken(resetToken);
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store reset token in dedicated table
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: resetTokenExpiry,
      },
    });

    // Send reset email (fire & forget - don't await)
    sendResetEmail(normalizedEmail, resetToken).catch(console.error);

    return NextResponse.json({
      success: true,
      message: "If the email exists, a reset link has been sent",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
