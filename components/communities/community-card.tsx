"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Users, FileText } from "lucide-react";
import { toast } from "sonner";


import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
  const [isExpanded, setIsExpanded] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);

  const handleButtonClick = () => {
    if (isMember) {
      if (!confirmLeave) {
        setConfirmLeave(true);
        toast.warning(`Are you sure you want to leave ${community.name}?`, {
          description: "Click again to confirm.",
        });
        // Reset after 4 seconds
        setTimeout(() => setConfirmLeave(false), 4000);
        return;
      }

      onLeave?.(community.id);
      setConfirmLeave(false);
    } else {
      onJoin?.(community.id);
    }
  };

  return (
    <Card className="bg-card rounded-[2.5rem] overflow-hidden shadow-premium hover:shadow-premium-hover transition-all duration-500 flex flex-col h-full group border-border/40">
      <div className="h-48 relative overflow-hidden">
        {/* Background Image / Gradient */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
          style={{ 
            backgroundImage: community.image ? `url(${community.image})` : undefined,
            backgroundColor: !community.image ? 'var(--color-primary-container)' : undefined
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/60 to-black/20 opacity-80" />
        
        {/* Community Initial / Logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-xl border border-white/30 rounded-[1.5rem] flex items-center justify-center text-white text-3xl font-black shadow-2xl transition-transform duration-500 group-hover:rotate-12">
            {community.name.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      <CardContent className="p-8 flex-grow flex flex-col">
        <Link href={`/communities/${community.slug}`}>
          <h3 className="font-display text-2xl font-black text-foreground mb-3 group-hover:text-primary transition-colors leading-tight">
            {community.name}
          </h3>
        </Link>
        
        <div className="flex-grow">
          <p className={cn(
            "text-muted-foreground font-medium text-sm leading-relaxed mb-4",
            !isExpanded && "line-clamp-3"
          )}>
            {community.description || "Join this community to start making an impact together."}
          </p>
          {community.description && community.description.length > 120 && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors mb-6"
            >
              {isExpanded ? "Show Less" : "Read More"}
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8 border-t border-border/40 pt-6">
          <Link 
            href={`/communities/${community.slug}?tab=members`}
            className="space-y-1 p-2 rounded-xl hover:bg-primary/5 transition-all group/stat"
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover/stat:text-primary transition-colors">Members</p>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <p className="font-display text-xl font-black">{community._count.members.toLocaleString()}</p>
            </div>
          </Link>
          <Link 
            href={`/communities/${community.slug}?tab=posts`}
            className="space-y-1 p-2 rounded-xl hover:bg-primary/5 transition-all group/stat"
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover/stat:text-primary transition-colors">Posts</p>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <p className="font-display text-xl font-black">{community._count.posts.toLocaleString()}</p>
            </div>
          </Link>
        </div>



        <Button
          onClick={handleButtonClick}
          disabled={memberActionLoading}
          variant={isMember ? "outline" : "default"}
          className={cn(
            "w-full py-7 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300",
            isMember 
              ? confirmLeave 
                ? "border-2 border-destructive/50 text-destructive bg-destructive/5" 
                : "border-2 border-primary/20 text-primary hover:bg-primary/5" 
              : "bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
          )}
        >
          {memberActionLoading 
            ? "Processing..." 
            : isMember 
              ? confirmLeave 
                ? "Confirm Leave?" 
                : "Leave Community" 
              : "Join Community"}
        </Button>

      </CardContent>
    </Card>
  );
}

import { cn } from "@/lib/utils";
