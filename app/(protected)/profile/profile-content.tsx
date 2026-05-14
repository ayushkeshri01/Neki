"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChangePasswordDialog } from "@/components/change-password-dialog";
import { EditProfileDialog } from "@/components/edit-profile-dialog";
import { 
  Calendar, 
  Heart, 
  FileText, 
  Users, 
  Trophy, 
  User,
  ArrowLeft, 
  CheckCircle2, 
  TrendingUp, 
  ChevronRight,
  Plus,
  KeyRound,
  Shield,
  Award,
  Sparkles
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { PostCard } from "@/components/posts/post-card";
import { BadgesSection } from "@/components/badges/badges-section";
import type { ReactionType } from "@/lib/reactions";
import { formatDate, cn } from "@/lib/utils";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

interface ProfileUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  bio: string | null;
  points: number;
  role: string;
  badges: string[];
  createdAt: string;
  posts: {
    id: string;
    content: string;
    images: string[];
    points: number;
    status: string;
    createdAt: string;
    communities: {
      community: {
        id: string;
        name: string;
        slug: string;
      };
    }[];
    _count: {
      likes: number;
    };
    likes: { userId: string; type: string; user: { name: string | null; image: string | null } }[];
  }[];
  memberships: {
    community: {
      id: string;
      name: string;
      slug: string;
      _count: { members: number };
    };
  }[];
}

interface ProfileContentProps {
  user: ProfileUser;
  stats: {
    totalPosts: number;
    totalLikes: number;
    totalCommunities: number;
  };
}

