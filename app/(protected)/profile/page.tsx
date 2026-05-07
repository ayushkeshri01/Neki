import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateUserStats } from "@/lib/utils";
import { ProfileContent } from "./profile-content";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      posts: {
        where: {
          status: {
            in: ["VISIBLE", "HIDDEN"],
          },
        },
        include: {
          communities: {
            include: {
              community: {
                select: { id: true, name: true, slug: true },
              },
            },
          },
          likes: { select: { userId: true, type: true } },
          _count: { select: { likes: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      memberships: {
        include: {
          community: {
            select: { id: true, name: true, slug: true, _count: { select: { members: true } } },
          },
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const stats = calculateUserStats(user.posts, user.memberships);

  return <ProfileContent user={user} stats={stats} />;
}
