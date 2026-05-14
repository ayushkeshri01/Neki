import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { name: { contains: "ayush", mode: "insensitive" } },
        { email: { contains: "ayush", mode: "insensitive" } }
      ]
    },
    include: {
      _count: { select: { posts: true } }
    }
  });

  if (!user) {
    console.log("User not found");
    return;
  }

  console.log(`User: ${user.name} (${user.email})`);
  console.log(`Points: ${user.points}`);
  console.log(`Posts count: ${user._count.posts}`);
  
  const posts = await prisma.post.findMany({
    where: { authorId: user.id },
    select: { id: true, points: true, createdAt: true }
  });
  
  console.log("Posts:");
  posts.forEach(p => {
    console.log(`- Post ${p.id}: ${p.points} points, created at ${p.createdAt}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
