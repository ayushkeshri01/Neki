import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { AdminUsersContent } from "./admin-users-content";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const sp = await searchParams;
  const range = sp.range || "all";
  const from = sp.from;
  const to = sp.to;

  const where: any = {};

  if (range !== "all") {
    const now = new Date();
    const days = parseInt(range, 10);
    if (!isNaN(days)) {
      where.createdAt = {
        gte: new Date(now.getTime() - days * 24 * 60 * 60 * 1000),
      };
    }
  } else if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to);
  }

  // Fetch users with counts
  const users = await prisma.user.findMany({
    where,
    include: {
      _count: {
        select: {
          posts: true,
          memberships: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Fetch likes received for all users (filtered by user list to keep it efficient)
  const userIds = users.map((u) => u.id);
  const rawLikes =
    userIds.length > 0
      ? await prisma.$queryRaw<Array<{ authorId: string; count: number }>>`
    SELECT p."authorId", CAST(COUNT(l.id) AS INTEGER) as count
    FROM "Like" l
    JOIN "Post" p ON p.id = l."postId"
    WHERE p."authorId" IN (${userIds.join(",") === "" ? "''" : Prisma.join(userIds)})
    GROUP BY p."authorId"
  `
      : [];

  const likesMap = new Map(rawLikes.map((l) => [l.authorId, l.count]));

  const serialized = users.map(({ createdAt, ...rest }) => ({
    ...rest,
    createdAt: createdAt.toISOString(),
    likesReceived: Number(likesMap.get(rest.id) || 0),
  }));

  return (
    <AdminUsersContent
      initialUsers={serialized}
      currentUserId={session.user.id}
      filters={{ range, from, to }}
    />
  );
}
