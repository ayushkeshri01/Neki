"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CommunityCard } from "@/components/communities/community-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users } from "lucide-react";
import { toast } from "sonner";

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

import { motion } from "framer-motion";

export function CommunitiesContent({
  communities,
  memberCommunityIds,
}: CommunitiesContentProps) {
  const router = useRouter();
  const [loadingCommunities, setLoadingCommunities] = useState<Set<string>>(
    new Set()
  );

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

  const myCommunities = communities.filter((c) => memberCommunityIds.includes(c.id));
  const otherCommunities = communities.filter((c) => !memberCommunityIds.includes(c.id));

  return (
    <div className="mx-auto max-w-container-max px-4 py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="font-display text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight">Communities</h1>
          <p className="text-muted-foreground text-sm mt-1 font-medium italic">Together, we can achieve more.</p>
        </div>
      </div>

      <Tabs defaultValue="my" className="w-full">
        <TabsList className="bg-muted/50 p-1 rounded-full border border-border/40 inline-flex">
          <TabsTrigger value="my" className="rounded-full px-8 py-2 data-[state=active]:bg-card data-[state=active]:shadow-sm font-bold">My Circles</TabsTrigger>
          <TabsTrigger value="browse" className="rounded-full px-8 py-2 data-[state=active]:bg-card data-[state=active]:shadow-sm font-bold">Explore</TabsTrigger>
        </TabsList>
        <TabsContent value="my" className="mt-10 outline-none">
          {myCommunities.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center bg-card/50 rounded-[2.5rem] border border-dashed border-border/60"
            >
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-primary/5 text-primary">
                <Users className="h-10 w-10" />
              </div>
              <h3 className="font-display text-2xl font-bold">You haven&apos;t joined any communities</h3>
              <p className="mt-2 text-muted-foreground max-w-xs mx-auto">
                Discover and join groups that resonate with your passions to start sharing impact.
              </p>
            </motion.div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {myCommunities.map((community, i) => (
                <motion.div
                  key={community.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <CommunityCard
                    community={community}
                    isMember={true}
                    onLeave={handleLeave}
                    memberActionLoading={loadingCommunities.has(community.id)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="browse" className="mt-10 outline-none">
          {otherCommunities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-card/50 rounded-[2.5rem] border border-dashed border-border/60">
              <p className="text-muted-foreground font-bold">You&apos;re part of every community available!</p>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {otherCommunities.map((community, i) => (
                <motion.div
                  key={community.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <CommunityCard
                    community={community}
                    isMember={false}
                    onJoin={handleJoin}
                    memberActionLoading={loadingCommunities.has(community.id)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
