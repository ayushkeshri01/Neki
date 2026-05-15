import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes, createHash } from "crypto";
import nodemailer from "nodemailer";
import path from "path";
import { normalizeEmail } from "@/lib/registration-token";

import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 3;

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
    from: `"Neki" <${process.env.SMTP_FROM || "noreply@neki.example.com"}>`,
    to: email,
    subject: "Reset your Neki password",
    attachments: [
      {
        filename: 'logo.png',
        path: path.join(process.cwd(), 'public', 'logo.png'),
        cid: 'neki-logo'
      }
    ],
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          @media (prefers-color-scheme: dark) {
            .body-bg { background-color: #0f172a !important; }
            .card-bg { background-color: #1e293b !important; border-color: #334155 !important; }
            .text-main { color: #f1f5f9 !important; }
            .text-muted { color: #94a3b8 !important; }
            .footer-bg { background-color: #1e293b !important; border-top-color: #334155 !important; }
          }
        </style>
      </head>
      <body class="body-bg" style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc;">
        <div class="card-bg" style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #16a34a; padding: 25px; text-align: center;">
            <img src="cid:neki-logo" alt="Neki Logo" style="width: 70px; height: 70px; border-radius: 15px; display: block; margin: 0 auto; background-color: #ffffff; padding: 4px;" />
            <div style="margin-top: 12px; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.025em;">Neki</div>
          </div>
          <div style="padding: 40px 30px; text-align: center;">
            <h2 class="text-main" style="margin: 0 0 16px; font-size: 20px; color: #1e293b; font-weight: 600;">Reset your password</h2>
            <p class="text-muted" style="margin: 0 0 32px; font-size: 16px; line-height: 24px; color: #475569;">We received a request to reset your password. Click the button below to choose a new one. This link is valid for 15 minutes.</p>
            
            <a href="${resetUrl}" style="display: inline-block; background-color: #16a34a; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px; transition: background-color 0.2s;">
              Reset Password
            </a>
            
            <p class="text-muted" style="margin: 32px 0 0; font-size: 14px; color: #94a3b8;">If you didn't request a password reset, you can safely ignore this email.</p>
          </div>
          <div class="footer-bg" style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p class="text-muted" style="margin: 0; font-size: 12px; color: #64748b;">&copy; ${new Date().getFullYear()} Neki. Empowering community impact.</p>
          </div>
        </div>
      </body>
      </html>
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

    const clientIp = getClientIp(req);
    const normalizedEmail = normalizeEmail(email);
    
    if (!checkRateLimit(clientIp, MAX_REQUESTS_PER_WINDOW, RATE_LIMIT_WINDOW_MS)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }
    if (!checkRateLimit(`forgot-email-${normalizedEmail}`, 2, RATE_LIMIT_WINDOW_MS)) {
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
