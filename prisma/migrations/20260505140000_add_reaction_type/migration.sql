-- Reaction type enum
CREATE TYPE "ReactionType" AS ENUM ('LIKE', 'CELEBRATE', 'LOVE', 'INSIGHTFUL', 'SUPPORT');

-- Add type column to Like (existing rows default to LIKE for backward compat)
ALTER TABLE "Like" ADD COLUMN "type" "ReactionType" NOT NULL DEFAULT 'LIKE';

-- Index for fast per-post reaction breakdowns
CREATE INDEX "Like_postId_type_idx" ON "Like" ("postId", "type");
