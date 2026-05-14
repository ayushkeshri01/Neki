import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteFromS3 } from "@/lib/s3";
import { isActiveUser } from "@/lib/user-access";
import { recordModerationEvent } from "@/lib/moderation-events";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await isActiveUser(session.user.id))) {
      return NextResponse.json({ error: "Account is not active" }, { status: 403 });
    }

    const { postId } = await params;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        authorId: true,
        images: true,
        points: true,
        communities: {
          select: {
            community: {
              select: {
                slug: true,
              },
            },
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Only the author or admin can delete
    if (post.authorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete images from S3
    await Promise.all(post.images.map(deleteFromS3));

    const isAdminDeleting = session.user.role === "ADMIN" && post.authorId !== session.user.id;

    await prisma.$transaction(async (tx) => {
      // Revert points from the post author
      if (post.points > 0) {
        await tx.user.update({
          where: { id: post.authorId },
          data: { points: { decrement: post.points } },
        });
      }

      await tx.post.delete({
        where: { id: postId },
      });

      if (isAdminDeleting) {
        await recordModerationEvent(tx, {
          actionType: "ADMIN_REMOVE_POST",
          actorUserId: session.user.id,
          targetUserId: post.authorId,
          targetPostId: postId,
          reason: "Post deleted by administrator",
          notice: {
            userId: post.authorId,
            noticeType: "POST_REMOVED",
            title: "One of your posts was removed",
            body: "An administrator has removed your post for violating community guidelines.",
            visibleFromLoginAt: new Date(),
          },
        });
      }
    });

    if (post.points > 0) {
      revalidatePath("/leaderboard");
    }

    revalidatePath("/feed");
    revalidatePath("/communities");
    for (const communityPost of post.communities) {
      revalidatePath(`/communities/${communityPost.community.slug}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete post error:", error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await isActiveUser(session.user.id))) {
      return NextResponse.json({ error: "Account is not active" }, { status: 403 });
    }

    const { postId } = await params;
    const { content } = await req.json();

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { 
        authorId: true,
        communities: {
          select: {
            community: { select: { slug: true } }
          }
        }
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { content: content.trim() },
    });

    revalidatePath("/feed");
    for (const communityPost of post.communities) {
      revalidatePath(`/communities/${communityPost.community.slug}`);
    }

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("Edit post error:", error);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}
