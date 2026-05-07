import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
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
    const trimmedReason = String(reason || "").trim() || "Account removed by administrator";

    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot remove your own account" },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        status: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (targetUser.status === UserStatus.REMOVED) {
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
          { error: "Cannot remove the last active admin" },
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
          status: UserStatus.REMOVED,
          statusReason: trimmedReason,
          statusChangedAt: now,
          banned: true,
          banReason: trimmedReason,
          points: 0,
        },
      });

      await tx.post.updateMany({
        where: {
          authorId: userId,
          status: {
            not: "REMOVED",
          },
        },
        data: {
          status: "REMOVED",
          points: 0,
          moderationReason: "Removed due to account removal",
          moderatedAt: now,
        },
      });

      await recordModerationEvent(tx, {
        actionType: "ADMIN_REMOVE_USER",
        actorUserId: session.user.id,
        targetUserId: userId,
        reason: trimmedReason,
        idempotencyKey,
        notice: {
          userId,
          noticeType: "ACCOUNT_REMOVED",
          title: "Your account has been removed",
          body: trimmedReason,
          visibleFromLoginAt: now,
        },
      });
    });

    revalidatePath("/leaderboard");
    revalidatePath("/admin/users");

    return NextResponse.json({ success: true, applied: true });
  } catch (error) {
    console.error("Error removing user:", error);
    return NextResponse.json(
      { error: "Failed to remove user" },
      { status: 500 }
    );
  }
}
