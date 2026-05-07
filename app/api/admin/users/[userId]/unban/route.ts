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
    const idempotencyKey = req.headers.get("x-idempotency-key");

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        status: true,
        banned: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (targetUser.status === UserStatus.ACTIVE && !targetUser.banned) {
      return NextResponse.json({ success: true, applied: false });
    }

    const now = new Date();

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          status: UserStatus.ACTIVE,
          statusReason: null,
          statusChangedAt: now,
          banned: false,
          banReason: null,
        },
      });

      await recordModerationEvent(tx, {
        actionType: "ADMIN_REINSTATE_USER",
        actorUserId: session.user.id,
        targetUserId: userId,
        reason: "Account reinstated",
        idempotencyKey,
        notice: {
          userId,
          noticeType: "ACCOUNT_REINSTATED",
          title: "Your account has been reinstated",
          body: "An administrator restored your account access.",
          visibleFromLoginAt: now,
        },
      });
    });

    return NextResponse.json({ success: true, applied: true });
  } catch (error) {
    console.error("Error unbanning user:", error);
    return NextResponse.json(
      { error: "Failed to unban user" },
      { status: 500 }
    );
  }
}
