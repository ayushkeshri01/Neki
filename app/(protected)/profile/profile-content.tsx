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
    likes: { userId: string; type: string }[];
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
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.image || ""} />
              <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                {user.name?.charAt(0).toUpperCase() ||
                  user.email?.charAt(0).toUpperCase() ||
                  "?"}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-2xl font-bold">{user.name || "Anonymous"}</h1>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined {formatDate(user.createdAt)}
                </span>
                {user.role === "ADMIN" && (
                  <Badge variant="secondary">Admin</Badge>
                )}
              </div>
            </div>
            <div className="text-center p-4 rounded-lg bg-primary/10 min-w-[80px]">
              <Trophy className="h-6 w-6 text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold text-primary">{user.points}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Good Deed Credits (GDCs)</p>
            </div>
            
            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <EditProfileDialog
                asChild
                initialName={user.name}
                initialBio={user.bio}
                initialImage={user.image}
              >
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <User className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </EditProfileDialog>
              <ChangePasswordDialog asChild>
                <Button variant="outline" size="sm" className="w-full justify-start text-muted-foreground hover:text-foreground">
                  <KeyRound className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
              </ChangePasswordDialog>
            </div>
          </div>

          {/* Bio */}
          {user.bio && (
            <p className="text-sm text-muted-foreground mt-2">{user.bio}</p>
          )}

          {/* Stats */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <FileText className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xl font-bold">{stats.totalPosts}</p>
              <p className="text-xs text-muted-foreground">Posts</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <Heart className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xl font-bold">{stats.totalLikes}</p>
              <p className="text-xs text-muted-foreground">Likes</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <Users className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xl font-bold">{stats.totalCommunities}</p>
              <p className="text-xs text-muted-foreground">Communities</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <BadgesSection badgeIds={user.badges} />

      {/* Communities */}
      {user.memberships.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Communities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {user.memberships.map(({ community }) => (
                <Link key={community.id} href={`/communities/${community.slug}`}>
                  <Badge variant="outline" className="hover:bg-accent">
                    {community.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts */}
      <div>
        <h2 className="text-lg font-semibold mb-4">My Posts</h2>
        {user.posts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No posts yet. Start sharing your social work!
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
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

      {/* Report Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Post</DialogTitle>
            <DialogDescription>
              Please provide a reason for reporting this post.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Reason for reporting..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setReportDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
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
