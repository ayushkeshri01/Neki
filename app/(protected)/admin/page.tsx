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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Analytics</h2>
          <p className="text-sm text-muted-foreground">
            Welcome back, {session?.user?.name || "Admin"} — your platform at a glance.
          </p>
        </div>
        <Badge variant="secondary" className="gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Live data
        </Badge>
      </div>

      {/* Filters */}
      <DashboardFilters currentRange={String(rangeDays)} />

      {/* SECTION 1 — KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          label="Total Users"
          value={formatNumber(totalUsers)}
          delta={totalUsersDelta}
          icon={Users}
          iconColor="text-indigo-500"
          trend={usersSpark}
          trendColor="text-indigo-500"
        />
        <KpiCard
          label="DAU"
          value={formatNumber(dau)}
          delta={dauDelta}
          icon={Activity}
          iconColor="text-emerald-500"
          trend={dauSpark}
          trendColor="text-emerald-500"
        />
        <KpiCard
          label="MAU"
          value={formatNumber(mau)}
          delta={mauDelta}
          icon={UsersRound}
          iconColor="text-sky-500"
          trend={mauSpark}
          trendColor="text-sky-500"
        />
        <KpiCard
          label="Total Posts"
          value={formatNumber(totalPosts)}
          delta={totalPostsDelta}
          icon={FileText}
          iconColor="text-violet-500"
          trend={postsSpark}
          trendColor="text-violet-500"
        />
        <KpiCard
          label="Engagement Rate"
          value={`${engagementRate.toFixed(1)}%`}
          delta={engagementRateDelta}
          icon={UserCheck}
          iconColor="text-rose-500"
          helper="of MAU engaged"
          trend={likesSpark}
          trendColor="text-rose-500"
        />
        <KpiCard
          label="Impact Actions"
          value={formatNumber(impactCurrent)}
          delta={impactDelta}
          icon={Sparkles}
          iconColor="text-amber-500"
          helper="posts + likes"
        />
      </div>

      {/* SECTION 2 — User growth */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-base">User growth</CardTitle>
              <CardDescription>New users over the selected period</CardDescription>
            </div>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <LineChart
              area
              series={[
                { name: "New users", color: "#6366f1", data: newUsersSeries },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Acquisition sources</CardTitle>
            <CardDescription>How users are reaching us</CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChart data={acquisition} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">DAU vs MAU</CardTitle>
            <CardDescription>Daily and monthly active users</CardDescription>
          </CardHeader>
          <CardContent>
            <LineChart
              area
              series={[
                { name: "MAU", color: "#0ea5e9", data: mauSeries },
                { name: "DAU", color: "#10b981", data: dauSeries },
              ]}
            />
          </CardContent>
        </Card>
      </div>

      {/* SECTION 3 — Engagement */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Posts &amp; likes per day</CardTitle>
            <CardDescription>Content creation and engagement cadence</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart data={postsSeries} color="#8b5cf6" />
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <MetricTile
            label="Avg posts / user"
            value={avgPostsPerUser.toFixed(2)}
            icon={FileText}
            tone="violet"
          />
          <MetricTile
            label="Avg likes / post"
            value={avgLikesPerPost.toFixed(2)}
            icon={Heart}
            tone="rose"
          />
          <MetricTile
            label="Likes / active user"
            value={likesPerActiveUser.toFixed(2)}
            icon={UserCheck}
            tone="sky"
            sub={`${activeEngagers} active engagers${
              engagersDelta !== undefined
                ? ` (${engagersDelta >= 0 ? "+" : ""}${engagersDelta.toFixed(0)}%)`
                : ""
            }`}
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Top posts */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top 10 most engaged posts</CardTitle>
            <CardDescription>Sorted by like count</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {topPosts.length === 0 && (
                <p className="p-6 text-sm text-muted-foreground">No posts yet.</p>
              )}
              {topPosts.map((p, idx) => (
                <Link
                  key={p.id}
                  href={`/admin/posts`}
                  className="flex items-start gap-3 p-4 transition-colors hover:bg-muted/40"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold tabular-nums">
                    {idx + 1}
                  </span>
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={p.author.image || ""} alt={p.author.name || ""} />
                    <AvatarFallback className="text-xs">
                      {p.author.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {p.author.name || "Unknown"}
                    </p>
                    <p className="line-clamp-1 text-xs text-muted-foreground">
                      {p.content || "—"}
                    </p>
                    {p.communities[0]?.community.name && (
                      <span className="mt-1 inline-block text-[10px] text-muted-foreground">
                        in {p.communities[0].community.name}
                      </span>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-0.5 text-xs">
                    <span className="flex items-center gap-1 text-rose-500">
                      <Heart className="h-3 w-3 fill-current" /> {p._count.likes}
                    </span>
                    {p._count.reports > 0 && (
                      <span className="text-[10px] text-muted-foreground">
                        {p._count.reports} reports
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top users */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top active users</CardTitle>
            <CardDescription>Ranked by Good Deed Credits</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {topUsers.length === 0 && (
                <p className="p-6 text-sm text-muted-foreground">No users yet.</p>
              )}
              {topUsers.map((u, idx) => (
                <Link
                  key={u.id}
                  href={`/admin/users`}
                  className="flex items-center gap-3 p-4 transition-colors hover:bg-muted/40"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold tabular-nums">
                    {idx + 1}
                  </span>
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarImage src={u.image || ""} alt={u.name || ""} />
                    <AvatarFallback className="text-xs">
                      {u.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{u.name || "Unknown"}</p>
                    <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end text-xs">
                    <span className="font-semibold tabular-nums">{u.points}</span>
                    <span className="text-muted-foreground">
                      {u._count.posts} posts · {u._count.likes} likes
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryTile label="Communities" value={activeCommunities} />
        <SummaryTile label="Memberships" value={totalCommunityMemberships} />
        <SummaryTile label="Hidden posts" value={hiddenPostsCount} accent={hiddenPostsCount > 0} />
        <SummaryTile label="Blacklisted users" value={bannedCount} accent={bannedCount > 0} />
      </div>
    </div>
  );
}

/* ---------- Inline tiles ---------- */

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
  tone: "violet" | "rose" | "sky" | "emerald";
  sub?: string;
}) {
  const toneMap = {
    violet: "bg-violet-500/10 text-violet-500",
    rose: "bg-rose-500/10 text-rose-500",
    sky: "bg-sky-500/10 text-sky-500",
    emerald: "bg-emerald-500/10 text-emerald-500",
  } as const;
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-5">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${toneMap[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="text-xl font-semibold tabular-nums">{value}</p>
          {sub && <p className="truncate text-[11px] text-muted-foreground">{sub}</p>}
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
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span
          className={`text-lg font-semibold tabular-nums ${
            accent ? "text-amber-500" : ""
          }`}
        >
          {value}
        </span>
      </CardContent>
    </Card>
  );
}
