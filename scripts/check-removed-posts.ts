import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const posts = await prisma.post.findMany({
    where: {
      status: "REMOVED"
    },
    include: {
      author: { select: { email: true } }
    }
  });

  console.log(`Found ${posts.length} REMOVED posts:`);
  posts.forEach(p => {
    console.log(`- Post ${p.id} by ${p.author.email} (Status: ${p.status}, ModeratedAt: ${p.moderatedAt})`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
