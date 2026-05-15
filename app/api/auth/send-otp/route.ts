import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import path from "path";
import { prisma } from "@/lib/prisma";
import { normalizeEmail } from "@/lib/registration-token";
import { randomInt } from "crypto";
import { getOrCreateSettings } from "@/lib/settings";
import { isSignupEmailDomainAllowed } from "@/lib/user-access";

import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 3;

function getDomainFromEmail(email: string): string {
  return email.split("@")[1] || "";
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const clientIp = getClientIp(req);

    if (!checkRateLimit(clientIp, MAX_REQUESTS_PER_WINDOW, RATE_LIMIT_WINDOW_MS)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const normalizedEmail = normalizeEmail(email);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const settings = await getOrCreateSettings();
    const emailDomain = getDomainFromEmail(normalizedEmail);

    if (!isSignupEmailDomainAllowed(emailDomain, settings.allowedDomains)) {
      return NextResponse.json(
        { error: `The domain @${emailDomain} is not authorized for registration.` },
        { status: 403 }
      );
    }

    const existingOtp = await prisma.oTP.findFirst({
      where: { email: normalizedEmail },
      orderBy: { createdAt: "desc" },
      select: { expiresAt: true },
    });

    if (existingOtp && existingOtp.expiresAt > new Date(Date.now() + 9 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Please wait before requesting a new code" },
        { status: 429 }
      );
    }

    await prisma.registrationToken.updateMany({
      where: {
        email: normalizedEmail,
        status: "ACTIVE",
      },
      data: {
        status: "REVOKED",
        revokedAt: new Date(),
        revokedReason: "NEW_OTP_ISSUED",
      },
    });

    // Generate 6-digit code using crypto
    const code = randomInt(100000, 999999).toString();

    // Store in DB, expires in 10 minutes
    await prisma.oTP.deleteMany({ where: { email: normalizedEmail } });
    await prisma.oTP.create({
      data: {
        email: normalizedEmail,
        code,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
      },
    });

    if (process.env.SMTP_HOST) {
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
          from: `"Neki" <${process.env.SMTP_FROM || "noreply@neki.example.com"}>`,
          to: normalizedEmail,
          subject: "Your Neki Login Code",
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
                  .text-primary { color: #22c55e !important; }
                  .text-muted { color: #94a3b8 !important; }
                  .text-main { color: #f1f5f9 !important; }
                  .otp-bg { background-color: #0f172a !important; border-color: #22c55e !important; }
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
                  <h2 class="text-main" style="margin: 0 0 16px; font-size: 20px; color: #1e293b; font-weight: 600;">Verify your email</h2>
                  <p class="text-muted" style="margin: 0 0 32px; font-size: 16px; line-height: 24px; color: #475569;">Use the code below to sign in. This code is valid for 10 minutes.</p>
                  
                  <div class="otp-bg" style="display: inline-block; padding: 16px 32px; background-color: #f0fdf4; border: 2px dashed #16a34a; border-radius: 12px;">
                    <span class="text-primary" style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #16a34a; padding-left: 8px;">${code}</span>
                  </div>
                  
                  <p class="text-muted" style="margin: 32px 0 0; font-size: 14px; color: #94a3b8;">If you didn't request this code, you can safely ignore this email.</p>
                </div>
                <div class="footer-bg" style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                  <p class="text-muted" style="margin: 0; font-size: 12px; color: #64748b;">&copy; ${new Date().getFullYear()} Neki. Empowering community impact.</p>
                </div>
              </div>
            </body>
            </html>
          `,
        });
    } else {
      console.log(`[DEV MODE] OTP generated for ${normalizedEmail}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return NextResponse.json({ error: "Failed to send code" }, { status: 500 });
  }
}
