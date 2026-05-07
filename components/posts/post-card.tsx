"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MoreHorizontal, Flag, EyeOff, Trash2 } from "lucide-react";
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
import {
  ReactionButton,
  type ReactionType,
} from "@/components/posts/reaction-button";
import { ImageLightbox } from "@/components/posts/image-lightbox";

interface PostLike {
  userId: string;
  type?: string; // Prisma ReactionType (LIKE | CELEBRATE | LOVE | INSIGHTFUL | SUPPORT)
}

interface PostCardProps {
  post: {
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

const DB_TO_UI: Record<string, ReactionType> = {
  LIKE: "like",
  CELEBRATE: "celebrate",
  LOVE: "love",
  INSIGHTFUL: "insightful",
  SUPPORT: "support",
};

function getReactionState(
  post: PostCardProps["post"],
  currentUserId?: string
): ReactionState {
  const own = post.likes.find((l) => l.userId === currentUserId);
  return {
    reaction: own ? DB_TO_UI[own.type ?? "LIKE"] ?? "like" : null,
    likeCount: post._count.likes,
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
  const [reactionState, setReactionState] = useState(() =>
    getReactionState(post, currentUserId)
  );

  const [prevPostKey, setPrevPostKey] = useState("");
  const currentPostKey = `${post.id}-${currentUserId}`;
  if (currentPostKey !== prevPostKey) {
    setPrevPostKey(currentPostKey);
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
      // changing reaction (both true) → count unchanged
      return { reaction: next, likeCount: nextCount };
    });
    onLike?.(post.id, next);
  };

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  const isHidden = post.status === "HIDDEN";
  const canDeletePost = currentUserId === post.author.id || isAdmin;

  return (
    <Card className={cn("overflow-hidden", isHidden && "opacity-60")}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/profile/${post.author.id}`}>
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.author.image || ""} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {post.author.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/profile/${post.author.id}`}
                  className="font-medium hover:underline"
                >
                  {post.author.name || "Anonymous"}
                </Link>
                <span className="text-xs text-muted-foreground">
                  {post.author.points} Good Deed Credits (GDCs)
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatTimeAgo(post.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              +{post.points} Good Deed Credits (GDCs)
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canDeletePost && (
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => onDelete?.(post.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => onReport?.(post.id)}
                >
                  <Flag className="mr-2 h-4 w-4" />
                  Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Communities */}
        <div className="mt-3 flex flex-wrap gap-1">
          {post.communities.map(({ community }) => (
            <Link key={community.id} href={`/communities/${community.slug}`}>
              <Badge variant="outline" className="text-xs hover:bg-accent">
                {community.name}
              </Badge>
            </Link>
          ))}
        </div>

        {/* Content */}
        <div className="mt-4">
          <p className="whitespace-pre-wrap text-sm">{post.content}</p>
        </div>

        {/* Images */}
        {post.images.length > 0 && (
          <div
            className={cn(
              "mt-4 grid gap-2",
              post.images.length === 1 && "grid-cols-1",
              post.images.length === 2 && "grid-cols-2",
              post.images.length >= 3 && "grid-cols-2"
            )}
          >
            {post.images.slice(0, 4).map((image, index) => (
              <button
                key={index}
                type="button"
                className={cn(
                  "relative overflow-hidden rounded-lg bg-muted cursor-pointer text-left",
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
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Status Badge */}
        {isHidden && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-500/10 p-3 text-amber-600">
            <EyeOff className="h-4 w-4" />
            <span className="text-sm">This post is hidden due to community feedback</span>
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2 border-t pt-4">
          <ReactionButton
            reaction={reaction}
            count={likeCount}
            onChange={handleReactionChange}
            disabled={!currentUserId}
          />
        </div>
      </div>

      <ImageLightbox
        images={post.images}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
      />
    </Card>
  );
}
