"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { CommunityCard } from "@/components/communities/community-card";
import { Search, Users, Sparkles, Filter } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Community {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  _count: {
    members: number;
    posts: number;
  };
}

interface CommunitiesContentProps {
  communities: Community[];
  memberCommunityIds: string[];
}


export function CommunitiesContent({
  communities,
  memberCommunityIds,
}: CommunitiesContentProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"explore" | "my">("explore");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingCommunities, setLoadingCommunities] = useState<Set<string>>(new Set());

  const getCommunityName = (id: string) =>
    communities.find((c) => c.id === id)?.name || "community";

  const handleJoin = async (communityId: string) => {
    const name = getCommunityName(communityId);
    setLoadingCommunities((prev) => new Set(prev).add(communityId));
    try {
      const res = await fetch(`/api/communities/${communityId}/join`, {
        method: "POST",
      });

      if (res.ok) {
        toast.success(`Joined ${name}.`);
        router.refresh();
        return;
      }

      const data = await res
        .json()
        .catch(() => ({ error: `Request failed (${res.status})` }));
      toast.error(data.error || `Failed to join ${name}.`);
    } catch {
      toast.error(`Failed to join ${name}.`);
    } finally {
      setLoadingCommunities((prev) => {
        const next = new Set(prev);
        next.delete(communityId);
        return next;
      });
    }
  };

  const handleLeave = async (communityId: string) => {
    const name = getCommunityName(communityId);
    setLoadingCommunities((prev) => new Set(prev).add(communityId));
    try {
      const res = await fetch(`/api/communities/${communityId}/leave`, {
        method: "POST",
      });

      if (res.ok) {
        toast.success(`Left ${name}.`);
        router.refresh();
        return;
      }

      const data = await res
        .json()
        .catch(() => ({ error: `Request failed (${res.status})` }));
      toast.error(data.error || `Failed to leave ${name}.`);
    } catch {
      toast.error(`Failed to leave ${name}.`);
    } finally {
      setLoadingCommunities((prev) => {
        const next = new Set(prev);
        next.delete(communityId);
        return next;
      });
    }
  };

  const filteredCommunities = useMemo(() => {
    return communities.filter((c) => {
      const isMember = memberCommunityIds.includes(c.id);
      const matchesTab = activeTab === "my" ? isMember : true;
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      
      return matchesTab && matchesSearch;
    });
  }, [communities, memberCommunityIds, activeTab, searchQuery]);

  return (
    <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop py-12 space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-black uppercase tracking-widest"
        >
          <Sparkles className="h-4 w-4 fill-current" />
          Community Hub
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-display text-5xl md:text-7xl font-black tracking-tight text-foreground leading-[1.1]"
        >
          Find Your <span className="text-primary italic">People</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-muted-foreground font-medium leading-relaxed"
        >
          Together, we can achieve more. Join communities dedicated to making a real impact in the world.
        </motion.p>
      </section>

      {/* Search and Filters */}
      <section className="space-y-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Custom Tabs */}
          <div className="bg-muted/30 p-1.5 rounded-[1.5rem] inline-flex self-start border border-border/40 shadow-inner">
            <button 
              onClick={() => setActiveTab("my")}
              className={cn(
                "px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300",
                activeTab === "my" 
                  ? "bg-card text-primary shadow-premium" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              My Circles
            </button>
            <button 
              onClick={() => setActiveTab("explore")}
              className={cn(
                "px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300",
                activeTab === "explore" 
                  ? "bg-card text-primary shadow-premium" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Explore
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full lg:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              className="pl-12 pr-4 py-6 bg-card border-border/40 rounded-2xl shadow-premium focus:ring-primary/20 transition-all text-lg"
              placeholder="Search communities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

      </section>

      {/* Community Grid */}
      <section>
        <AnimatePresence mode="popLayout">
          {filteredCommunities.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-24 text-center bg-card/50 rounded-[2.5rem] border border-dashed border-border/60"
            >
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-primary/5 text-primary">
                <Users className="h-10 w-10" />
              </div>
              <h3 className="font-display text-2xl font-bold">No communities found</h3>
              <p className="mt-2 text-muted-foreground max-w-xs mx-auto">
                Try adjusting your search or category filters to find what you&apos;re looking for.
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCommunities.map((community, i) => (
                <motion.div
                  key={community.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <CommunityCard
                    community={community}
                    isMember={memberCommunityIds.includes(community.id)}
                    onJoin={handleJoin}
                    onLeave={handleLeave}
                    memberActionLoading={loadingCommunities.has(community.id)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
