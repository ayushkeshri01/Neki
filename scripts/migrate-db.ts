import { PrismaClient } from "@prisma/client";

const REMOTE_URL = process.env.OLD_DATABASE_URL;
const LOCAL_URL = process.env.NEW_DATABASE_URL || (() => { throw new Error("Set NEW_DATABASE_URL env var"); })();

if (!REMOTE_URL) {
  console.error("Set OLD_DATABASE_URL env var to the remote (Supabase) connection string");
  process.exit(1);
}

async function main() {
  console.log("Connecting to remote (source)...");
  const remote = new PrismaClient({ datasourceUrl: REMOTE_URL });
  await remote.$connect();

  console.log("Connecting to local (destination)...");
  const local = new PrismaClient({ datasourceUrl: LOCAL_URL });
  await local.$connect();

  // --- Read all data from remote ---
  console.log("\nReading data from remote...");
  const users = await remote.user.findMany();
  const accounts = await remote.account.findMany();
  const sessions = await remote.session.findMany();
  const verificationTokens = await remote.verificationToken.findMany();
  const communities = await remote.community.findMany();
  const communityMembers = await remote.communityMember.findMany();
  const posts = await remote.post.findMany();
  const communityPosts = await remote.communityPost.findMany();
  const likes = await remote.like.findMany();
  const reports = await remote.report.findMany();
  const appSettings = await remote.appSettings.findMany();
  const registrationTokens = await remote.registrationToken.findMany();
  const moderationAudits = await remote.moderationAudit.findMany();
  const userNotices = await remote.userNotice.findMany();
  const otps = await remote.oTP.findMany();
  const passwordResetTokens = await remote.passwordResetToken.findMany();

  console.log(`  Users: ${users.length}`);
  console.log(`  Accounts: ${accounts.length}`);
  console.log(`  Sessions: ${sessions.length}`);
  console.log(`  VerificationTokens: ${verificationTokens.length}`);
  console.log(`  Communities: ${communities.length}`);
  console.log(`  CommunityMembers: ${communityMembers.length}`);
  console.log(`  Posts: ${posts.length}`);
  console.log(`  CommunityPosts: ${communityPosts.length}`);
  console.log(`  Likes: ${likes.length}`);
  console.log(`  Reports: ${reports.length}`);
  console.log(`  AppSettings: ${appSettings.length}`);
  console.log(`  RegistrationTokens: ${registrationTokens.length}`);
  console.log(`  ModerationAudits: ${moderationAudits.length}`);
  console.log(`  UserNotices: ${userNotices.length}`);
  console.log(`  OTPs: ${otps.length}`);
  console.log(`  PasswordResetTokens: ${passwordResetTokens.length}`);

  await remote.$disconnect();

  // --- Write to local ---
  console.log("\nWriting data to local...");

  // Order matters (FK dependencies):
  // 1. User (no FK)
  // 2. Community (FK->User.adminId), AppSettings (no FK), RegistrationToken (no FK)
  // 3. Account, Session, PasswordResetToken, OTP (FK->User)
  // 4. Post (FK->User)
  // 5. CommunityMember (FK->User,Community), CommunityPost (FK->Post,Community)
  // 6. Like, Report (FK->User,Post)
  // 7. ModerationAudit (FK->User), UserNotice (FK->User,ModerationAudit)

  // 1. Users
  if (users.length) {
    await local.user.createMany({ data: users as any });
    console.log(`  ✓ Users (${users.length})`);
  }

  // 2. Communities, AppSettings, RegistrationTokens
  if (communities.length) {
    await local.community.createMany({ data: communities as any });
    console.log(`  ✓ Communities (${communities.length})`);
  }
  if (appSettings.length) {
    await local.appSettings.createMany({ data: appSettings as any });
    console.log(`  ✓ AppSettings (${appSettings.length})`);
  }
  if (registrationTokens.length) {
    await local.registrationToken.createMany({ data: registrationTokens as any });
    console.log(`  ✓ RegistrationTokens (${registrationTokens.length})`);
  }

  // 3. Account, Session, PasswordResetToken, OTP
  if (accounts.length) {
    await local.account.createMany({ data: accounts as any });
    console.log(`  ✓ Accounts (${accounts.length})`);
  }
  if (sessions.length) {
    await local.session.createMany({ data: sessions as any });
    console.log(`  ✓ Sessions (${sessions.length})`);
  }
  if (passwordResetTokens.length) {
    await local.passwordResetToken.createMany({ data: passwordResetTokens as any });
    console.log(`  ✓ PasswordResetTokens (${passwordResetTokens.length})`);
  }
  if (otps.length) {
    await local.oTP.createMany({ data: otps as any });
    console.log(`  ✓ OTPs (${otps.length})`);
  }

  // 4. Posts
  if (posts.length) {
    await local.post.createMany({ data: posts as any });
    console.log(`  ✓ Posts (${posts.length})`);
  }

  // 5. CommunityMembers, CommunityPosts
  if (communityMembers.length) {
    await local.communityMember.createMany({ data: communityMembers as any });
    console.log(`  ✓ CommunityMembers (${communityMembers.length})`);
  }
  if (communityPosts.length) {
    await local.communityPost.createMany({ data: communityPosts as any });
    console.log(`  ✓ CommunityPosts (${communityPosts.length})`);
  }

  // 6. Likes, Reports
  if (likes.length) {
    await local.like.createMany({ data: likes as any });
    console.log(`  ✓ Likes (${likes.length})`);
  }
  if (reports.length) {
    await local.report.createMany({ data: reports as any });
    console.log(`  ✓ Reports (${reports.length})`);
  }

  // 7. ModerationAudits, UserNotices
  if (moderationAudits.length) {
    await local.moderationAudit.createMany({ data: moderationAudits as any });
    console.log(`  ✓ ModerationAudits (${moderationAudits.length})`);
  }
  if (userNotices.length) {
    await local.userNotice.createMany({ data: userNotices as any });
    console.log(`  ✓ UserNotices (${userNotices.length})`);
  }

  // VerificationToken
  if (verificationTokens.length) {
    await local.verificationToken.createMany({ data: verificationTokens as any });
    console.log(`  ✓ VerificationTokens (${verificationTokens.length})`);
  }

  // Fix auto-increment sequences
  console.log("\nFixing sequences...");
  const tables_seq = [
    // Only needed if using serial types; Prisma uses CUIDs so this is informational
  ];

  console.log("\nMigration complete!");

  await local.$disconnect();
}

main().catch((e) => {
  console.error("Migration failed:", e);
  process.exit(1);
});
