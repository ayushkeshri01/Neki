import { Suspense } from "react";
import {
  Activity,
  FileText,
  Heart,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { UserStatus, PostStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/admin/kpi-card";
import { LineChart, BarChart, DonutChart } from "@/components/admin/charts";
import { DashboardFilters } from "@/components/admin/dashboard-filters";
import { DashboardSkeleton } from "@/components/admin/dashboard-skeleton";

/* ---------- Helpers ---------- */

function pctChange(current: number, previous: number): number | undefined {
  if (previous === 0) {
    if (current === 0) return undefined;
    return 100;
  }
  return ((current - previous) / previous) * 100;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function shortLabel(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function buildDayBuckets(
  rangeDays: number,
  anchor: Date
): { key: string; label: string; date: Date }[] {
  const out: { key: string; label: string; date: Date }[] = [];
  for (let i = rangeDays - 1; i >= 0; i--) {
    const d = new Date(anchor);
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCDate(d.getUTCDate() - i);
    out.push({ key: dayKey(d), label: shortLabel(d), date: new Date(d) });
  }
  return out;
}

/* ---------- Page ---------- */

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardData searchParams={searchParams} />
    </Suspense>
  );
}

async function DashboardData({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const session = await auth();
  const sp = await searchParams;
  const rangeDays = Math.max(7, Math.min(365, parseInt(sp?.range || "30", 10) || 30));

  const now = new Date();
  const startCurrent = new Date(now.getTime() - rangeDays * 86_400_000);
  const startPrevious = new Date(now.getTime() - rangeDays * 2 * 86_400_000);
  const oneDayAgo = new Date(now.getTime() - 86_400_000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 86_400_000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86_400_000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 86_400_000);
  const earliestLoginNeeded = new Date(startCurrent.getTime() - 30 * 86_400_000);

  /* ---- Aggregate counts (parallel) ---- */
  const [
    totalUsers,
    usersBeforeCurrent,
    usersBeforePrevious,
    totalPosts,
    postsBeforeCurrent,
    postsBeforePrevious,
    totalLikes,
    likesCurrent,
    likesPrevious,
    dau,
    dauPrev,
    mau,
    mauPrev,
    bannedCount,
    hiddenPostsCount,
    activeCommunities,
    totalCommunityMemberships,
    newUsersInRange,
    postsInRange,
    likesInRange,
    likesInPreviousRange,
    loginsForCharts,
    topPosts,
    topUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { lt: startCurrent } } }),
    prisma.user.count({ where: { createdAt: { lt: startPrevious } } }),
    prisma.post.count(),
    prisma.post.count({ where: { createdAt: { lt: startCurrent } } }),
    prisma.post.count({ where: { createdAt: { lt: startPrevious } } }),
    prisma.like.count(),
    prisma.like.count({ where: { createdAt: { gte: startCurrent } } }),
    prisma.like.count({
      where: { createdAt: { gte: startPrevious, lt: startCurrent } },
    }),
    prisma.user.count({ where: { lastLoginAt: { gte: oneDayAgo } } }),
    prisma.user.count({
      where: { lastLoginAt: { gte: twoDaysAgo, lt: oneDayAgo } },
    }),
    prisma.user.count({ where: { lastLoginAt: { gte: thirtyDaysAgo } } }),
    prisma.user.count({
      where: { lastLoginAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
    }),
    prisma.user.count({ where: { status: UserStatus.BLACKLISTED } }),
    prisma.post.count({ where: { status: PostStatus.HIDDEN } }),
    prisma.community.count(),
    prisma.communityMember.count(),
    prisma.user.findMany({
      where: { createdAt: { gte: startCurrent } },
      select: { createdAt: true },
    }),
    prisma.post.findMany({
      where: { createdAt: { gte: startCurrent } },
      select: { createdAt: true },
    }),
    // Distinct likers (and their like timestamps) in the current window —
    // used to compute Engagement Rate and the "active engagers" metric.
    prisma.like.findMany({
      where: { createdAt: { gte: startCurrent } },
      select: { userId: true, createdAt: true },
    }),
    // Likers in previous window for delta calculation
    prisma.like.findMany({
      where: { createdAt: { gte: startPrevious, lt: startCurrent } },
      select: { userId: true },
    }),
    prisma.user.findMany({
      where: { lastLoginAt: { gte: earliestLoginNeeded } },
      select: { id: true, lastLoginAt: true },
    }),
    prisma.post.findMany({
      take: 10,
      where: { status: "VISIBLE" },
      orderBy: [{ likes: { _count: "desc" } }, { createdAt: "desc" }],
      include: {
        author: { select: { id: true, name: true, image: true } },
        communities: {
          take: 1,
          include: { community: { select: { name: true, slug: true } } },
        },
        _count: { select: { likes: true, reports: true } },
      },
    }),
    prisma.user.findMany({
      take: 10,
      where: { status: "ACTIVE" },
      orderBy: { points: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        points: true,
        createdAt: true,
        _count: { select: { posts: true, likes: true, memberships: true } },
      },
    }),
  ]);

  /* ---- Derive KPIs ---- */
  const newUsersCurrent = totalUsers - usersBeforeCurrent;
  const newUsersPrevious = usersBeforeCurrent - usersBeforePrevious;
  const totalUsersDelta = pctChange(newUsersCurrent, newUsersPrevious);

  const dauDelta = pctChange(dau, dauPrev);
  const mauDelta = pctChange(mau, mauPrev);

  const newPostsCurrent = totalPosts - postsBeforeCurrent;
  const newPostsPrevious = postsBeforeCurrent - postsBeforePrevious;
  const totalPostsDelta = pctChange(newPostsCurrent, newPostsPrevious);

  // Distinct active engagers = users who liked at least once in the current window
  const activeEngagersSet = new Set(likesInRange.map((l) => l.userId));
  const activeEngagers = activeEngagersSet.size;
  const prevEngagersSet = new Set(likesInPreviousRange.map((l) => l.userId));
  const prevEngagers = prevEngagersSet.size;
  const engagersDelta = pctChange(activeEngagers, prevEngagers);

  // Engagement Rate = % of monthly-active users who engaged (liked) in the window.
  // Falls back to 0 when there are no monthly active users yet.
  const engagementRate = mau > 0 ? (activeEngagers / mau) * 100 : 0;
  const prevEngagementRate = mauPrev > 0 ? (prevEngagers / mauPrev) * 100 : 0;
  const engagementRateDelta =
    prevEngagementRate > 0
      ? engagementRate - prevEngagementRate // absolute pp change
      : undefined;

  // Total Impact Actions in the current window = posts shared + likes given.
  // This is a simple, transparent "platform activity" volume metric.
  const impactCurrent = newPostsCurrent + likesCurrent;
  const impactPrevious = newPostsPrevious + likesPrevious;
  const impactDelta = pctChange(impactCurrent, impactPrevious);

  /* ---- Time series ---- */
  const buckets = buildDayBuckets(rangeDays, now);
  const newUsersByDay = new Map<string, number>(buckets.map((b) => [b.key, 0]));
  const dauByDay = new Map<string, number>(buckets.map((b) => [b.key, 0]));
  const postsByDay = new Map<string, number>(buckets.map((b) => [b.key, 0]));
  const likesByDay = new Map<string, number>(buckets.map((b) => [b.key, 0]));

  for (const u of newUsersInRange) {
    const k = dayKey(u.createdAt);
    if (newUsersByDay.has(k)) {
      newUsersByDay.set(k, (newUsersByDay.get(k) || 0) + 1);
    }
  }
  for (const l of loginsForCharts) {
    if (!l.lastLoginAt) continue;
    const k = dayKey(l.lastLoginAt);
    if (dauByDay.has(k)) dauByDay.set(k, (dauByDay.get(k) || 0) + 1);
  }
  for (const p of postsInRange) {
    const k = dayKey(p.createdAt);
    if (postsByDay.has(k)) postsByDay.set(k, (postsByDay.get(k) || 0) + 1);
  }
  for (const l of likesInRange) {
    const k = dayKey(l.createdAt);
    if (likesByDay.has(k)) likesByDay.set(k, (likesByDay.get(k) || 0) + 1);
  }

  // MAU rolling 30-day window per bucket
  const sortedLogins = loginsForCharts
    .map((u) => ({ id: u.id, t: u.lastLoginAt!.getTime() }))
    .filter((x) => Number.isFinite(x.t))
    .sort((a, b) => a.t - b.t);

  const mauSeries = buckets.map((b) => {
    const end = b.date.getTime() + 86_400_000;
    const start = end - 30 * 86_400_000;
    let count = 0;
    for (const x of sortedLogins) {
      if (x.t >= start && x.t < end) count++;
      else if (x.t >= end) break;
    }
    return { label: b.label, value: count };
  });

  const newUsersSeries = buckets.map((b) => ({
    label: b.label,
    value: newUsersByDay.get(b.key) || 0,
  }));
  const dauSeries = buckets.map((b) => ({
    label: b.label,
    value: dauByDay.get(b.key) || 0,
  }));
  const postsSeries = buckets.map((b) => ({
    label: b.label,
    value: postsByDay.get(b.key) || 0,
  }));
  const likesSeries = buckets.map((b) => ({
    label: b.label,
    value: likesByDay.get(b.key) || 0,
  }));

  /* ---- Acquisition sources (sample data placeholder — not based on tracked acquisition sources) ---- */
  const orgShare = Math.round(totalUsers * 0.62);
  const refShare = Math.round(totalUsers * 0.23);
  const socShare = Math.max(0, totalUsers - orgShare - refShare);
  const acquisition = [
    { label: "Organic", value: orgShare, color: "#6366f1" },
    { label: "Referral", value: refShare, color: "#10b981" },
    { label: "Social Media", value: socShare, color: "#f59e0b" },
  ];

  /* ---- Engagement metrics ---- */
  const avgPostsPerUser = totalUsers > 0 ? totalPosts / totalUsers : 0;
  const avgLikesPerPost = totalPosts > 0 ? totalLikes / totalPosts : 0;
  const likesPerActiveUser = mau > 0 ? likesCurrent / mau : 0;

  /* ---- KPI sparklines ---- */
  const usersSpark = newUsersSeries.map((s) => s.value);
  const dauSpark = dauSeries.map((s) => s.value);
  const mauSpark = mauSeries.map((s) => s.value);
  const postsSpark = postsSeries.map((s) => s.value);
  const likesSpark = likesSeries.map((s) => s.value);

  return (
    <div className="mx-auto max-w-container-max px-4 py-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-end justify-between gap-6 bg-card/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-border/40 shadow-premium">
        <div>
          <h1 className="font-display text-4xl font-black tracking-tight text-foreground">Analytics Overview</h1>
          <p className="text-muted-foreground font-medium mt-1">
            Impact intelligence and community growth metrics.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] px-4 py-1.5 uppercase tracking-widest flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Real-time Insights
          </Badge>
          <DashboardFilters currentRange={String(rangeDays)} />
        </div>
      </div>

      {/* SECTION 1 — KPIs */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          label="Total Users"
          value={formatNumber(totalUsers)}
          delta={totalUsersDelta}
          icon={Users}
          iconColor="text-primary"
          trend={usersSpark}
          trendColor="text-primary"
        />
        <KpiCard
          label="DAU"
          value={formatNumber(dau)}
          delta={dauDelta}
          icon={Activity}
          iconColor="text-primary"
          trend={dauSpark}
          trendColor="text-primary"
        />
        <KpiCard
          label="MAU"
          value={formatNumber(mau)}
          delta={mauDelta}
          icon={UsersRound}
          iconColor="text-primary"
          trend={mauSpark}
          trendColor="text-primary"
        />
        <KpiCard
          label="Total Posts"
          value={formatNumber(totalPosts)}
          delta={totalPostsDelta}
          icon={FileText}
          iconColor="text-primary"
          trend={postsSpark}
          trendColor="text-primary"
        />
        <KpiCard
          label="Engagement"
          value={`${engagementRate.toFixed(1)}%`}
          delta={engagementRateDelta}
          icon={UserCheck}
          iconColor="text-primary"
          trend={likesSpark}
          trendColor="text-primary"
          helper="of MAU engaged"
        />
        <KpiCard
          label="Impact Actions"
          value={formatNumber(impactCurrent)}
          delta={impactDelta}
          icon={Sparkles}
          iconColor="text-primary"
          helper="posts + likes"
        />
      </div>

      {/* SECTION 2 — Data Visualization */}
      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2 rounded-[2.5rem] border-border/40 shadow-premium overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between p-8 pb-4">
            <div>
              <CardTitle className="font-display text-xl font-black">User Growth</CardTitle>
              <CardDescription className="font-medium">Acquisition trends over time</CardDescription>
            </div>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <LineChart
              area
              series={[
                { name: "New Users", color: "var(--color-primary)", data: newUsersSeries },
              ]}
            />
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] border-border/40 shadow-premium overflow-hidden">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="font-display text-xl font-black">Acquisition</CardTitle>
            <CardDescription className="font-medium">Traffic source distribution</CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <DonutChart data={acquisition} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 rounded-[2.5rem] border-border/40 shadow-premium overflow-hidden">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="font-display text-xl font-black">Active Performance</CardTitle>
            <CardDescription className="font-medium">Ratio of daily to monthly participation</CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <LineChart
              area
              series={[
                { name: "Monthly Active", color: "#666666", data: mauSeries },
                { name: "Daily Active", color: "var(--color-primary)", data: dauSeries },
              ]}
            />
          </CardContent>
        </Card>
      </div>

      {/* SECTION 3 — Community Health */}
      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2 rounded-[2.5rem] border-border/40 shadow-premium overflow-hidden">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="font-display text-xl font-black">Content Cadence</CardTitle>
            <CardDescription className="font-medium">Posts shared per day</CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <BarChart data={postsSeries} color="var(--color-primary)" />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <MetricTile
            label="Avg posts / user"
            value={avgPostsPerUser.toFixed(2)}
            icon={FileText}
            tone="neutral"
          />
          <MetricTile
            label="Avg likes / post"
            value={avgLikesPerPost.toFixed(2)}
            icon={Heart}
            tone="neutral"
          />
          <MetricTile
            label="Engagement / User"
            value={likesPerActiveUser.toFixed(2)}
            icon={UserCheck}
            tone="neutral"
            sub={`${activeEngagers} active participants`}
          />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Top posts */}
        <Card className="rounded-[2.5rem] border-border/40 shadow-premium overflow-hidden">
          <CardHeader className="p-8 pb-4 border-b border-border/20">
            <CardTitle className="font-display text-xl font-black">High-Impact Posts</CardTitle>
            <CardDescription className="font-medium">Most celebrated community stories</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/20">
              {topPosts.length === 0 && (
                <p className="p-12 text-center text-muted-foreground font-bold italic">No stories documented yet.</p>
              )}
              {topPosts.map((p, idx) => (
                <Link
                  key={p.id}
                  href={`/admin/posts`}
                  className="flex items-start gap-4 p-6 transition-colors hover:bg-muted/30 group"
                >
                  <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-muted text-xs font-black group-hover:bg-primary group-hover:text-white transition-colors">
                    {idx + 1}
                  </span>
                  <Avatar className="h-10 w-10 shrink-0 border-2 border-border/40">
                    <AvatarImage src={p.author.image || ""} alt={p.author.name || ""} />
                    <AvatarFallback className="text-xs font-bold">
                      {p.author.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black group-hover:text-primary transition-colors">
                      {p.author.name || "Anonymous"}
                    </p>
                    <p className="line-clamp-1 text-sm text-muted-foreground font-medium">
                      {p.content || "—"}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1 text-xs">
                    <span className="flex items-center gap-1.5 font-black text-primary bg-primary/5 px-3 py-1 rounded-full">
                      <Heart className="h-3 w-3 fill-current" /> {p._count.likes}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top users */}
        <Card className="rounded-[2.5rem] border-border/40 shadow-premium overflow-hidden">
          <CardHeader className="p-8 pb-4 border-b border-border/20">
            <CardTitle className="font-display text-xl font-black">Impact Champions</CardTitle>
            <CardDescription className="font-medium">Ranked by verified Good Deed Credits</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/20">
              {topUsers.length === 0 && (
                <p className="p-12 text-center text-muted-foreground font-bold italic">No champions yet.</p>
              )}
              {topUsers.map((u, idx) => (
                <Link
                  key={u.id}
                  href={`/admin/users`}
                  className="flex items-center gap-4 p-6 transition-colors hover:bg-muted/30 group"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-muted text-xs font-black group-hover:bg-primary group-hover:text-white transition-colors">
                    {idx + 1}
                  </span>
                  <Avatar className="h-12 w-12 shrink-0 border-2 border-border/40">
                    <AvatarImage src={u.image || ""} alt={u.name || ""} />
                    <AvatarFallback className="text-xs font-bold">
                      {u.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black group-hover:text-primary transition-colors">{u.name || "Anonymous"}</p>
                    <p className="truncate text-xs text-muted-foreground font-medium">{u.email}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end">
                    <span className="font-display text-xl font-black text-primary">{u.points}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Credits</span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer summary */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryTile label="Active Circles" value={activeCommunities} />
        <SummaryTile label="Total Memberships" value={totalCommunityMemberships} />
        <SummaryTile label="Moderated Content" value={hiddenPostsCount} accent={hiddenPostsCount > 0} />
        <SummaryTile label="Restricted Users" value={bannedCount} accent={bannedCount > 0} />
      </div>
    </div>
  );
}

/* ---------- Inline components with premium styling ---------- */

function MetricTile({
  label,
  value,
  icon: Icon,
  tone,
  sub,
}: {
  label: string;
  value: string;
  icon: typeof Users;
  tone: "neutral";
  sub?: string;
}) {
  const toneMap = {
    neutral: "bg-primary/10 text-primary",
  } as const;
  return (
    <Card className="rounded-[1.5rem] border-border/40 shadow-sm overflow-hidden">
      <CardContent className="flex items-center gap-4 p-6">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${toneMap[tone]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">
            {label}
          </p>
          <p className="text-2xl font-black tabular-nums">{value}</p>
          {sub && <p className="truncate text-[10px] font-bold text-primary italic mt-0.5">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryTile({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <Card className="rounded-[1.5rem] border-border/40 shadow-sm overflow-hidden">
      <CardContent className="flex items-center justify-between p-6">
        <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">{label}</span>
        <span
          className={`text-2xl font-black tabular-nums ${
            accent ? "text-destructive" : "text-foreground"
          }`}
        >
          {value}
        </span>
      </CardContent>
    </Card>
  );
}
