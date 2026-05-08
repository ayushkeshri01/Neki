import { prisma } from "@/lib/prisma";

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "milestone" | "engagement" | "community" | "special";
}

export const BADGE_DEFINITIONS: Record<string, BadgeDefinition> = {
  FIRST_POST: {
    id: "FIRST_POST",
    name: "First Light",
    description: "Made your first post",
    icon: "Sparkles",
    category: "milestone",
  },
  HELPING_HAND: {
    id: "HELPING_HAND",
    name: "Helping Hand",
    description: "Posted 10 times",
    icon: "Heart",
    category: "milestone",
  },
  COMMUNITY_PILLAR: {
    id: "COMMUNITY_PILLAR",
    name: "Community Pillar",
    description: "Posted 50 times",
    icon: "Building2",
    category: "milestone",
  },
  CHANGEMAKER: {
    id: "CHANGEMAKER",
    name: "Changemaker",
    description: "Posted 100 times",
    icon: "Zap",
    category: "milestone",
  },
  LEGACY_BUILDER: {
    id: "LEGACY_BUILDER",
    name: "Legacy Builder",
    description: "Posted 500 times",
    icon: "Landmark",
    category: "milestone",
  },
  SPARK: {
    id: "SPARK",
    name: "Spark",
    description: "Earned 500 GDCs",
    icon: "Flame",
    category: "milestone",
  },
  TORCHBEARER: {
    id: "TORCHBEARER",
    name: "Torchbearer",
    description: "Earned 2,500 GDCs",
    icon: "Trophy",
    category: "milestone",
  },
  BEACON: {
    id: "BEACON",
    name: "Beacon",
    description: "Earned 10,000 GDCs",
    icon: "Lightbulb",
    category: "milestone",
  },
  LIGHTHOUSE: {
    id: "LIGHTHOUSE",
    name: "Lighthouse",
    description: "Earned 50,000 GDCs",
    icon: "Award",
    category: "milestone",
  },
  HEARTFELT: {
    id: "HEARTFELT",
    name: "Heartfelt",
    description: "Received 100 LOVE reactions",
    icon: "Heart",
    category: "engagement",
  },
  THOUGHT_LEADER: {
    id: "THOUGHT_LEADER",
    name: "Thought Leader",
    description: "Received 50 INSIGHTFUL reactions",
    icon: "MessageSquare",
    category: "engagement",
  },
  SUPPORTER: {
    id: "SUPPORTER",
    name: "Supporter",
    description: "Received 100 SUPPORT reactions",
    icon: "ThumbsUp",
    category: "engagement",
  },
  CELEBRATED: {
    id: "CELEBRATED",
    name: "Celebrated",
    description: "Received 50 CELEBRATE reactions",
    icon: "PartyPopper",
    category: "engagement",
  },
  RISING_STAR: {
    id: "RISING_STAR",
    name: "Rising Star",
    description: "Received 1,000 total reactions",
    icon: "Star",
    category: "engagement",
  },
  EXPLORER: {
    id: "EXPLORER",
    name: "Explorer",
    description: "Joined 3 communities",
    icon: "Compass",
    category: "community",
  },
  BRIDGE_BUILDER: {
    id: "BRIDGE_BUILDER",
    name: "Bridge Builder",
    description: "Joined 10 communities",
    icon: "Users",
    category: "community",
  },
  AMBASSADOR: {
    id: "AMBASSADOR",
    name: "Ambassador",
    description: "Posted in 5 different communities",
    icon: "Globe",
    category: "community",
  },
  PURE_INTENT: {
    id: "PURE_INTENT",
    name: "Pure Intent",
    description: "Posted 10+ times with zero reports",
    icon: "Shield",
    category: "special",
  },
};

interface BadgeCheckData {
  postCount: number;
  points: number;
  memberCount: number;
  distinctCommunityPosts: number;
  loveCount: number;
  insightfulCount: number;
  supportCount: number;
  celebrateCount: number;
  totalReactions: number;
  reportCount: number;
}

