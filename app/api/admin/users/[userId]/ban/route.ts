import { NextRequest, NextResponse } from "next/server";
import { UserStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isActiveUser } from "@/lib/user-access";
import { recordModerationEvent } from "@/lib/moderation-events";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await isActiveUser(session.user.id))) {
      return NextResponse.json({ error: "Account is not active" }, { status: 403 });
    }

    const { userId } = await params;
    const { reason } = await req.json();
    const trimmedReason = String(reason || "").trim();

    if (!trimmedReason) {
      return NextResponse.json({ error: "Reason is required" }, { status: 400 });
    }

    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot blacklist your own account" },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        status: true,
        name: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (targetUser.status === UserStatus.BLACKLISTED) {
      return NextResponse.json({ success: true, applied: false });
    }

    if (targetUser.role === "ADMIN") {
      const activeAdminCount = await prisma.user.count({
        where: {
          role: "ADMIN",
          status: UserStatus.ACTIVE,
          banned: false,
        },
      });

      if (activeAdminCount <= 1) {
        return NextResponse.json(
          { error: "Cannot blacklist the last active admin" },
          { status: 400 }
        );
      }
    }

    const now = new Date();
    const idempotencyKey = req.headers.get("x-idempotency-key");

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          status: UserStatus.BLACKLISTED,
          statusReason: trimmedReason,
          statusChangedAt: now,
          banned: true,
          banReason: trimmedReason,
        },
      });

      await recordModerationEvent(tx, {
        actionType: "ADMIN_BLACKLIST_USER",
        actorUserId: session.user.id,
        targetUserId: userId,
        reason: trimmedReason,
        idempotencyKey,
        notice: {
          userId,
          noticeType: "ACCOUNT_BLACKLISTED",
          title: "Your account has been blacklisted",
          body: trimmedReason,
          visibleFromLoginAt: now,
        },
      });
    });

    return NextResponse.json({ success: true, applied: true });
  } catch (error) {
    console.error("Error banning user:", error);
    return NextResponse.json(
      { error: "Failed to ban user" },
      { status: 500 }
    );
  }
}
