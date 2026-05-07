"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PostCard } from "@/components/posts/post-card";
import type { ReactionType } from "@/components/posts/reaction-button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileQuestion } from "lucide-react";
import { toast } from "sonner";

interface Post {
  id: string;
  content: string;
  images: string[];
  points: number;
  status: string;
  createdAt: Date;
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
  likes: { userId: string; type: string }[];
}

interface FeedContentProps {
  posts: Post[];
  currentUserId: string;
  isAdmin: boolean;
}

export function FeedContent({ posts, currentUserId, isAdmin }: FeedContentProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "hidden">("all");

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
        toast.success("Post reported. Thank you for the feedback.");
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

  const filteredPosts =
    filter === "all"
      ? posts.filter((p) => p.status === "VISIBLE")
      : posts.filter((p) => p.status === "HIDDEN");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Feed</h1>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList>
            <TabsTrigger value="all">All Posts</TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="hidden">Hidden</TabsTrigger>
            )}
          </TabsList>
        </Tabs>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <FileQuestion className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No posts yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Be the first to share your social work!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
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
      )}
    </div>
  );
}
