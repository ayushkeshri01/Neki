"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { MoreHorizontal, FlagOff, EyeOff, Trash2 } from "lucide-react";
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
import { cn, formatTimeAgo } from "@/lib/utils";
import { ReactionButton } from "@/components/posts/reaction-button";
import type { ReactionType } from "@/lib/reactions";
import { DB_TO_UI } from "@/lib/reactions";
import { ImageLightbox } from "@/components/posts/image-lightbox";

interface PostLike {
  userId: string;
  type: string; // Prisma ReactionType (LIKE | CELEBRATE | LOVE | INSIGHTFUL | SUPPORT)
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
}

function getReactionState(
  post: PostCardProps["post"],
  currentUserId?: string
): ReactionState {
  const own = post.likes.find((l) => l.userId === currentUserId);
  return {
    reaction: own ? DB_TO_UI[own.type as keyof typeof DB_TO_UI] ?? "like" : null,
    likeCount: post._count.likes,
  };
}

import { motion } from "framer-motion";

export function PostCard({
  post,
  currentUserId,
  isAdmin,
  onLike,
  onReport,
  onDelete,
}: PostCardProps) {
  const [reactionState, setReactionState] = useState(() =>
    getReactionState(post, currentUserId)
  );

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
      if (!wasReacted && willReact) nextCount += 1;
      else if (wasReacted && !willReact) nextCount = Math.max(0, nextCount - 1);
      return { reaction: next, likeCount: nextCount };
    });
    onLike?.(post.id, next);
  };

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  const isHidden = post.status === "HIDDEN";
  const canDeletePost = currentUserId === post.author.id || isAdmin;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className="w-full"
    >
      <Card className={cn(
        "overflow-hidden border-border/40 shadow-premium transition-shadow hover:shadow-premium-hover", 
        isHidden && "opacity-60 grayscale-[0.5]"
      )}>
        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Link href={`/profile/${post.author.id}`}>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Avatar className="h-11 w-11 border-2 border-primary/20 shadow-sm">
                    <AvatarImage src={post.author.image || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {post.author.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/profile/${post.author.id}`}
                    className="font-bold hover:text-primary transition-colors"
                  >
                    {post.author.name || "Anonymous"}
                  </Link>
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-bold px-2 py-0">
                    {post.author.points}
                  </Badge>
                </div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  {formatTimeAgo(post.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
              >
                <Badge className="bg-primary-container text-on-primary-container hover:bg-primary-container/90 border-none font-black text-[10px] px-3 py-1 rounded-full shadow-sm">
                  +{post.points} GDCs
                </Badge>
              </motion.div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl">
                  {canDeletePost && (
                    <DropdownMenuItem
                      className="text-destructive font-medium"
                      onClick={() => onDelete?.(post.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Post
                    </DropdownMenuItem>
                  )}
                  {currentUserId !== post.author.id && (
                    <DropdownMenuItem
                      className="font-medium"
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
          <div className="mt-3 flex flex-wrap gap-2">
            {post.communities.map(({ community }) => (
              <Link key={community.id} href={`/communities/${community.slug}`}>
                <Badge variant="secondary" className="bg-muted text-muted-foreground text-[10px] font-bold hover:bg-primary/10 hover:text-primary border-none transition-all">
                  #{community.slug}
                </Badge>
              </Link>
            ))}
          </div>

          {/* Content */}
          <div className="mt-5">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{post.content}</p>
          </div>

          {/* Images */}
          {post.images.length > 0 && (
            <div
              className={cn(
                "mt-5 grid gap-3",
                post.images.length === 1 && "grid-cols-1",
                post.images.length === 2 && "grid-cols-2",
                post.images.length >= 3 && "grid-cols-2"
              )}
            >
              {post.images.slice(0, 4).map((image, index) => (
                <motion.button
                  key={index}
                  type="button"
                  whileHover={{ scale: 1.01, filter: "brightness(1.1)" }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "relative overflow-hidden rounded-2xl bg-muted cursor-pointer text-left shadow-sm border border-border/20",
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
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                </motion.button>
              ))}
            </div>
          )}

          {/* Status Badge */}
          {isHidden && (
            <div className="mt-5 flex items-center gap-3 rounded-2xl bg-amber-500/10 p-4 text-amber-700 border border-amber-500/20">
              <EyeOff className="h-5 w-5" />
              <span className="text-xs font-bold italic leading-tight">This post has been hidden by the community for safety.</span>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between">
            <ReactionButton
              reaction={reaction}
              count={likeCount}
              onChange={handleReactionChange}
              disabled={!currentUserId}
            />
            
            {/* Social Proof placeholder - could show avatar group of likers */}
            {likeCount > 0 && (
              <div className="flex -space-x-2">
                {[1, 2].slice(0, Math.min(likeCount, 2)).map((i) => (
                  <div key={i} className="w-6 h-6 rounded-full border-2 border-background bg-muted overflow-hidden">
                    <Image src={`https://i.pravatar.cc/150?u=${post.id}${i}`} alt="Liker" width={24} height={24} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <ImageLightbox
          images={post.images}
          initialIndex={lightboxIndex}
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
        />
      </Card>
    </motion.div>
  );
}
