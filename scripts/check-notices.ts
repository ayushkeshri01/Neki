import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const notices = await prisma.userNotice.findMany({
    orderBy: { createdAt: "desc" },
    take: 10
  });
  console.log(`Found ${notices.length} notices in DB:`);
  notices.forEach(n => {
    console.log(`- [${n.noticeType}] ${n.title} (User: ${n.userId}, Acknowledged: ${n.acknowledgedAt})`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
