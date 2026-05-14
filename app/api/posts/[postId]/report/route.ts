import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isActiveUser } from "@/lib/user-access";
import { requireCommunityScopedPost } from "../../access";
import { UserNoticeType } from "@prisma/client";

async function notifyAdmins(postId: string, reason: string) {
  // Find post and author details
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      content: true,
      author: {
        select: { name: true, email: true }
      }
    }
  });

  if (!post) return;

  const authorName = post.author.name || post.author.email || "Anonymous";
  const contentSnippet = post.content.length > 50 
    ? post.content.substring(0, 50) + "..." 
    : post.content;

  // Find all admins
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true },
  });

  if (admins.length === 0) return;

  // Create notices for each admin
  await prisma.userNotice.createMany({
    data: admins.map((admin) => ({
      userId: admin.id,
      noticeType: UserNoticeType.POST_REPORTED,
      title: "Impact Story Reported",
      body: `A post by ${authorName} was reported for: "${reason}".\n\nContent preview: "${contentSnippet}"`,
      payload: { postId, reason, authorName, contentSnippet },
      auditId: `${postId}_${Date.now()}`, // Make auditId unique to allow multiple reports
    })),
  });
}

export async function POST(
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
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Request body is invalid" },
        { status: 400 }
      );
    }

    const reason =
      typeof body === "object" && body !== null ? (body as { reason?: unknown }).reason : undefined;

    if (typeof reason !== "string" || !reason.trim()) {
      return NextResponse.json({ error: "Report reason is required" }, { status: 400 });
    }

    const access = await requireCommunityScopedPost(postId, session.user.id);
    if (!access.ok) {
      return NextResponse.json(
        { error: access.error },
        { status: access.status }
      );
    }

    const post = access.post;

    // Don't allow reporting own posts
    if (post.authorId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot report your own post" },
        { status: 400 }
      );
    }

    // Create or update report
    await prisma.report.upsert({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId,
        },
      },
      update: {
        reason: reason.trim(),
        status: "PENDING",
      },
      create: {
        userId: session.user.id,
        postId,
        reason: reason.trim(),
      },
    });

    // Notify admins
    await notifyAdmins(postId, reason.trim());

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reporting post:", error);
    return NextResponse.json(
      { error: "Failed to report post" },
      { status: 500 }
    );
  }
}
