import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { checkAndAwardBadges } from "@/lib/badges";
import { S3ServiceException } from "@aws-sdk/client-s3";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadToS3 } from "@/lib/s3";
import { isActiveUser } from "@/lib/user-access";
import {
  parsePostCommunityIds,
  validatePostContent,
  validatePostImages,
} from "./validation";

function revalidateCommunityPaths(slugs: string[]) {
  revalidatePath("/communities");
  for (const slug of slugs) {
    revalidatePath(`/communities/${slug}`);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await isActiveUser(session.user.id))) {
      return NextResponse.json({ error: "Account is not active" }, { status: 403 });
    }

    const formData = await req.formData();
    const contentResult = validatePostContent(formData.get("content"));
    if (!contentResult.ok) {
      return NextResponse.json(
        { error: contentResult.error },
        { status: contentResult.status }
      );
    }

    const imagesResult = validatePostImages(formData.getAll("images"));
    if (!imagesResult.ok) {
      return NextResponse.json(
        { error: imagesResult.error },
        { status: imagesResult.status }
      );
    }

    const communitiesResult = parsePostCommunityIds(formData.get("communities"));
    if (!communitiesResult.ok) {
      return NextResponse.json(
        { error: communitiesResult.error },
        { status: communitiesResult.status }
      );
    }

    const communities = communitiesResult.value;
    const existingCommunities = await prisma.community.findMany({
      where: {
        id: { in: communities },
      },
      select: {
        id: true,
        slug: true,
      },
    });

    if (existingCommunities.length !== communities.length) {
      return NextResponse.json(
        { error: "One or more selected communities were not found" },
        { status: 404 }
      );
    }

    const memberships = await prisma.communityMember.findMany({
      where: {
        userId: session.user.id,
        communityId: { in: communities },
      },
      select: { communityId: true },
    });

    if (memberships.length !== communities.length) {
      return NextResponse.json(
        { error: "You must be a member of all selected communities" },
        { status: 403 }
      );
    }

    const imageUrls = await Promise.all(
      imagesResult.value
        .filter((image) => image.size > 0)
        .map(async (image) => {
          const buffer = Buffer.from(await image.arrayBuffer());
          return uploadToS3(
            buffer,
            image.name,
            image.type || "image/jpeg"
          );
        })
    );

    const post = await prisma.$transaction(async (tx) => {
      // Check if this is the user's first post
      const existingPostCount = await tx.post.count({
        where: { authorId: session.user.id },
      });
      const isFirstPost = existingPostCount === 0;

      const newPost = await tx.post.create({
        data: {
          content: contentResult.value,
          images: imageUrls,
          authorId: session.user.id,
          points: 50,
          communities: {
            create: communities.map((communityId: string) => ({
              communityId,
            })),
          },
        },
      });

      await tx.user.update({
        where: { id: session.user.id },
        data: { points: { increment: 50 } },
      });

      // Award "First Post" badge and send appreciation for first-time posters
      if (isFirstPost) {
        const currentUser = await tx.user.findUnique({
          where: { id: session.user.id },
          select: { badges: true },
        });
        if (!currentUser?.badges.includes("FIRST_POST")) {
          await tx.user.update({
            where: { id: session.user.id },
            data: { badges: { push: "FIRST_POST" } },
          });
        }

        await tx.userNotice.create({
          data: {
            userId: session.user.id,
            auditId: newPost.id,
            noticeType: "ACHIEVEMENT_FIRST_POST",
            title: "Congratulations on Your First Post!",
            body: "Thank you for making your first contribution to the community. Every act of kindness makes a difference!",
            visibleFromLoginAt: new Date(),
          },
        });
      }

      // Create notifications for community members
      const author = await tx.user.findUnique({
        where: { id: session.user.id },
        select: { name: true },
      });
      const communityDetails = await tx.community.findMany({
        where: { id: { in: communities } },
        select: { name: true },
      });
      const communityNames = communityDetails.map((c) => c.name).join(", ");
      const authorName = author?.name || "Someone";
      const noticeTitle = `${authorName} posted in ${communityNames}`;
      const noticeBody = `Check out the latest post in your communities.`;

      const memberIds = await tx.communityMember.findMany({
        where: {
          communityId: { in: communities },
          userId: { not: session.user.id },
        },
        select: { 
          userId: true, 
        },
        distinct: ["userId"],
      });

      await tx.userNotice.createMany({
        data: memberIds.map((m) => ({
          userId: m.userId,
          auditId: newPost.id,
          noticeType: "ADMIN_MESSAGE",
          title: noticeTitle,
          body: noticeBody,
          visibleFromLoginAt: new Date(),
        })),
      });

      return newPost;
    });

    revalidatePath("/");
    revalidatePath("/feed");
    revalidatePath("/leaderboard");
    revalidateCommunityPaths(existingCommunities.map((community) => community.slug));

    try {
      await checkAndAwardBadges(session.user.id);
    } catch (badgeError) {
      console.error("Error awarding badges (non-fatal):", badgeError);
    }

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);

    if (error instanceof S3ServiceException) {
      if (error.name === "AccessDenied") {
        return NextResponse.json(
          {
            error:
              "Image upload denied by S3. Check IAM user permissions, bucket policy, and bucket region settings.",
          },
          { status: 502 }
        );
      }

      return NextResponse.json(
        { error: `Image upload failed (${error.name})` },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await isActiveUser(session.user.id))) {
      return NextResponse.json({ error: "Account is not active" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const communityId = searchParams.get("communityId");

    let communityIds: string[];

    if (communityId) {
      const community = await prisma.community.findUnique({
        where: { id: communityId },
        select: { id: true },
      });

      if (!community) {
        return NextResponse.json(
          { error: "Community not found" },
          { status: 404 }
        );
      }

      const membership = await prisma.communityMember.findUnique({
        where: {
          userId_communityId: {
            userId: session.user.id,
            communityId,
          },
        },
      });

      if (!membership) {
        return NextResponse.json(
          { error: "You are not a member of this community" },
          { status: 403 }
        );
      }

      communityIds = [communityId];
    } else {
      const userCommunities = await prisma.communityMember.findMany({
        where: { userId: session.user.id },
        select: { communityId: true },
      });
      communityIds = userCommunities.map((c) => c.communityId);
    }

    const posts = await prisma.post.findMany({
      where: {
        status: { in: ["VISIBLE", "HIDDEN"] },
        communities: {
          some: { communityId: { in: communityIds } },
        },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            points: true,
          },
        },
        communities: {
          include: {
            community: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
        likes: { 
          select: { 
            userId: true, 
            type: true,
            user: {
              select: {
                name: true,
                image: true,
              }
            }
          } 
        },
        _count: { select: { likes: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
