/*
  Warnings:

  - A unique constraint covering the columns `[providerId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('local', 'Github', 'Google');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "provider" "Provider" DEFAULT 'local',
ADD COLUMN     "providerId" TEXT,
ALTER COLUMN "password" SET DEFAULT 'null';

-- CreateIndex
CREATE UNIQUE INDEX "users_providerId_key" ON "users"("providerId");
