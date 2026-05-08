import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isActiveUser } from "@/lib/user-access";
import { LeaderboardContent } from "./leaderboard-content";

interface LeaderRaw {
  id: string;
  name: string | null;
  image: string | null;
  points: number;
  postcount: number;
  likesreceived: number;
}

export default async function LeaderboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (!(await isActiveUser(session.user.id))) {
    redirect("/login");
  }

  const rawLeaders = await prisma.$queryRaw<LeaderRaw[]>`
    SELECT
      u.id,
      u.name,
      u.image,
      u.points,
      CAST(COUNT(DISTINCT p.id) AS INTEGER) as postcount,
      CAST(COUNT(DISTINCT l.id) AS INTEGER) as likesreceived
    FROM "User" u
    LEFT JOIN "Post" p ON p."authorId" = u.id AND p.status = 'VISIBLE'
    LEFT JOIN "Like" l ON l."postId" = p.id AND p.status = 'VISIBLE'
    WHERE u.banned = false
    GROUP BY u.id
    ORDER BY u.points DESC
    LIMIT 100
  `;

  const leaders = rawLeaders.map((u) => ({
    id: u.id,
    name: u.name,
    image: u.image,
    points: u.points,
    likesReceived: Number(u.likesreceived),
    _count: {
      posts: Number(u.postcount),
    },
  }));

  let currentUserRank = leaders.findIndex((u) => u.id === session.user.id) + 1;

  if (currentUserRank === 0) {
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { points: true },
    });

    const userScore = currentUser?.points ?? 0;

    const aboveCount = await prisma.$queryRaw<Array<{ count: number }>>`
      SELECT CAST(COUNT(*) AS INTEGER) as count
      FROM (
        SELECT u.id
        FROM "User" u
        LEFT JOIN "Post" p ON p."authorId" = u.id AND p.status = 'VISIBLE'
        LEFT JOIN "Like" l ON l."postId" = p.id AND p.status = 'VISIBLE'
        WHERE u.banned = false
        GROUP BY u.id
        HAVING u.points > ${userScore}
      ) above
    `;

    currentUserRank = (aboveCount[0]?.count ?? 0) + 1;
  }

  return (
    <LeaderboardContent
      leaders={leaders}
      currentUserId={session.user.id}
      currentUserRank={currentUserRank}
    />
  );
}
