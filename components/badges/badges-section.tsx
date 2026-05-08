"use client";

import {
  Award,
  Heart,
  Building2,
  Zap,
  Landmark,
  Flame,
  Trophy,
  Lightbulb,
  MessageSquare,
  ThumbsUp,
  PartyPopper,
  Star,
  Compass,
  Users,
  Globe,
  Shield,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const BADGE_META: Record<
  string,
  { name: string; description: string; icon: React.ComponentType<{ className?: string }> }
> = {
  FIRST_POST: { name: "First Light", description: "Made your first post", icon: Sparkles },
  HELPING_HAND: { name: "Helping Hand", description: "Posted 10 times", icon: Heart },
  COMMUNITY_PILLAR: { name: "Community Pillar", description: "Posted 50 times", icon: Building2 },
  CHANGEMAKER: { name: "Changemaker", description: "Posted 100 times", icon: Zap },
  LEGACY_BUILDER: { name: "Legacy Builder", description: "Posted 500 times", icon: Landmark },
  SPARK: { name: "Spark", description: "Earned 500 GDCs", icon: Flame },
  TORCHBEARER: { name: "Torchbearer", description: "Earned 2,500 GDCs", icon: Trophy },
  BEACON: { name: "Beacon", description: "Earned 10,000 GDCs", icon: Lightbulb },
  LIGHTHOUSE: { name: "Lighthouse", description: "Earned 50,000 GDCs", icon: Award },
  HEARTFELT: { name: "Heartfelt", description: "Received 100 LOVE reactions", icon: Heart },
  THOUGHT_LEADER: { name: "Thought Leader", description: "Received 50 INSIGHTFUL reactions", icon: MessageSquare },
  SUPPORTER: { name: "Supporter", description: "Received 100 SUPPORT reactions", icon: ThumbsUp },
  CELEBRATED: { name: "Celebrated", description: "Received 50 CELEBRATE reactions", icon: PartyPopper },
  RISING_STAR: { name: "Rising Star", description: "Received 1,000 total reactions", icon: Star },
  EXPLORER: { name: "Explorer", description: "Joined 3 communities", icon: Compass },
  BRIDGE_BUILDER: { name: "Bridge Builder", description: "Joined 10 communities", icon: Users },
  AMBASSADOR: { name: "Ambassador", description: "Posted in 5 different communities", icon: Globe },
  PURE_INTENT: { name: "Pure Intent", description: "Posted 10+ times with zero reports", icon: Shield },
};

interface BadgesSectionProps {
  badgeIds: string[];
}

export function BadgesSection({ badgeIds }: BadgesSectionProps) {
  if (badgeIds.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          Badges
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {badgeIds.map((id) => {
            const meta = BADGE_META[id];
            if (!meta) return null;
            const Icon = meta.icon;
            return (
              <Badge key={id} variant="secondary" className="gap-1" title={meta.description}>
                <Icon className="h-3 w-3" />
                {meta.name}
              </Badge>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
