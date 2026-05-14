import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const communities = await prisma.community.findMany();
  console.log("Communities in DB:");
  communities.forEach(c => {
    console.log(`- ${c.name} (${c.slug}): ${c.image}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