const BADGE_CHECKS: { id: string; check: (d: BadgeCheckData) => boolean }[] = [
  { id: "FIRST_POST", check: (d) => d.postCount >= 1 },
  { id: "HELPING_HAND", check: (d) => d.postCount >= 10 },
  { id: "COMMUNITY_PILLAR", check: (d) => d.postCount >= 50 },
  { id: "CHANGEMAKER", check: (d) => d.postCount >= 100 },
  { id: "LEGACY_BUILDER", check: (d) => d.postCount >= 500 },
  { id: "SPARK", check: (d) => d.points >= 500 },
  { id: "TORCHBEARER", check: (d) => d.points >= 2500 },
  { id: "BEACON", check: (d) => d.points >= 10000 },
  { id: "LIGHTHOUSE", check: (d) => d.points >= 50000 },
  { id: "HEARTFELT", check: (d) => d.loveCount >= 100 },
  { id: "THOUGHT_LEADER", check: (d) => d.insightfulCount >= 50 },
  { id: "SUPPORTER", check: (d) => d.supportCount >= 100 },
  { id: "CELEBRATED", check: (d) => d.celebrateCount >= 50 },
  { id: "RISING_STAR", check: (d) => d.totalReactions >= 1000 },
  { id: "EXPLORER", check: (d) => d.memberCount >= 3 },
  { id: "BRIDGE_BUILDER", check: (d) => d.memberCount >= 10 },
  { id: "AMBASSADOR", check: (d) => d.distinctCommunityPosts >= 5 },
  { id: "PURE_INTENT", check: (d) => d.postCount >= 10 && d.reportCount === 0 },
];

export async function checkAndAwardBadges(userId: string): Promise<string[]> {
  const [user, postCount, memberCount, reactionData, communityPosts, reportCount] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { badges: true, points: true },
      }),
      prisma.post.count({
        where: { authorId: userId, status: { in: ["VISIBLE", "HIDDEN"] } },
      }),
      prisma.communityMember.count({
        where: { userId },
      }),
      prisma.like.groupBy({
        by: ["type"],
        where: { post: { authorId: userId } },
        _count: true,
      }),
      prisma.communityPost.groupBy({
        by: ["communityId"],
        where: { post: { authorId: userId } },
      }),
      prisma.report.count({
        where: { post: { authorId: userId } },
      }),
    ]);

  if (!user) return [];

  const existingBadges = new Set(user.badges);

  let loveCount = 0;
  let insightfulCount = 0;
  let supportCount = 0;
  let celebrateCount = 0;
  let totalReactions = 0;

  for (const r of reactionData) {
    totalReactions += r._count;
    switch (r.type) {
      case "LOVE":
        loveCount = r._count;
        break;
      case "INSIGHTFUL":
        insightfulCount = r._count;
        break;
      case "SUPPORT":
        supportCount = r._count;
        break;
      case "CELEBRATE":
        celebrateCount = r._count;
        break;
      default:
        if (process.env.NODE_ENV === "development") {
          console.warn(`Unknown reaction type: ${r.type}`);
        }
        break;
    }
  }

  const data: BadgeCheckData = {
    postCount,
    points: user.points,
    memberCount,
    distinctCommunityPosts: communityPosts.length,
    loveCount,
    insightfulCount,
    supportCount,
    celebrateCount,
    totalReactions,
    reportCount,
  };

  const newlyEarned: string[] = [];

  for (const badge of BADGE_CHECKS) {
    if (existingBadges.has(badge.id)) continue;
    if (badge.check(data)) {
      newlyEarned.push(badge.id);
    }
  }

  if (newlyEarned.length > 0) {
    await prisma.$transaction(async (tx) => {
      const currentUser = await tx.user.findUnique({
        where: { id: userId },
        select: { badges: true },
      });

      const actuallyNew = newlyEarned.filter(
        (id) => !currentUser?.badges.includes(id)
      );

      if (actuallyNew.length > 0) {
        await tx.user.update({
          where: { id: userId },
          data: { badges: { push: actuallyNew } },
        });
      }
    });
  }

  return newlyEarned;
}
