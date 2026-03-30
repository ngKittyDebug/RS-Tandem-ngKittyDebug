/*
  Warnings:

  - Made the column `provider` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "GameType" AS ENUM ('mergeGame', 'decrypto', 'MeowVentLoop', 'hangman', 'citiesGame');

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "provider" SET NOT NULL;

-- CreateTable
CREATE TABLE "game_statistic" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "gameType" "GameType" NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "playedCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "game_statistic_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "game_statistic_userId_idx" ON "game_statistic"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "game_statistic_userId_gameType_key" ON "game_statistic"("userId", "gameType");

-- AddForeignKey
ALTER TABLE "game_statistic" ADD CONSTRAINT "game_statistic_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
