"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Users, Plus, Loader2, FileQuestion, MessageSquare, Award, Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/posts/post-card";
import type { ReactionType } from "@/lib/reactions";
import { formatDate, cn } from "@/lib/utils";

import { toast } from "sonner";

interface Community {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  admin: {
    id: string;
    name: string | null;
    image: string | null;
  };
  _count: {
    members: number;
    posts: number;
  };
}

interface Post {
  id: string;
  content: string;
  images: string[];
  points: number;
  status: string;
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    image: string | null;
    points: number;
  };
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
}

interface Member {
  id: string;
  name: string | null;
  image: string | null;
  points: number;
  joinedAt: string;
}

interface CommunityPageContentProps {
  community: Community;
  posts: Post[];
  members: Member[];
  isMember: boolean;
  currentUserId: string;
  isAdmin: boolean;
}


export function CommunityPageContent({
  community,
  posts,
  members,
  isMember,
  currentUserId,
  isAdmin,
}: CommunityPageContentProps) {
  const router = useRouter();
  const [memberActionLoading, setMemberActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");


  const handleJoin = async () => {
    setMemberActionLoading(true);
    try {
      const res = await fetch(`/api/communities/${community.id}/join`, {
        method: "POST",
      });

      if (res.ok) {
        toast.success(`Joined ${community.name}.`);
        router.refresh();
        return;
      }

      const data = await res
        .json()
        .catch(() => ({ error: `Request failed (${res.status})` }));
      toast.error(data.error || `Failed to join ${community.name}.`);
    } catch {
      toast.error(`Failed to join ${community.name}.`);
    } finally {
      setMemberActionLoading(false);
    }
  };

  const handleLeave = async () => {
    setMemberActionLoading(true);
    try {
      const res = await fetch(`/api/communities/${community.id}/leave`, {
        method: "POST",
      });

      if (res.ok) {
        toast.success(`Left ${community.name}.`);
        router.refresh();
        return;
      }

      const data = await res
        .json()
        .catch(() => ({ error: `Request failed (${res.status})` }));
      toast.error(data.error || `Failed to leave ${community.name}.`);
    } catch {
      toast.error(`Failed to leave ${community.name}.`);
    } finally {
      setMemberActionLoading(false);
    }
  };

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
      toast.error(data.error || "Failed to update like.");
    } catch {
      toast.error("Failed to update like.");
    }
  };

  const handleReport = async (postId: string) => {
    const reason = prompt("Please provide a reason for reporting this post:");
    if (!reason) return;

    try {
      const res = await fetch(`/api/posts/${postId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) {
        toast.success("Post reported. Thank you for helping keep the community safe.");
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
      {/* Community Header */}
      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="aspect-[3/1] bg-gradient-to-br from-primary/20 to-primary/5" />
        <div className="px-6 pb-6">
          <div className="relative -mt-12 mb-4">
            <Avatar className="h-24 w-24 border-4 border-background bg-primary/20">
              <AvatarImage src={community.image || ""} />
              <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                {community.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">{community.name}</h1>
              {community.description && (
                <p className="mt-1 text-muted-foreground">
                  {community.description}
                </p>
              )}
              <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {community._count.members} members
                </span>
                <span>{community._count.posts} posts</span>
              </div>
            </div>
            {isMember ? (
              <div className="flex gap-2">
                <Link href="/create-post">
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Post
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleLeave} disabled={memberActionLoading}>
                  {memberActionLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Leaving...
                    </>
                  ) : (
                    "Leave"
                  )}
                </Button>
              </div>
            ) : (
              <Button onClick={handleJoin} disabled={memberActionLoading}>
                {memberActionLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Joining...
                  </>
                ) : (
                  "Join Community"
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="posts" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Impact Stories
            <span className="ml-1 text-[10px] bg-primary/10 text-primary px-1.5 rounded-full font-black">
              {community._count.posts}
            </span>
          </TabsTrigger>
          <TabsTrigger value="members" className="gap-2">
            <Users className="h-4 w-4" />
            Members
            <span className="ml-1 text-[10px] bg-primary/10 text-primary px-1.5 rounded-full font-black">
              {community._count.members}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-6 focus-visible:ring-0">
          {isMember ? (
            posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-3xl border border-dashed border-border/60">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
                  <FileQuestion className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-black text-primary">No stories shared yet</h3>
                <p className="mt-2 text-sm text-muted-foreground font-medium max-w-[250px]">
                  Be the first to share an impact story in this community!
                </p>
                <Link href="/create-post" className="mt-6">
                  <Button className="rounded-full px-8 shadow-premium font-bold">
                    Start Your Story
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={currentUserId}
                    isAdmin={isAdmin}
                    onLike={handleLike}
                    onReport={handleReport}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )
          ) : (
            <div className="rounded-3xl border bg-card p-12 text-center shadow-premium flex flex-col items-center gap-4">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-black text-primary">Join to view stories</h3>
                <p className="text-muted-foreground font-medium mt-1">
                  Connect with this community to see their collective impact.
                </p>
              </div>
              <Button onClick={handleJoin} disabled={memberActionLoading} className="rounded-full px-8 font-bold mt-2">
                Join Community
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="members" className="space-y-4 focus-visible:ring-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {members.map((member) => (
              <Link key={member.id} href={`/profile/${member.id}`}>
                <div className="bg-card border border-border/40 rounded-2xl p-4 flex items-center gap-4 hover:border-primary/20 hover:bg-primary/5 transition-all group">
                  <Avatar className="h-12 w-12 border-2 border-primary/10 group-hover:border-primary/30 transition-all">
                    <AvatarImage src={member.image || ""} className="object-cover" />
                    <AvatarFallback className="font-black text-primary bg-primary/5">
                      {member.name?.charAt(0).toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-sm text-primary truncate group-hover:text-primary/80 transition-colors">
                        {member.name || "Anonymous Member"}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full shrink-0">
                        <Award className="h-3 w-3" />
                        {member.points}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        Joined {formatDate(member.joinedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {members.length === 0 && (
            <div className="text-center py-20 bg-muted/10 rounded-3xl border-2 border-dashed border-border/40">
              <p className="text-muted-foreground font-bold italic">No members found.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

    </div>
  );
}
