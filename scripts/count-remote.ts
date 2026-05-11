import { PrismaClient } from '@prisma/client';

async function main() {
  const remoteUrl = process.env.OLD_DATABASE_URL || process.env.DIRECT_URL;
  if (!remoteUrl) { console.error("OLD_DATABASE_URL or DIRECT_URL required"); process.exit(1); }

  const p = new PrismaClient({ datasourceUrl: remoteUrl });
  await p.$connect();

  const tables = ['User','Account','Session','VerificationToken','Community','CommunityMember','Post','CommunityPost','Like','Report','AppSettings','RegistrationToken','ModerationAudit','UserNotice','OTP','PasswordResetToken'];
  for (const t of tables) {
    const c = await (p as any)[t].count();
    console.log(`${t}: ${c}`);
  }

  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
