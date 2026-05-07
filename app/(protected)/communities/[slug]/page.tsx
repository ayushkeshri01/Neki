import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CommunityPageContent } from "./community-page-content";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function CommunityPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const community = await prisma.community.findUnique({
    where: { slug },
    include: {
      _count: {
        select: {
          members: true,
          posts: true,
        },
      },
      admin: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  if (!community) {
    notFound();
  }

  const membership = await prisma.communityMember.findUnique({
    where: {
      userId_communityId: {
        userId: session.user.id,
        communityId: community.id,
      },
    },
  });

  const isMember = !!membership;

  const posts = await prisma.post.findMany({
    where: {
      communities: {
        some: {
          communityId: community.id,
        },
      },
      status: { in: isMember ? ["VISIBLE", "HIDDEN"] : ["VISIBLE"] },
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
      likes: { select: { userId: true } },
      _count: { select: { likes: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <CommunityPageContent
      community={community}
      posts={posts}
      isMember={isMember}
      currentUserId={session.user.id}
      isAdmin={session.user.role === "ADMIN"}
    />
  );
}
