/*
  Warnings:

  - You are about to drop the column `userId` on the `ActivityReminder` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[activityId,notifyId]` on the table `ActivityReminder` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "ActivityReminder" DROP CONSTRAINT "ActivityReminder_userId_fkey";

-- DropIndex
DROP INDEX "ActivityReminder_activityId_userId_notifyId_idx";

-- DropIndex
DROP INDEX "ActivityReminder_activityId_userId_notifyId_key";

-- AlterTable
ALTER TABLE "ActivityReminder" DROP COLUMN "userId";

-- CreateIndex
CREATE INDEX "ActivityReminder_activityId_notifyId_idx" ON "ActivityReminder"("activityId", "notifyId");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityReminder_activityId_notifyId_key" ON "ActivityReminder"("activityId", "notifyId");
