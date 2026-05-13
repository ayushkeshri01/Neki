import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FeedContent } from "./feed-content";
import type { Post } from "./feed-content";

const PAGE_SIZE = 10;

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string }>;
}) {
  const session = await auth();
  const { cursor } = await searchParams;

  if (!session?.user) {
    redirect("/login");
  }

  const userCommunities = await prisma.communityMember.findMany({
    where: { userId: session.user.id },
    select: { communityId: true },
  });

  const communityIds = userCommunities.map((c) => c.communityId);

  const isAdmin = session.user.role === "ADMIN";

  const posts = await prisma.post.findMany({
    where: {
      status: isAdmin ? { in: ["VISIBLE", "HIDDEN"] } : "VISIBLE",
      communities: {
        some: {
          communityId: { in: communityIds },
        },
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
            select: {
              id: true,
              name: true,
              slug: true,
            },
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
        },
      },
      _count: {
        select: {
          likes: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE + 1,
    ...(cursor
      ? {
          cursor: { id: cursor },
          skip: 1,
        }
      : {}),
  });

  const hasMore = posts.length > PAGE_SIZE;
  const visiblePosts = posts.slice(0, PAGE_SIZE);
  const nextCursor = hasMore ? visiblePosts[visiblePosts.length - 1].id : undefined;

  const serializedPosts = visiblePosts.map(({ createdAt, ...rest }) => ({
    ...rest,
    createdAt: createdAt.toISOString(),
  }));

  return (
    <FeedContent
      posts={serializedPosts}
      currentUserId={session.user.id}
      isAdmin={isAdmin}
      hasMore={hasMore}
      nextCursor={nextCursor}
    />
  );
}
