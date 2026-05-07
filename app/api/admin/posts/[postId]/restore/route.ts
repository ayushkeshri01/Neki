import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isActiveUser } from "@/lib/user-access";
import { getPostPointsDelta } from "@/lib/post-status";
import { recordModerationEvent } from "@/lib/moderation-events";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await isActiveUser(session.user.id))) {
      return NextResponse.json({ error: "Account is not active" }, { status: 403 });
    }

    const { postId } = await params;
    let reason = "Post restored by administrator";

    try {
      const body = await req.json();
      reason = String(body.reason || reason).trim() || reason;
    } catch {
      // no body passed
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        status: true,
        authorId: true,
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.status === "VISIBLE") {
      return NextResponse.json({ success: true, applied: false });
    }

    const now = new Date();
    const pointsDelta = getPostPointsDelta(post.status, "VISIBLE");
    const idempotencyKey = req.headers.get("x-idempotency-key");
    let applied = false;

    await prisma.$transaction(async (tx) => {
      const restoredResult = await tx.post.updateMany({
        where: {
          id: postId,
          status: {
            not: "VISIBLE",
          },
        },
        data: {
          status: "VISIBLE",
          points: 50,
          moderationReason: reason,
          moderatedAt: now,
        },
      });

      if (restoredResult.count === 0) {
        return;
      }

      if (pointsDelta !== 0) {
        await tx.user.update({
          where: { id: post.authorId },
          data: {
            points: { increment: pointsDelta },
          },
        });
      }

      applied = true;

      await recordModerationEvent(tx, {
        actionType: "ADMIN_RESTORE_POST",
        actorUserId: session.user.id,
        targetUserId: post.authorId,
        targetPostId: post.id,
        reason,
        idempotencyKey,
        notice: {
          userId: post.authorId,
          noticeType: "POST_RESTORED",
          title: "One of your posts was restored",
          body: reason,
          visibleFromLoginAt: now,
        },
      });
    });

    if (!applied) {
      return NextResponse.json({ success: true, applied: false });
    }

    revalidatePath("/feed");
    revalidatePath("/leaderboard");
    revalidatePath("/admin/posts");

    return NextResponse.json({ success: true, applied: true });
  } catch (error) {
    console.error("Error restoring post:", error);
    return NextResponse.json(
      { error: "Failed to restore post" },
      { status: 500 }
    );
  }
}
