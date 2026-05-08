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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Communities</h1>
      </div>

      <Tabs defaultValue="my">
        <TabsList>
          <TabsTrigger value="my">My Communities</TabsTrigger>
          <TabsTrigger value="browse">Browse</TabsTrigger>
        </TabsList>
        <TabsContent value="my" className="mt-6">
          {myCommunities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No communities yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Join a community to see posts and participate!
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {myCommunities.map((community) => (
                <CommunityCard
                  key={community.id}
                  community={community}
                  isMember={true}
                  onLeave={handleLeave}
                  memberActionLoading={loadingCommunities.has(community.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="browse" className="mt-6">
          {otherCommunities.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              No other communities available
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {otherCommunities.map((community) => (
                <CommunityCard
                  key={community.id}
                  community={community}
                  isMember={false}
                  onJoin={handleJoin}
                  memberActionLoading={loadingCommunities.has(community.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
