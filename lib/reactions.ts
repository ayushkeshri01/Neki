import type { ReactionType as PrismaReactionType } from "@prisma/client";

/** UI-facing lowercase reaction id used by the ReactionButton component */
export type ReactionId = "like" | "celebrate" | "love" | "insightful" | "support";

/** Alias for use in UI components */
export type ReactionType = ReactionId;

const UI_TO_DB: Record<ReactionId, PrismaReactionType> = {
  like: "LIKE",
  celebrate: "CELEBRATE",
  love: "LOVE",
  insightful: "INSIGHTFUL",
  support: "SUPPORT",
};

export const DB_TO_UI: Record<PrismaReactionType, ReactionId> = {
  LIKE: "like",
  CELEBRATE: "celebrate",
  LOVE: "love",
  INSIGHTFUL: "insightful",
  SUPPORT: "support",
};

export function toDbReaction(id: ReactionId): PrismaReactionType {
  return UI_TO_DB[id];
}

export function toUiReaction(value: PrismaReactionType): ReactionId {
  return DB_TO_UI[value];
}

export function parseReactionId(value: unknown): ReactionId | null {
  if (typeof value !== "string") return null;
  const v = value.toLowerCase();
  return v in UI_TO_DB ? (v as ReactionId) : null;
}
