import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminUsersContent } from "./admin-users-content";

export default async function AdminUsersPage() {
  const session = await auth();

  if (!session?.user) redirect("/login");

  const users = await prisma.user.findMany({
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

  const serialized = users.map(({ createdAt, ...rest }) => ({
    ...rest,
    createdAt: createdAt.toISOString(),
  }));

  return <AdminUsersContent initialUsers={serialized} currentUserId={session.user.id} />;
}
