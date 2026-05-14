"use client";

import Link from "next/link";
import { Trophy, Medal, Award, Crown, Star, Heart, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface Leader {
  id: string;
  name: string | null;
  image: string | null;
  points: number;
  likesReceived: number;
  _count: {
    posts: number;
  };
}

interface LeaderboardContentProps {
  leaders: Leader[];
  currentUserId: string;
  currentUserRank: number;
  globalStats: any[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function LeaderboardContent({
  leaders,
  currentUserId,
  currentUserRank,
  globalStats,
}: LeaderboardContentProps) {
  const topThree = leaders.slice(0, 3);
  const rest = leaders.slice(3, 50); // Limit to top 50 for performance

  const initiativeStat = globalStats.find(s => s.label === "Total Initiatives") || { value: "0", growth: 0 };
  const gdcStat = globalStats.find(s => s.label === "GDCs Distributed") || { value: "0", growth: 0 };

  return (
    <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl lg:text-6xl font-extrabold text-foreground mb-2"
          >
            Top Impact Makers
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg lg:text-xl text-muted-foreground"
          >
            Celebrating the collective efforts shaping our community.
          </motion.p>
        </div>
        <div className="relative">
          <select className="appearance-none bg-card border border-border/40 rounded-full px-8 py-3 pr-12 font-bold text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary min-h-[48px] shadow-sm transition-all hover:bg-muted/50 cursor-pointer">
            <option>All Time</option>
            <option>This Month</option>
            <option>This Week</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left/Main Column */}
        <div className="lg:col-span-8 flex flex-col gap-12">
          {/* Podium Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-[2.5rem] shadow-premium border border-border/40 p-8 md:p-12 relative overflow-hidden flex flex-col items-center"
          >
            {/* Decorative element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
            
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-12 relative z-10">The Podium</h2>
            
            <div className="flex items-end justify-center gap-4 md:gap-12 h-full w-full max-w-2xl">
              {/* Rank 2 */}
              {topThree[1] && (
                <div className="flex flex-col items-center w-1/3 group">
                  <div className="relative mb-6">
                    <Link href={`/profile/${topThree[1].id}`}>
                      <Avatar className="h-20 w-20 md:h-28 md:w-28 border-4 border-slate-200 dark:border-slate-600 shadow-xl transition-all group-hover:scale-110 group-hover:-translate-y-2">
                        <AvatarImage src={topThree[1].image || ""} />
                        <AvatarFallback className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 font-bold text-xl">
                          {topThree[1].name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-card rounded-full px-3 py-1 border border-border shadow-md">
                      <span className="font-black text-xs text-muted-foreground">#2</span>
                    </div>
                  </div>
                  <div className="text-center mb-6">
                    <h3 className="font-bold text-sm md:text-base line-clamp-1 group-hover:text-primary transition-colors">{topThree[1].name}</h3>
                    <div className="flex items-center justify-center gap-1 text-primary mt-1">
                      <Star className="h-3 w-3 fill-primary" />
                      <span className="font-black text-sm">{topThree[1].points} GDC</span>
                    </div>
                  </div>
                  <div className="w-full h-24 md:h-32 bg-slate-100 dark:bg-slate-800/50 rounded-t-3xl flex items-start justify-center pt-4 shadow-inner border-t border-x border-slate-200/30">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">Silver</span>
                  </div>
                </div>
              )}

              {/* Rank 1 */}
              {topThree[0] && (
                <div className="flex flex-col items-center w-1/3 z-10 group">
                  <div className="relative mb-8">
                    <motion.div 
                      animate={{ y: [0, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 3 }}
                      className="absolute -top-12 left-1/2 -translate-x-1/2"
                    >
                      <Crown className="h-10 w-10 text-yellow-500 fill-yellow-500 drop-shadow-md" />
                    </motion.div>
                    <Link href={`/profile/${topThree[0].id}`}>
                      <Avatar className="h-28 w-28 md:h-40 md:w-40 border-8 border-yellow-400 shadow-2xl transition-all group-hover:scale-110 group-hover:-translate-y-4 ring-8 ring-yellow-400/10">
                        <AvatarImage src={topThree[0].image || ""} />
                        <AvatarFallback className="bg-yellow-100 text-yellow-700 font-bold text-2xl">
                          {topThree[0].name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-yellow-400 rounded-full px-4 py-1.5 shadow-lg border-2 border-card">
                      <span className="font-black text-xs text-yellow-900">#1</span>
                    </div>
                  </div>
                  <div className="text-center mb-8">
                    <h3 className="font-black text-base md:text-xl line-clamp-1 group-hover:text-primary transition-colors">{topThree[0].name}</h3>
                    <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-black mt-2">
                      <Star className="h-3 w-3 fill-primary" />
                      {topThree[0].points} GDC
                    </div>
                  </div>
                  <div className="w-full h-32 md:h-48 bg-primary rounded-t-[2.5rem] flex items-start justify-center pt-6 shadow-inner relative overflow-hidden group-hover:bg-primary/90 transition-colors">
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 dark:via-black/10 to-transparent" />
                    <span className="text-sm font-black text-primary-foreground uppercase tracking-widest z-10">Gold</span>
                  </div>
                </div>
              )}

              {/* Rank 3 */}
              {topThree[2] && (
                <div className="flex flex-col items-center w-1/3 group">
                  <div className="relative mb-6">
                    <Link href={`/profile/${topThree[2].id}`}>
                      <Avatar className="h-20 w-20 md:h-28 md:w-28 border-4 border-orange-300 dark:border-orange-600 shadow-xl transition-all group-hover:scale-110 group-hover:-translate-y-2">
                        <AvatarImage src={topThree[2].image || ""} />
                        <AvatarFallback className="bg-orange-100 dark:bg-orange-800 text-orange-700 dark:text-orange-200 font-bold text-xl">
                          {topThree[2].name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-card rounded-full px-3 py-1 border border-border shadow-md">
                      <span className="font-black text-xs text-muted-foreground">#3</span>
                    </div>
                  </div>
                  <div className="text-center mb-6">
                    <h3 className="font-bold text-sm md:text-base line-clamp-1 group-hover:text-primary transition-colors">{topThree[2].name}</h3>
                    <div className="flex items-center justify-center gap-1 text-primary mt-1">
                      <Star className="h-3 w-3 fill-primary" />
                      <span className="font-black text-sm">{topThree[2].points} GDC</span>
                    </div>
                  </div>
                  <div className="w-full h-20 md:h-28 bg-orange-100 dark:bg-orange-900/30 rounded-t-3xl flex items-start justify-center pt-4 shadow-inner border-t border-x border-orange-300/30">
                    <span className="text-xs font-bold text-orange-700 dark:text-orange-300 uppercase tracking-widest">Bronze</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Full Leaderboard List */}
          <div className="flex flex-col gap-6">
            <h2 className="font-display text-2xl font-bold px-2">Full Leaderboard</h2>
            <div className="space-y-4">
              {rest.map((leader, index) => {
                const rank = index + 4;
                const isCurrentUser = leader.id === currentUserId;
                return (
                  <motion.div
                    key={leader.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    whileHover={{ x: 10, scale: 1.01 }}
                    className={cn(
                      "group flex items-center gap-4 p-5 rounded-[2rem] bg-card border border-border/40 shadow-sm transition-all hover:shadow-premium cursor-pointer",
                      isCurrentUser && "ring-2 ring-primary bg-primary/5 border-primary/20"
                    )}
                  >
                    <div className="w-12 text-center font-display font-black text-xl text-muted-foreground group-hover:text-primary transition-colors">
                      {rank}
                    </div>
                    <Link href={`/profile/${leader.id}`}>
                      <Avatar className="h-14 w-14 border-2 border-border group-hover:border-primary transition-colors">
                        <AvatarImage src={leader.image || ""} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {leader.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="flex-1 min-w-0 pr-2">
                      <p className={cn(
                        "font-bold text-base md:text-lg group-hover:text-primary transition-colors leading-tight",
                        isCurrentUser && "text-primary"
                      )}>
                        {leader.name || "Anonymous"}
                        {isCurrentUser && " (You)"}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] md:text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1 shrink-0"><Award className="h-3 w-3 md:h-3.5 md:w-3.5" /> {leader._count.posts} posts</span>
                        <span className="flex items-center gap-1 shrink-0"><Heart className="h-3 w-3 md:h-3.5 md:w-3.5" /> {leader.likesReceived} likes</span>
                      </div>
                    </div>
                    <div className="text-right pr-2">
                      <p className={cn("font-black text-2xl", isCurrentUser ? "text-primary" : "text-foreground")}>
                        {leader.points.toLocaleString()}
                      </p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">GDCs Earned</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          {/* Your Rank Pin */}
          {currentUserRank > 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-primary text-primary-foreground p-8 rounded-[2.5rem] shadow-premium-hover relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 dark:bg-black/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 dark:bg-black/20 flex items-center justify-center font-black text-3xl">
                    #{currentUserRank}
                  </div>
                  <Award className="h-10 w-10 opacity-40" />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold mb-2">You are here!</h3>
                  <p className="opacity-80 text-sm leading-relaxed">
                    You&apos;re doing amazing! Share more impact stories to climb the ranks and inspire others.
                  </p>
                </div>
                <Link href="/create-post" className="block">
                  <Button className="w-full rounded-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-bold py-6">
                    Post New Impact
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}

          {/* Stats Cards */}
          <div className="bg-card rounded-[2.5rem] p-8 border border-border/40 shadow-premium flex flex-col gap-8">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Total Initiatives</h3>
                <div className="p-2 bg-primary/10 rounded-xl text-primary">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-4xl font-black">{initiativeStat.value}</span>
                {initiativeStat.growth > 0 && (
                  <span className="text-xs font-bold text-primary">+{initiativeStat.growth}% this month</span>
                )}
              </div>
            </div>

            <div className="h-0.5 bg-border/20 w-full" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Total GDCs Distributed</h3>
                <div className="p-2 bg-yellow-400/10 rounded-xl text-yellow-600">
                  <Star className="h-5 w-5 fill-yellow-600" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-4xl font-black">{gdcStat.value}</span>
                {gdcStat.growth > 0 && (
                  <span className="text-xs font-bold text-primary">+{gdcStat.growth}% this month</span>
                )}
              </div>
            </div>
          </div>

          {/* Promo Card */}
          <div className="bg-secondary text-secondary-foreground p-8 rounded-[2.5rem] shadow-premium relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <Star className="h-12 w-12 mb-6 opacity-40 group-hover:scale-110 transition-transform" />
              <h3 className="font-display text-2xl font-bold mb-4">Climb the ranks!</h3>
              <p className="text-sm opacity-80 mb-8 leading-relaxed">
                Participate in featured community events to earn bonus Good Deed Credits and rise to the top.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
