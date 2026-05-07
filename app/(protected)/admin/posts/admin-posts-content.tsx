"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Post {
  id: string;
  content: string;
  status: "VISIBLE" | "HIDDEN" | "REMOVED";
  points: number;
  createdAt: Date;
  moderationReason: string | null;
  author: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    points: number;
  };
  communities: {
    community: {
      name: string;
    };
  }[];
  _count: {
    likes: number;
  };
}

interface AdminPostsContentProps {
  initialPosts: Post[];
}

type ModerationAction = "hide" | "remove" | "restore";

export function AdminPostsContent({ initialPosts: posts }: AdminPostsContentProps) {
  const router = useRouter();

  const [filter, setFilter] = useState<"all" | "visible" | "hidden" | "removed">("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reason, setReason] = useState("");
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    action: ModerationAction;
    post: Post | null;
  }>({
    open: false,
    action: "hide",
    post: null,
  });

  const filteredPosts = posts.filter((post) => {
    if (filter === "visible") return post.status === "VISIBLE";
    if (filter === "hidden") return post.status === "HIDDEN";
    if (filter === "removed") return post.status === "REMOVED";
    return true;
  });

  function openModerationDialog(action: ModerationAction, post: Post) {
    const defaultReason =
      action === "hide"
        ? "Post hidden by administrator"
        : action === "remove"
          ? "Post removed by administrator"
          : "Post restored by administrator";

    setReason(defaultReason);
    setDialogState({ open: true, action, post });
  }

  function closeModerationDialog() {
    setDialogState((prev) => ({ ...prev, open: false, post: null }));
    setReason("");
  }

  async function submitModeration() {
    if (!dialogState.post) {
      return;
    }

    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      toast.error("Please provide a moderation reason.");
      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint =
        dialogState.action === "hide"
          ? `/api/admin/posts/${dialogState.post.id}/hide`
          : dialogState.action === "restore"
            ? `/api/admin/posts/${dialogState.post.id}/restore`
            : `/api/admin/posts/${dialogState.post.id}`;

      const method = dialogState.action === "remove" ? "DELETE" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: trimmedReason }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Moderation action failed.");
        return;
      }

      toast.success("Post moderation updated.");
      closeModerationDialog();
      router.refresh();
    } catch {
      toast.error("Moderation action failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Posts</h2>
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button
            variant={filter === "visible" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilter("visible")}
          >
            Visible
          </Button>
          <Button
            variant={filter === "hidden" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilter("hidden")}
          >
            Hidden
          </Button>
          <Button
            variant={filter === "removed" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilter("removed")}
          >
            Removed
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <Card
            key={post.id}
            className={cn(
              "overflow-hidden",
              post.status === "HIDDEN" && "border-amber-500/50",
              post.status === "REMOVED" && "border-destructive/40 opacity-70"
            )}
          >
            <CardContent className="py-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={post.author.image || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {post.author.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/profile/${post.author.id}`}
                        className="font-medium hover:underline"
                      >
                        {post.author.name || "Anonymous"}
                      </Link>
                      <Badge
                        variant={
                          post.status === "VISIBLE"
                            ? "default"
                            : post.status === "HIDDEN"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {post.status === "HIDDEN" ? (
                          <EyeOff className="h-3 w-3 mr-1" />
                        ) : (
                          <Eye className="h-3 w-3 mr-1" />
                        )}
                        {post.status}
                      </Badge>
                    </div>

                    <p className="mt-1 text-sm line-clamp-2">{post.content}</p>

                    {post.moderationReason && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Reason: {post.moderationReason}
                      </p>
                    )}

                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{post._count.likes} likes</span>
                      <span>{post.points > 0 ? `+${post.points}` : post.points} points</span>
                    </div>

                    <div className="mt-1 flex flex-wrap gap-1">
                      {post.communities.map((cp) => (
                        <Badge key={cp.community.name} variant="outline" className="text-xs">
                          {cp.community.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {post.status === "VISIBLE" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => openModerationDialog("hide", post)}
                    >
                      <EyeOff className="h-4 w-4" />
                      Hide
                    </Button>
                  )}

                  {(post.status === "HIDDEN" || post.status === "REMOVED") && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => openModerationDialog("restore", post)}
                    >
                      <RotateCcw className="h-4 w-4" />
                      Restore
                    </Button>
                  )}

                  {post.status !== "REMOVED" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => openModerationDialog("remove", post)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogState.open} onOpenChange={(open) => !open && closeModerationDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogState.action === "hide"
                ? "Hide Post"
                : dialogState.action === "remove"
                  ? "Remove Post"
                  : "Restore Post"}
            </DialogTitle>
            <DialogDescription>
              {dialogState.action === "hide"
                ? "This post will be hidden from normal feed visibility."
                : dialogState.action === "remove"
                  ? "This post will be marked as removed."
                  : "This post will become visible again."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <label className="text-sm font-medium">Moderation Reason</label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Explain why this action is being taken..."
            />
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={closeModerationDialog} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="button" onClick={submitModeration} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
