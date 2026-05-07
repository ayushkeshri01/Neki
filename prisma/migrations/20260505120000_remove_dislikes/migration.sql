-- Drop foreign keys for Dislike (idempotent)
ALTER TABLE IF EXISTS "Dislike" DROP CONSTRAINT IF EXISTS "Dislike_userId_fkey";
ALTER TABLE IF EXISTS "Dislike" DROP CONSTRAINT IF EXISTS "Dislike_postId_fkey";

-- Drop the Dislike table
DROP TABLE IF EXISTS "Dislike";

-- Remove the dislikeThreshold column from AppSettings
ALTER TABLE "AppSettings" DROP COLUMN IF EXISTS "dislikeThreshold";
