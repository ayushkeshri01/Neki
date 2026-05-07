import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isActiveUser } from "@/lib/user-access";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ communityId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await isActiveUser(session.user.id))) {
      return NextResponse.json({ error: "Account is not active" }, { status: 403 });
    }

    const { communityId } = await params;
    const { name, slug, description } = await req.json();

    const updateData: { name?: string; slug?: string; description?: string | null } = {};

    if (typeof name === "string" && name.trim()) {
      updateData.name = name.trim();
    }

    if (typeof slug === "string" && slug.trim()) {
      updateData.slug = slug.trim().toLowerCase().replace(/\s+/g, "-");
    }

    if (typeof description === "string") {
      updateData.description = description.trim() || null;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Name, slug, or description is required" },
        { status: 400 }
      );
    }

    // Check if slug already exists (for other communities)
    if (updateData.slug) {
      const existing = await prisma.community.findFirst({
        where: {
          slug: updateData.slug,
          id: { not: communityId },
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: "Slug already in use" },
          { status: 400 }
        );
      }
    }

    const community = await prisma.community.update({
      where: { id: communityId },
      data: updateData,
      select: { id: true, name: true, slug: true },
    });

    return NextResponse.json(community);
  } catch (error) {
    console.error("Error updating community:", error);
    return NextResponse.json(
      { error: "Failed to update community" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ communityId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await isActiveUser(session.user.id))) {
      return NextResponse.json({ error: "Account is not active" }, { status: 403 });
    }

    const { communityId } = await params;

    const community = await prisma.community.findUnique({
      where: { id: communityId },
      select: {
        id: true,
        _count: {
          select: {
            members: true,
            posts: true,
          },
        },
      },
    });

    if (!community) {
      return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }

    const deleteSummary = await prisma.$transaction(async (tx) => {
      const linkedPosts = await tx.communityPost.findMany({
        where: { communityId },
        select: { postId: true },
      });

      const linkedPostIds = Array.from(
        new Set(linkedPosts.map((post) => post.postId))
      );

      await tx.community.delete({
        where: { id: communityId },
      });

      let deletedChildPosts = 0;

      if (linkedPostIds.length > 0) {
        const orphanedPosts = await tx.post.findMany({
          where: {
            id: { in: linkedPostIds },
            communities: { none: {} },
          },
          select: { id: true },
        });

        if (orphanedPosts.length > 0) {
          const deleteResult = await tx.post.deleteMany({
            where: {
              id: {
                in: orphanedPosts.map((post) => post.id),
              },
            },
          });

          deletedChildPosts = deleteResult.count;
        }
      }

      return {
        membersRemoved: community._count.members,
        postLinksRemoved: community._count.posts,
        childPostsDeleted: deletedChildPosts,
        sharedPostsKept: Math.max(community._count.posts - deletedChildPosts, 0),
      };
    });

    return NextResponse.json({ success: true, details: deleteSummary });
  } catch (error) {
    console.error("Error deleting community:", error);
    return NextResponse.json(
      { error: "Failed to delete community" },
      { status: 500 }
    );
  }
}
