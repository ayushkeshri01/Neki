import { prisma } from "@/lib/prisma";
import { AdminPostsContent } from "./admin-posts-content";

export default async function AdminPostsPage() {
  const posts = await prisma.post.findMany({
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          points: true,
        },
      },
      communities: {
        include: {
          community: {
            select: { name: true },
          },
        },
      },
      _count: {
        select: {
          likes: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const serialized = posts.map(({ createdAt, ...rest }) => ({
    ...rest,
    createdAt: createdAt.toISOString(),
  }));

  return <AdminPostsContent initialPosts={serialized} />;
}
