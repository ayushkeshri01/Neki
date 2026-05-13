"use client";

import Link from "next/link";
import { Trophy, Medal, Award, Crown, Star, Heart } from "lucide-react";
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
}: LeaderboardContentProps) {
  const topThree = leaders.slice(0, 3);
  const rest = leaders.slice(3, 50); // Limit to top 50 for performance

  return (
    <div className="mx-auto max-w-4xl space-y-12 px-4 py-8">
      <header className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-2"
        >
          <Trophy className="h-8 w-8" />
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-display font-extrabold tracking-tight"
        >
          Community <span className="text-primary">Leaderboard</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground"
        >
          Celebrating our top changemakers making an impact every day.
        </motion.p>
      </header>

      {/* Top 3 Podium */}
      <div className="flex flex-col md:flex-row items-end justify-center gap-6 lg:gap-12 pt-12 pb-8">
        {/* Second Place */}
        {topThree[1] && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, type: "spring" }}
            className="order-2 md:order-1 flex flex-col items-center w-full md:w-auto"
          >
            <div className="relative mb-4 group">
              <Link href={`/profile/${topThree[1].id}`}>
                <Avatar className="h-24 w-24 border-4 border-slate-300 shadow-xl transition-transform group-hover:scale-105">
                  <AvatarImage src={topThree[1].image || ""} />
                  <AvatarFallback className="bg-slate-100 text-slate-600 text-xl font-bold">
                    {topThree[1].name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div className="absolute -top-3 -right-3 h-10 w-10 flex items-center justify-center rounded-full bg-slate-300 shadow-lg">
                <Medal className="h-6 w-6 text-slate-700" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="font-bold text-lg">{topThree[1].name || "Anonymous"}</h3>
              <p className="text-primary font-bold">{topThree[1].points.toLocaleString()} GDCs</p>
            </div>
            <div className="mt-4 h-32 w-40 rounded-t-[2rem] bg-slate-200/50 border-x border-t border-slate-300/50 flex items-center justify-center">
              <span className="text-4xl font-display font-black text-slate-400">2</span>
            </div>
          </motion.div>
        )}

        {/* First Place */}
        {topThree[0] && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
            className="order-1 md:order-2 flex flex-col items-center w-full md:w-auto -mt-8"
          >
            <div className="relative mb-6 group">
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 animate-bounce">
                <Crown className="h-10 w-10 text-yellow-500 fill-yellow-500" />
              </div>
              <Link href={`/profile/${topThree[0].id}`}>
                <Avatar className="h-32 w-32 border-8 border-yellow-400 shadow-2xl transition-transform group-hover:scale-110">
                  <AvatarImage src={topThree[0].image || ""} />
                  <AvatarFallback className="bg-yellow-100 text-yellow-700 text-2xl font-bold">
                    {topThree[0].name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </div>
            <div className="text-center mb-4">
              <h3 className="font-bold text-2xl">{topThree[0].name || "Anonymous"}</h3>
              <div className="flex items-center justify-center gap-2">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <p className="text-primary text-xl font-black">{topThree[0].points.toLocaleString()} GDCs</p>
                <Star className="h-4 w-4 fill-primary text-primary" />
              </div>
            </div>
            <div className="h-48 w-48 rounded-t-[2.5rem] bg-gradient-to-b from-yellow-400/20 to-primary/5 border-x border-t border-yellow-400/30 flex items-center justify-center shadow-[0_-10px_20px_rgba(234,179,8,0.1)]">
              <span className="text-6xl font-display font-black text-yellow-500/50">1</span>
            </div>
          </motion.div>
        )}

        {/* Third Place */}
        {topThree[2] && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, type: "spring" }}
            className="order-3 flex flex-col items-center w-full md:w-auto"
          >
            <div className="relative mb-4 group">
              <Link href={`/profile/${topThree[2].id}`}>
                <Avatar className="h-24 w-24 border-4 border-orange-300 shadow-xl transition-transform group-hover:scale-105">
                  <AvatarImage src={topThree[2].image || ""} />
                  <AvatarFallback className="bg-orange-50 text-orange-600 text-xl font-bold">
                    {topThree[2].name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div className="absolute -top-3 -right-3 h-10 w-10 flex items-center justify-center rounded-full bg-orange-300 shadow-lg">
                <Award className="h-6 w-6 text-orange-800" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="font-bold text-lg">{topThree[2].name || "Anonymous"}</h3>
              <p className="text-primary font-bold">{topThree[2].points.toLocaleString()} GDCs</p>
            </div>
            <div className="mt-4 h-24 w-40 rounded-t-[2rem] bg-orange-200/50 border-x border-t border-orange-300/50 flex items-center justify-center">
              <span className="text-3xl font-display font-black text-orange-400">3</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Your Rank Pin */}
      {currentUserRank > 3 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="sticky top-24 z-10"
        >
          <Card className="bg-primary text-on-primary shadow-xl rounded-2xl overflow-hidden border-none">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center font-black text-xl">
                  #{currentUserRank}
                </div>
                <div>
                  <p className="font-bold text-lg">You are here!</p>
                  <p className="text-sm opacity-80">Keep sharing kindness to climb higher</p>
                </div>
              </div>
              <Link href="/create-post">
                <Button variant="secondary" className="rounded-full font-bold">Post Impact</Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Rest of the List */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="space-y-3"
      >
        <h2 className="text-xl font-bold px-4 mb-4">Rankings</h2>
        {rest.map((leader, index) => {
          const rank = index + 4;
          const isCurrentUser = leader.id === currentUserId;

          return (
            <motion.div
              key={leader.id}
              variants={itemVariants}
              whileHover={{ x: 10, scale: 1.01 }}
              className={cn(
                "group flex items-center gap-4 p-4 rounded-[1.5rem] bg-card border border-border/40 shadow-sm transition-all hover:shadow-md",
                isCurrentUser && "ring-2 ring-primary bg-primary/5 border-primary/20"
              )}
            >
              <div className="w-10 text-center font-display font-black text-muted-foreground group-hover:text-primary transition-colors">
                #{rank}
              </div>
              <Link href={`/profile/${leader.id}`}>
                <Avatar className="h-12 w-12 border-2 border-border group-hover:border-primary transition-colors">
                  <AvatarImage src={leader.image || ""} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {leader.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/profile/${leader.id}`}>
                  <p className={cn("font-bold truncate group-hover:text-primary transition-colors", isCurrentUser && "text-primary")}>
                    {leader.name || "Anonymous"}
                    {isCurrentUser && " (You)"}
                  </p>
                </Link>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Award className="h-3 w-3" /> {leader._count.posts} posts</span>
                  <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {leader.likesReceived} likes</span>
                </div>
              </div>
              <div className="text-right">
                <p className={cn("font-black text-lg", isCurrentUser ? "text-primary" : "text-foreground")}>
                  {leader.points.toLocaleString()}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">GDCs</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
