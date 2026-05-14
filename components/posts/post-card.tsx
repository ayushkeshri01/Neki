"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { MoreHorizontal, FlagOff, EyeOff, Trash2, Star, Pencil } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn, formatTimeAgo } from "@/lib/utils";
import { ReactionButton, REACTIONS } from "@/components/posts/reaction-button";
import type { ReactionType } from "@/lib/reactions";
import { DB_TO_UI } from "@/lib/reactions";
import { ImageLightbox } from "@/components/posts/image-lightbox";
import { motion } from "framer-motion";

interface PostLike {
  userId: string;
  type: string; // Prisma ReactionType
  user: {
    name: string | null;
    image: string | null;
  };
}

interface PostCardProps {
  post: {
    id: string;
    content: string;
    images: string[];
    points: number;
    status: string;
    createdAt: Date | string;
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
    likes: PostLike[];
  };
  currentUserId?: string;
  isAdmin?: boolean;
  onLike?: (postId: string, reaction: ReactionType | null) => void;
  onReport?: (postId: string) => void;
  onDelete?: (postId: string) => void;
}

interface ReactionState {
  reaction: ReactionType | null;
  likeCount: number;
  counts: Record<ReactionType, number>;
}

function getReactionState(
  post: PostCardProps["post"],
  currentUserId?: string
): ReactionState & { counts: Record<ReactionType, number> } {
  const own = post.likes.find((l) => l.userId === currentUserId);
  
  const counts: Record<ReactionType, number> = {
    like: 0,
    celebrate: 0,
    love: 0,
    insightful: 0,
    support: 0
  };

  post.likes.forEach(l => {
    const uiType = DB_TO_UI[l.type as keyof typeof DB_TO_UI] as ReactionType;
    if (uiType) counts[uiType]++;
  });

  return {
    reaction: own ? DB_TO_UI[own.type as keyof typeof DB_TO_UI] ?? "like" : null,
    likeCount: post._count.likes,
    counts
  };
}



