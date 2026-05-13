"use client";

import { useState } from "react";
import Link from "next/link";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CommunityCardProps {
  community: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    _count: {
      members: number;
      posts: number;
    };
  };
  isMember: boolean;
  onJoin?: (communityId: string) => void;
  onLeave?: (communityId: string) => void;
  memberActionLoading?: boolean;
}

export function CommunityCard({
  community,
  isMember,
  onJoin,
  onLeave,
  memberActionLoading,
}: CommunityCardProps) {
  return (
    <Card className="overflow-hidden group border-border/40 shadow-premium transition-all hover:shadow-premium-hover rounded-[2rem] bg-card flex flex-col h-full">
      <div className="relative aspect-[2/1] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/5 transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Avatar className="h-20 w-20 border-4 border-card shadow-xl ring-4 ring-primary/5">
            <AvatarImage src={community.image || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-black">
              {community.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
      <CardContent className="pt-8 flex-grow">
        <Link href={`/communities/${community.slug}`}>
          <h3 className="font-display font-black text-xl hover:text-primary transition-colors mb-2">{community.name}</h3>
        </Link>
        {community.description && (
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed mb-6 font-medium">
            {community.description}
          </p>
        )}
        <div className="flex items-center gap-6 mt-auto">
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Members</span>
            <span className="font-bold text-foreground">{community._count.members.toLocaleString()}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Posts</span>
            <span className="font-bold text-foreground">{community._count.posts.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0 mt-4">
        {isMember ? (
          <Button
            variant="outline"
            className="w-full rounded-full border-2 border-primary/20 text-primary hover:bg-primary/5 font-bold py-6 transition-all"
            onClick={() => onLeave?.(community.id)}
            disabled={memberActionLoading}
          >
            Leave Community
          </Button>
        ) : (
          <Button
            className="w-full rounded-full font-bold py-6 shadow-premium hover:shadow-premium-hover transition-all"
            onClick={() => onJoin?.(community.id)}
            disabled={memberActionLoading}
          >
            Join Community
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
