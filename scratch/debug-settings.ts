import { prisma } from "../lib/prisma";

async function main() {
  const settings = await prisma.appSettings.findFirst();
  console.log("Current App Settings:", JSON.stringify(settings, null, 2));
}

main().catch(console.error);
