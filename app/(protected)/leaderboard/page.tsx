import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LeaderboardContent } from "./leaderboard-content";

export default async function LeaderboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const leaders = await prisma.user.findMany({
    where: {
      banned: false,
    },
    select: {
      id: true,
      name: true,
      image: true,
      points: true,
      _count: {
        select: {
          posts: true,
        },
      },
    },
    orderBy: {
      points: "desc",
    },
    take: 100,
  });

  const currentUserInTop100 = leaders.findIndex((u) => u.id === session.user.id) + 1;

  let currentUserRank = currentUserInTop100;

  if (currentUserRank === 0) {
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { points: true },
    });

    const userCountAbove = await prisma.user.count({
      where: {
        banned: false,
        points: {
          gt: currentUser?.points || 0,
        },
      },
    });
    currentUserRank = userCountAbove + 1;
  }

  return (
    <LeaderboardContent
      leaders={leaders}
      currentUserId={session.user.id}
      currentUserRank={currentUserRank}
    />
  );
}
