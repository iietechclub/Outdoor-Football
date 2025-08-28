-- CreateEnum
CREATE TYPE "public"."MatchStatus" AS ENUM ('NotStarted', 'InProgress', 'Paused', 'Finished');

-- CreateEnum
CREATE TYPE "public"."MatchStage" AS ENUM ('FirstHalf', 'SecondHalf', 'ExtraTime', 'PenaltyShootout');

-- AlterTable
ALTER TABLE "public"."Goal" ADD COLUMN     "isPenalty" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."Match" ADD COLUMN     "extraTimeElapsedTime" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "firstHalfElapsedTime" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isLive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "secondHalfElapsedTime" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "stage" "public"."MatchStage" NOT NULL DEFAULT 'FirstHalf',
ADD COLUMN     "status" "public"."MatchStatus" NOT NULL DEFAULT 'NotStarted';
