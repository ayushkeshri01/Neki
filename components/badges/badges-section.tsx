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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BADGE_DEFINITIONS } from "@/lib/badges";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles,
  Heart,
  Building2,
  Zap,
  Landmark,
  Flame,
  Trophy,
  Lightbulb,
  Award,
  MessageSquare,
  ThumbsUp,
  PartyPopper,
  Star,
  Compass,
  Users,
  Globe,
  Shield,
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
        <TooltipProvider>
          <div className="flex flex-wrap gap-2">
            {badgeIds.map((id) => {
              const def = BADGE_DEFINITIONS[id];
              if (!def) return null;
              const Icon = ICON_MAP[def.icon];
              if (!Icon) return null;
              return (
                <Tooltip key={id}>
                  <TooltipTrigger asChild>
                    <Badge variant="secondary" className="gap-1">
                      <Icon className="h-3 w-3" />
                      {def.name}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{def.description}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
