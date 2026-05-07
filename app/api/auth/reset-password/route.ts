import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";
import { normalizeEmail } from "@/lib/registration-token";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, email, newPassword } = body;

    if (!token || !email || !newPassword) {
      return NextResponse.json(
        { error: "Token, email, and new password are required" },
        { status: 400 }
      );
    }

    if (typeof token !== "string" || typeof email !== "string" || typeof newPassword !== "string") {
      return NextResponse.json(
        { error: "Invalid input types" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const normalizedEmail = normalizeEmail(email);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    const tokenHash = hashToken(token);
    const now = new Date();
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.$transaction(async (tx) => {
      const resetTokenRecord = await tx.passwordResetToken.findFirst({
        where: {
          userId: user.id,
          tokenHash,
          used: false,
          expiresAt: {
            gte: now,
          },
        },
        select: {
          id: true,
        },
      });

      if (!resetTokenRecord) {
        throw new Error("INVALID_RESET_TOKEN");
      }

      const claimResult = await tx.passwordResetToken.updateMany({
        where: {
          id: resetTokenRecord.id,
          used: false,
          expiresAt: {
            gte: now,
          },
        },
        data: {
          used: true,
          usedAt: now,
        },
      });

      if (claimResult.count !== 1) {
        throw new Error("INVALID_RESET_TOKEN");
      }

      await tx.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_RESET_TOKEN") {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
