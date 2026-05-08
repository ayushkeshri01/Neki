"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PostCard } from "@/components/posts/post-card";
import type { ReactionType } from "@/lib/reactions";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileQuestion, Loader2 } from "lucide-react";
import { toast } from "sonner";

export interface Post {
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
  likes: { userId: string; type: string }[];
}

interface FeedContentProps {
  posts: Post[];
  currentUserId: string;
  isAdmin: boolean;
  hasMore?: boolean;
  nextCursor?: string;
}

export function FeedContent({ posts: initialPosts, currentUserId, isAdmin, hasMore: initialHasMore, nextCursor: initialNextCursor }: FeedContentProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "hidden">("all");
  const [reportPostId, setReportPostId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [allPosts, setAllPosts] = useState(initialPosts);
  const [hasMore, setHasMore] = useState(initialHasMore ?? false);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [loadingMore, setLoadingMore] = useState(false);

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
    setReportPostId(postId);
    setReportReason("");
  };

  const submitReport = async () => {
    const postId = reportPostId;
    if (!postId || !reportReason.trim()) return;

    try {
      const res = await fetch(`/api/posts/${postId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reportReason.trim() }),
      });
      if (res.ok) {
        toast.success("Post reported. Thank you for the feedback.");
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

  const loadMore = useCallback(async () => {
    if (loadingMore || !nextCursor) return;
    setLoadingMore(true);
    try {
      const params = new URLSearchParams({ cursor: nextCursor });
      const res = await fetch(`/api/posts?${params}`);
      if (!res.ok) throw new Error("Failed to load more posts");
      const data: Post[] = await res.json();
      setAllPosts((prev) => [...prev, ...data]);
      setHasMore(data.length > 0);
      if (data.length > 0) {
        setNextCursor(data[data.length - 1].id);
      } else {
        setNextCursor(undefined);
      }
    } catch {
      toast.error("Failed to load more posts.");
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, nextCursor]);

  const filteredPosts =
    filter === "all"
      ? allPosts.filter((p) => p.status === "VISIBLE")
      : allPosts.filter((p) => p.status === "HIDDEN");

  return (
    <>
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
            {hasMore && (
              <div className="flex justify-center pt-4">
                <Button onClick={loadMore} disabled={loadingMore} variant="outline">
                  {loadingMore && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loadingMore ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <Dialog open={reportPostId !== null} onOpenChange={(open) => { if (!open) setReportPostId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Post</DialogTitle>
            <DialogDescription>
              Please provide a reason for reporting this post.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Enter the reason for your report..."
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportPostId(null)}>
              Cancel
            </Button>
            <Button onClick={submitReport} disabled={!reportReason.trim()}>
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
