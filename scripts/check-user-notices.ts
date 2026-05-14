import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: "ayush.keshri@vikasgroup.in" }
  });

  if (!user) {
    console.log("User not found");
    return;
  }

  const notices = await prisma.userNotice.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" }
  });

  console.log(`Found ${notices.length} notices for ${user.email}:`);
  notices.forEach(n => {
    console.log(`- [${n.noticeType}] ${n.title} (${n.createdAt})`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
