/*
  Warnings:

  - You are about to drop the column `activityId` on the `ActivityProgress` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[studentId,aiReadingId]` on the table `ActivityProgress` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `aiReadingId` to the `ActivityProgress` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ActivityProgress" DROP CONSTRAINT "ActivityProgress_activityId_fkey";

-- DropIndex
DROP INDEX "ActivityProgress_studentId_activityId_key";

-- AlterTable
ALTER TABLE "ActivityProgress" DROP COLUMN "activityId",
ADD COLUMN     "aiReadingId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ActivityProgress_studentId_aiReadingId_key" ON "ActivityProgress"("studentId", "aiReadingId");

-- AddForeignKey
ALTER TABLE "ActivityProgress" ADD CONSTRAINT "ActivityProgress_aiReadingId_fkey" FOREIGN KEY ("aiReadingId") REFERENCES "AIReading"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