export function ProfileContent({ user, stats }: ProfileContentProps) {
  const router = useRouter();
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportPostId, setReportPostId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");

  // Level Logic
  const getLevelInfo = (points: number) => {
    if (points < 100) return { name: "Catalyst", next: "Silver", target: 100, color: "bg-primary" };
    if (points < 250) return { name: "Silver", next: "Gold", target: 250, color: "bg-slate-400" };
    if (points < 500) return { name: "Gold", next: "Elite", target: 500, color: "bg-yellow-500" };
    if (points < 1000) return { name: "Elite", next: "Master", target: 1000, color: "bg-purple-500" };
    return { name: "Master", next: "Legend", target: 2000, color: "bg-primary" };
  };

  const level = getLevelInfo(user.points);
  const progress = Math.min(100, (user.points / level.target) * 100);
  const creditsToNext = Math.max(0, level.target - user.points);

  const handleLike = async (postId: string, reaction: ReactionType | null) => {
    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reaction }),
      });
      if (res.ok) {
        router.refresh();
        return;
      }

      const data = await res.json().catch(() => ({ error: `Request failed (${res.status})` }));
      toast.error(data.error || "Failed to update reaction.");
    } catch {
      toast.error("Failed to update reaction.");
    }
  };

  const handleReport = (postId: string) => {
    setReportPostId(postId);
    setReportReason("");
    setReportDialogOpen(true);
  };

  const submitReport = async () => {
    if (!reportPostId || !reportReason.trim()) return;

    try {
      const res = await fetch(`/api/posts/${reportPostId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reportReason }),
      });
      if (res.ok) {
        toast.success("Post reported. Thank you for the feedback.");
        setReportDialogOpen(false);
        setReportPostId(null);
        setReportReason("");
        router.refresh();
        return;
      }

      const data = await res.json().catch(() => ({ error: `Request failed (${res.status})` }));
      toast.error(data.error || "Failed to report post.");
    } catch {
      toast.error("Failed to report post.");
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Post deleted.");
        router.refresh();
        return;
      }

      const data = await res.json().catch(() => ({ error: `Request failed (${res.status})` }));
      toast.error(data.error || "Failed to delete post.");
    } catch {
      toast.error("Failed to delete post.");
    }
  };

  return (
    <div className="bg-background min-h-screen pb-24">
      {/* TopAppBar */}
      <header className="w-full sticky top-0 bg-background/80 backdrop-blur-xl border-b border-border/40 z-50 flex items-center justify-between px-margin-mobile h-16 md:hidden">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-display text-lg font-bold">Community Impact</h1>
        </div>
        <div className="flex items-center gap-2">
          <ChangePasswordDialog asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <KeyRound className="h-5 w-5" />
            </Button>
          </ChangePasswordDialog>
        </div>
      </header>

      <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg flex flex-col gap-10">
        {/* Profile Header Section */}
        <section className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 text-center md:text-left">
          <div className="relative group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-primary shadow-xl">
                <AvatarImage src={user.image || ""} className="object-cover" />
                <AvatarFallback className="text-3xl font-black bg-primary/10 text-primary">
                  {user.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-1 right-1 bg-primary p-1.5 rounded-full border-2 border-white shadow-lg">
                <CheckCircle2 className="h-4 w-4 text-white fill-current" />
              </div>
            </motion.div>
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-3xl md:text-4xl font-black text-primary">{user.name || "Anonymous"}</h2>
                <p className="text-muted-foreground font-medium">{user.email}</p>
                <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-2">
                  <Badge className="bg-primary/5 text-primary border-primary/10 px-3 py-1 font-bold text-[10px] uppercase tracking-wider">
                    {user.role === "ADMIN" ? "Neki Administrator" : "Community Member"}
                  </Badge>
                  {user.points > 500 && (
                    <Badge className="bg-secondary/10 text-secondary border-secondary/10 px-3 py-1 font-bold text-[10px] uppercase tracking-wider">
                      Premium Impact
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <EditProfileDialog
                  asChild
                  initialName={user.name}
                  initialBio={user.bio}
                  initialImage={user.image}
                >
                  <Button variant="outline" className="rounded-full px-6 font-bold border-2 border-primary/20 text-primary hover:bg-primary/5">
                    <User className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </EditProfileDialog>
                
                <div className="hidden md:block">
                  <ChangePasswordDialog asChild>
                    <Button variant="ghost" size="icon" className="rounded-full border border-border/40">
                      <KeyRound className="h-5 w-5" />
                    </Button>
                  </ChangePasswordDialog>
                </div>
              </div>
            </div>
            
            {user.bio && (
              <p className="max-w-2xl text-muted-foreground leading-relaxed font-medium">
                {user.bio}
              </p>
            )}
          </div>
        </section>

        {/* Impact Score Dashboard Widget */}
        <section className="bg-card border border-border/40 rounded-[2.5rem] p-8 md:p-10 shadow-premium relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors" />
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Overall Impact Score</p>
              <h3 className="font-display text-5xl md:text-6xl font-black text-primary mt-2 flex items-baseline gap-3">
                {user.points} 
                <span className="text-lg font-bold text-muted-foreground tracking-normal uppercase">Good Deed Credits</span>
              </h3>
            </div>
            <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
              <TrendingUp className="h-10 w-10 text-primary" />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="w-full bg-muted h-3 rounded-full overflow-hidden border border-border/20">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className={cn("h-full", level.color)} 
              />
            </div>
            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Trophy className="h-3.5 w-3.5 text-primary" />
                Current Level: <span className="text-primary">{level.name}</span>
              </span>
              {creditsToNext > 0 ? (
                <span className="text-xs font-black text-primary flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" />
                  {creditsToNext} credits to {level.next}
                </span>
              ) : (
                <span className="text-xs font-black text-primary uppercase tracking-widest">Max Level Reached</span>
              )}
            </div>
          </div>
        </section>

        {/* Quick Stats Row */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card border border-border/40 rounded-[2rem] p-6 text-center hover:bg-muted/30 transition-colors cursor-default shadow-sm group">
            <div className="w-10 h-10 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <p className="font-display text-3xl font-black text-primary">{stats.totalPosts}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">Impact Stories</p>
          </div>
          <div className="bg-card border border-border/40 rounded-[2rem] p-6 text-center hover:bg-muted/30 transition-colors cursor-default shadow-sm group">
            <div className="w-10 h-10 bg-destructive/5 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Heart className="h-5 w-5 text-destructive fill-current" />
            </div>
            <p className="font-display text-3xl font-black text-primary">{stats.totalLikes}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">Appreciation</p>
          </div>
          <div className="bg-card border border-border/40 rounded-[2rem] p-6 text-center hover:bg-muted/30 transition-colors cursor-default shadow-sm group">
            <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Users className="h-5 w-5 text-secondary" />
            </div>
            <p className="font-display text-3xl font-black text-primary">{stats.totalCommunities}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">Circles</p>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Impact Stories Feed */}
          <section className="lg:col-span-8 flex flex-col gap-8">
            <div className="flex justify-between items-center px-2">
              <h4 className="font-display text-2xl font-black text-primary">Impact Stories</h4>
              <Link href="/create-post">
                <Button className="rounded-full px-6 py-6 font-bold shadow-premium flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  New Post
                </Button>
              </Link>
            </div>
            
            {user.posts.length === 0 ? (
              <div className="bg-muted/20 border-2 border-dashed border-border/60 rounded-[2.5rem] p-16 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-bold text-lg mb-6">No stories shared yet.</p>
                <Link href="/create-post">
                  <Button className="rounded-full px-8 py-6 font-bold shadow-premium">
                    Start Your Story
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-8">
                {user.posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={{
                      ...post,
                      author: {
                        id: user.id,
                        name: user.name,
                        image: user.image,
                        points: user.points,
                      },
                    }}
                    currentUserId={user.id}
                    onLike={handleLike}
                    onReport={handleReport}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </section>

          <div className="lg:col-span-4 flex flex-col gap-10">
            {/* Badges Section */}
            <section className="bg-card border border-border/40 rounded-[2.5rem] p-8 shadow-premium">
              <h4 className="font-display text-xl font-black text-primary mb-6 flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Badges
              </h4>
              <BadgesSection badgeIds={user.badges} />
            </section>

            {/* My Circles Section */}
            <section className="bg-card border border-border/40 rounded-[2.5rem] p-8 shadow-premium">
              <h4 className="font-display text-xl font-black text-primary mb-6 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                My Circles
              </h4>
              <div className="flex flex-col gap-3">
                {user.memberships.map(({ community }) => (
                  <Link key={community.id} href={`/communities/${community.slug}`}>
                    <div className="group flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border/20 hover:bg-primary/5 hover:border-primary/20 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <span className="font-black text-primary">{community.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="font-bold text-sm text-primary group-hover:text-primary transition-colors">{community.name}</p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{community._count.members} Members</p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                ))}
                {user.memberships.length === 0 && (
                  <p className="text-center py-8 text-sm font-bold text-muted-foreground border-2 border-dashed border-border/40 rounded-2xl">
                    Join circles to connect!
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Report Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent className="rounded-[2.5rem] p-8">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-black">Report Post</DialogTitle>
            <DialogDescription className="font-medium">
              Help us keep the community safe and positive.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-6">
            <Textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Reason for reporting..."
              rows={4}
              className="rounded-2xl border-border/40 focus:ring-primary"
            />
          </div>
          <DialogFooter className="gap-3">
            <Button
              type="button"
              variant="outline"
              className="rounded-full px-8 py-6 font-bold"
              onClick={() => setReportDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-full px-8 py-6 font-bold shadow-premium"
              onClick={submitReport}
              disabled={!reportReason.trim()}
            >
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