export function PostCard({
  post,
  currentUserId,
  isAdmin,
  onLike,
  onReport,
  onDelete,
}: PostCardProps) {
  const router = useRouter();
  const [reactionState, setReactionState] = useState(() =>
    getReactionState(post, currentUserId)
  );

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [isEditing, setIsEditing] = useState(false);

  const [prevPostId, setPrevPostId] = useState(post.id);
  const [prevUserId, setPrevUserId] = useState(currentUserId);

  if (post.id !== prevPostId || currentUserId !== prevUserId) {
    setPrevPostId(post.id);
    setPrevUserId(currentUserId);
    setReactionState(getReactionState(post, currentUserId));
  }

  const { reaction, likeCount } = reactionState;

  const handleReactionChange = (next: ReactionType | null) => {
    if (!currentUserId) return;
    setReactionState((s) => {
      const wasReacted = s.reaction !== null;
      const willReact = next !== null;
      let nextCount = s.likeCount;
      const nextCounts = { ...s.counts };

      // Update total count
      if (!wasReacted && willReact) nextCount += 1;
      else if (wasReacted && !willReact) nextCount = Math.max(0, nextCount - 1);

      // Update individual counts
      if (wasReacted && s.reaction) {
        nextCounts[s.reaction] = Math.max(0, nextCounts[s.reaction] - 1);
      }
      if (willReact && next) {
        nextCounts[next] = (nextCounts[next] || 0) + 1;
      }

      return { reaction: next, likeCount: nextCount, counts: nextCounts };
    });
    onLike?.(post.id, next);
  };

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  const isHidden = post.status === "HIDDEN";
  const isAuthor = currentUserId === post.author.id;
  const canDeletePost = isAuthor || isAdmin;

  const handleEdit = async () => {
    if (!editContent.trim() || editContent === post.content) {
      setEditDialogOpen(false);
      return;
    }

    setIsEditing(true);
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent.trim() }),
      });

      if (res.ok) {
        toast.success("Post updated successfully.");
        setEditDialogOpen(false);
        router.refresh();
        return;
      }

      const data = await res.json();
      toast.error(data.error || "Failed to update post.");
    } catch {
      toast.error("Failed to update post.");
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full"
    >
      <Card className={cn(
        "relative overflow-hidden border-border/40 shadow-premium transition-all hover:shadow-premium-hover rounded-[2rem] bg-card", 
        isHidden && "opacity-60 grayscale-[0.5]"
      )}>
        {/* Top Accent Gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />
        
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/profile/${post.author.id}`}>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="relative">
                  <Avatar className="h-12 w-12 border-2 border-primary/20 shadow-sm ring-4 ring-primary/5">
                    <AvatarImage src={post.author.image || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {post.author.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {post.author.points > 1000 && (
                    <div className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 rounded-full p-0.5 shadow-sm">
                      <Star className="h-3 w-3 fill-current" />
                    </div>
                  )}
                </motion.div>
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/profile/${post.author.id}`}
                    className="font-display font-black text-lg hover:text-primary transition-colors tracking-tight"
                  >
                    {post.author.name || "Anonymous"}
                  </Link>
                  <div className="hidden sm:block">
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-bold px-2 py-0 text-[10px] uppercase tracking-wider">
                      {post.author.points} Impact Score
                    </Badge>
                  </div>
                </div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-black">
                  {formatTimeAgo(post.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                className="hidden sm:block"
              >
                <div className="bg-primary-container/20 text-primary-container px-4 py-1.5 rounded-full border border-primary/10 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="font-black text-xs">+{post.points} GDCs</span>
                </div>
              </motion.div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-muted transition-colors">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-2xl p-2 min-w-[160px]">
                  {isAuthor && (
                    <DropdownMenuItem
                      className="font-bold p-3 rounded-xl"
                      onClick={() => setEditDialogOpen(true)}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit Post
                    </DropdownMenuItem>
                  )}
                  {canDeletePost && (
                    <DropdownMenuItem
                      className="text-destructive font-bold p-3 rounded-xl focus:bg-destructive/10 focus:text-destructive"
                      onClick={() => onDelete?.(post.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Post
                    </DropdownMenuItem>
                  )}
                  {currentUserId !== post.author.id && (
                    <DropdownMenuItem
                      className="font-bold p-3 rounded-xl"
                      onClick={() => onReport?.(post.id)}
                    >
                      <FlagOff className="mr-2 h-4 w-4" />
                      Report Post
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Communities */}
          <div className="mt-4 flex flex-wrap gap-2">
            {post.communities.map(({ community }) => (
              <Link key={community.id} href={`/communities/${community.slug}`}>
                <span className="inline-flex items-center text-[11px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 px-2 py-1 rounded-md transition-all">
                  #{community.slug}
                </span>
              </Link>
            ))}
          </div>

          {/* Content */}
          <div className="mt-6">
            <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground/90 font-medium tracking-tight">
              {post.content}
            </p>
          </div>

          {/* Images */}
          {post.images.length > 0 && (
            <div
              className={cn(
                "mt-6 grid gap-4",
                post.images.length === 1 && "grid-cols-1",
                post.images.length === 2 && "grid-cols-2",
                post.images.length >= 3 && "grid-cols-2"
              )}
            >
              {post.images.slice(0, 4).map((image, index) => (
                <motion.button
                  key={index}
                  type="button"
                  whileHover={{ scale: 1.02, filter: "brightness(1.05)" }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "relative overflow-hidden rounded-[1.5rem] bg-muted cursor-pointer text-left shadow-sm border border-border/20 group",
                    post.images.length === 1 && "aspect-video",
                    post.images.length === 2 && "aspect-square",
                    post.images.length >= 3 && index === 0 && "aspect-video col-span-2",
                    post.images.length >= 3 && index > 0 && "aspect-square"
                  )}
                  onClick={() => {
                    setLightboxIndex(index);
                    setLightboxOpen(true);
                  }}
                >
                  <Image
                    src={image}
                    alt={`Post image ${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                </motion.button>
              ))}
            </div>
          )}

          {/* Status Badge */}
          {isHidden && (
            <div className="mt-6 flex items-center gap-4 rounded-3xl bg-destructive/10 p-5 text-destructive border border-destructive/20">
              <EyeOff className="h-6 w-6" />
              <span className="text-sm font-bold leading-tight">This post has been hidden by the community for safety.</span>
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 pt-6 border-t border-border/20 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <ReactionButton
                  reaction={reaction}
                  count={likeCount}
                  onChange={handleReactionChange}
                  disabled={!currentUserId}
                  hideCount
                />
                
                {/* Individual Reaction Counts */}
                <div className="flex items-center gap-2 px-3 py-1 bg-muted/50 rounded-full border border-border/20">
                  {Object.entries(reactionState.counts).map(([type, count]) => {
                    if (count === 0) return null;
                    const config = REACTIONS.find(r => r.id === type);
                    return (
                      <div key={type} className="flex items-center gap-1 group/reaction">
                        <span className="text-sm">{config?.emoji}</span>
                        <span className="text-xs font-black text-muted-foreground">{count}</span>
                      </div>
                    );
                  })}
                  {likeCount === 0 && (
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">No reactions yet</span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Social Proof */}
            {likeCount > 0 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3"
              >
                <div className="flex -space-x-3">
                  {post.likes.slice(0, 3).map((like, i) => (
                    <div key={like.userId} className="w-8 h-8 rounded-full border-2 border-background bg-muted overflow-hidden ring-2 ring-primary/5 shadow-sm">
                      <Avatar className="h-full w-full">
                        <AvatarImage src={like.user?.image || ""} />
                        <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                          {like.user?.name?.charAt(0).toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  ))}
                  {likeCount > 3 && (
                    <div className="w-8 h-8 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-[10px] font-black text-white shadow-sm ring-2 ring-primary/5">
                      +{likeCount - 3}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <ImageLightbox
          images={post.images}
          initialIndex={lightboxIndex}
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
        />

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="rounded-[2.5rem] p-8 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl font-black">Edit Impact Story</DialogTitle>
              <DialogDescription className="font-medium">
                Refine your story to better inspire the community.
              </DialogDescription>
            </DialogHeader>
            <div className="py-6">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="What's on your mind?"
                className="min-h-[200px] rounded-2xl border-border/40 focus:ring-primary font-medium text-base p-4"
              />
            </div>
            <DialogFooter className="gap-3">
              <Button
                variant="outline"
                className="rounded-full px-8 py-6 font-bold"
                onClick={() => setEditDialogOpen(false)}
                disabled={isEditing}
              >
                Cancel
              </Button>
              <Button
                className="rounded-full px-8 py-6 font-bold shadow-premium"
                onClick={handleEdit}
                disabled={isEditing || !editContent.trim()}
              >
                {isEditing ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    </motion.div>
  );
}
