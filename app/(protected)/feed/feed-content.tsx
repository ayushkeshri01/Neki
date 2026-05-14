"use client";

import { useState } from "react";
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
import { FileQuestion } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import Link from "next/link";

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
  likes: { userId: string; type: string; user: { name: string | null; image: string | null } }[];
}

interface FeedContentProps {
  posts: Post[];
  currentUserId: string;
  isAdmin: boolean;
}

export function FeedContent({ posts: initialPosts, currentUserId, isAdmin }: FeedContentProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "hidden">("all");
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

  const filteredPosts =
    filter === "all"
      ? initialPosts.filter((p) => p.status === "VISIBLE")
      : initialPosts.filter((p) => p.status === "HIDDEN");

  return (
    <>
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
          <div>
            <h1 className="font-display text-4xl font-extrabold text-foreground tracking-tight">Feed</h1>
            <p className="text-muted-foreground text-sm mt-1 font-medium">Discover impact stories from your community.</p>
          </div>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)} className="w-full md:w-auto">
            <TabsList className="bg-muted/50 p-1 rounded-full border border-border/40">
              <TabsTrigger value="all" className="rounded-full px-6 data-[state=active]:bg-card data-[state=active]:shadow-sm">All Posts</TabsTrigger>
              {isAdmin && (
                <TabsTrigger value="hidden" className="rounded-full px-6 data-[state=active]:bg-card data-[state=active]:shadow-sm">Hidden</TabsTrigger>
              )}
            </TabsList>
          </Tabs>
        </div>

        {filteredPosts.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center bg-card/50 rounded-[2.5rem] border border-dashed border-border/60"
          >
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-primary/5 text-primary">
              <FileQuestion className="h-10 w-10" />
            </div>
            <h3 className="font-display text-2xl font-bold">No posts yet</h3>
            <p className="mt-2 text-muted-foreground max-w-xs">
              Be the first to share your social work and inspire others!
            </p>
            <Button asChild className="mt-8 rounded-full px-8 py-6 font-bold shadow-premium">
              <Link href="/create-post">Share Impact</Link>
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-8">
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
