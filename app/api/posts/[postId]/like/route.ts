import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isActiveUser } from "@/lib/user-access";
import { parseReactionId, toDbReaction } from "@/lib/reactions";
import { requireCommunityScopedPost } from "../../access";

/**
 * POST /api/posts/:postId/like
 *
 * Body: { reaction?: "like" | "celebrate" | "love" | "insightful" | "support" | null }
 *
 * - If `reaction` is a valid reaction id   → upsert the user's reaction with that type
 * - If `reaction` is null                   → remove the user's reaction
 * - If body is missing / unrecognized       → toggle (legacy behavior)
 */
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
    const access = await requireCommunityScopedPost(postId, session.user.id);
    if (!access.ok) {
      return NextResponse.json(
        { error: access.error },
        { status: access.status }
      );
    }

    // Parse body — tolerate empty/invalid bodies for legacy callers.
    let body: unknown = null;
    try {
      body = await req.json();
    } catch {
      body = null;
    }

    const explicitlyNull =
      body !== null &&
      typeof body === "object" &&
      "reaction" in (body as Record<string, unknown>) &&
      (body as Record<string, unknown>).reaction === null;

    const requestedReaction =
      body && typeof body === "object"
        ? parseReactionId((body as Record<string, unknown>).reaction)
        : null;

    const existing = await prisma.like.findUnique({
      where: {
        userId_postId: { userId: session.user.id, postId },
      },
      select: { id: true, type: true },
    });

    // Decision tree:
    // - explicit null         → remove
    // - valid reaction        → upsert with that type
    // - no body / invalid     → toggle off if exists, otherwise default LIKE
    let result: { reacted: boolean; reaction: string | null };

    if (explicitlyNull) {
      if (existing) {
        await prisma.like.delete({ where: { id: existing.id } });
      }
      result = { reacted: false, reaction: null };
    } else if (requestedReaction) {
      const dbType = toDbReaction(requestedReaction);
      await prisma.like.upsert({
        where: { userId_postId: { userId: session.user.id, postId } },
        create: { userId: session.user.id, postId, type: dbType },
        update: { type: dbType },
      });
      result = { reacted: true, reaction: requestedReaction };
    } else {
      // Legacy toggle path
      if (existing) {
        await prisma.like.delete({ where: { id: existing.id } });
        result = { reacted: false, reaction: null };
      } else {
        await prisma.like.create({
          data: { userId: session.user.id, postId, type: "LIKE" },
        });
        result = { reacted: true, reaction: "like" };
      }
    }

    revalidatePath("/");
    revalidatePath("/feed");

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error toggling reaction:", error);
    return NextResponse.json(
      { error: "Failed to toggle reaction" },
      { status: 500 }
    );
  }
}
