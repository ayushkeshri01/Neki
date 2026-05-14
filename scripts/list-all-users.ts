import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, points: true, _count: { select: { posts: true } } },
    orderBy: { name: 'asc' }
  });

  console.log(`Found ${users.length} users:`);
  users.forEach(u => {
    console.log(`- ${u.name} (${u.email}): ${u.points} points, ${u._count.posts} posts`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
