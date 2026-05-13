"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChangePasswordDialog } from "@/components/change-password-dialog";
import { EditProfileDialog } from "@/components/edit-profile-dialog";
import { Calendar, Heart, FileText, Users, Trophy, User } from "lucide-react";
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
import { KeyRound } from "lucide-react";
import { PostCard } from "@/components/posts/post-card";
import { BadgesSection } from "@/components/badges/badges-section";
import type { ReactionType } from "@/lib/reactions";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

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

      const data = await res
        .json()
        .catch(() => ({ error: `Request failed (${res.status})` }));
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

      const data = await res
        .json()
        .catch(() => ({ error: `Request failed (${res.status})` }));
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

      const data = await res
        .json()
        .catch(() => ({ error: `Request failed (${res.status})` }));
      toast.error(data.error || "Failed to delete post.");
    } catch {
      toast.error("Failed to delete post.");
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      {/* Profile Header Card */}
      <Card className="overflow-hidden border-border/40 shadow-premium rounded-[2.5rem] bg-card mb-12">
        {/* Banner Area */}
        <div className="h-48 w-full bg-gradient-to-r from-primary/30 via-primary to-primary/30 relative">
          <div className="absolute inset-0 bg-grid-white/10" />
        </div>
        
        <CardContent className="pt-0 px-8 pb-8 relative">
          <div className="flex flex-col md:flex-row items-end gap-6 -mt-16 mb-8">
            <Avatar className="h-32 w-32 border-8 border-card shadow-2xl ring-8 ring-primary/5">
              <AvatarImage src={user.image || ""} />
              <AvatarFallback className="text-4xl font-black bg-primary/10 text-primary">
                {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-display text-3xl font-black tracking-tight">{user.name || "Anonymous"}</h1>
                  <p className="text-muted-foreground font-medium">{user.email}</p>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <EditProfileDialog
                    asChild
                    initialName={user.name}
                    initialBio={user.bio}
                    initialImage={user.image}
                  >
                    <Button variant="outline" className="rounded-full px-6 font-bold border-2 border-primary/20 text-primary hover:bg-primary/5 transition-all">
                      <User className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </EditProfileDialog>
                  
                  <ChangePasswordDialog asChild>
                    <Button variant="ghost" className="rounded-full px-6 font-bold text-muted-foreground hover:text-foreground">
                      <KeyRound className="h-4 w-4 mr-2" />
                      Security
                    </Button>
                  </ChangePasswordDialog>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-6">
              {user.bio && (
                <div>
                  <h3 className="font-black text-[10px] uppercase tracking-widest text-muted-foreground mb-3">About Me</h3>
                  <p className="text-lg leading-relaxed text-foreground/80 font-medium">
                    {user.bio}
                  </p>
                </div>
              )}
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-2 font-bold">
                  <Calendar className="h-4 w-4 text-primary" />
                  Joined {formatDate(user.createdAt)}
                </span>
                {user.role === "ADMIN" && (
                  <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] px-3 py-1 uppercase tracking-widest">
                    Administrator
                  </Badge>
                )}
              </div>
            </div>

            <div className="lg:col-span-4 bg-primary/5 rounded-3xl p-6 border border-primary/10 flex flex-col items-center text-center">
              <Trophy className="h-10 w-10 text-primary mb-4" />
              <div className="font-display text-4xl font-black text-primary mb-1">{user.points}</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-primary/60">Good Deed Credits</div>
              <p className="text-[10px] mt-4 text-muted-foreground leading-relaxed">
                Impact score based on verified social work and community engagement.
              </p>
            </div>
          </div>

          {/* Detailed Stats Grid */}
          <div className="mt-12 grid grid-cols-3 gap-4 md:gap-8">
            <div className="text-center p-6 rounded-3xl bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors group">
              <FileText className="h-6 w-6 mx-auto mb-3 text-muted-foreground group-hover:text-primary transition-colors" />
              <div className="text-2xl font-black">{stats.totalPosts}</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Impact Stories</div>
            </div>
            <div className="text-center p-6 rounded-3xl bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors group">
              <Heart className="h-6 w-6 mx-auto mb-3 text-muted-foreground group-hover:text-primary transition-colors" />
              <div className="text-2xl font-black">{stats.totalLikes}</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Appreciation</div>
            </div>
            <div className="text-center p-6 rounded-3xl bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors group">
              <Users className="h-6 w-6 mx-auto mb-3 text-muted-foreground group-hover:text-primary transition-colors" />
              <div className="text-2xl font-black">{stats.totalCommunities}</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Circles</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Main Feed Column */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between px-2">
            <h2 className="font-display text-2xl font-black">My Impact Stories</h2>
            <Link href="/create-post">
              <Button variant="link" className="text-primary font-bold">New Post</Button>
            </Link>
          </div>
          
          {user.posts.length === 0 ? (
            <div className="bg-card/50 rounded-[2.5rem] border border-dashed border-border/60 py-24 text-center">
              <p className="text-muted-foreground font-bold">No stories shared yet.</p>
              <Button asChild className="mt-6 rounded-full px-8 py-6 font-bold shadow-premium">
                <Link href="/create-post">Start Your Story</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
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
        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-4 space-y-10">
          <BadgesSection badgeIds={user.badges} />
          
          {user.memberships.length > 0 && (
            <div className="bg-card border border-border/40 shadow-premium rounded-[2.5rem] p-8">
              <h3 className="font-display text-xl font-black mb-6">My Circles</h3>
              <div className="flex flex-wrap gap-2">
                {user.memberships.map(({ community }) => (
                  <Link key={community.id} href={`/communities/${community.slug}`}>
                    <Badge variant="outline" className="rounded-full px-4 py-1.5 border-2 border-primary/10 text-primary hover:bg-primary/5 transition-all text-xs font-bold">
                      {community.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

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
