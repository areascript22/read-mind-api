/*
  Warnings:

  - You are about to drop the `ActivityCompletion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ActivityCompletion" DROP CONSTRAINT "ActivityCompletion_activityId_fkey";

-- DropForeignKey
ALTER TABLE "ActivityCompletion" DROP CONSTRAINT "ActivityCompletion_studentId_fkey";

-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "hasScoring" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "maxScore" INTEGER;

-- DropTable
DROP TABLE "ActivityCompletion";

-- CreateTable
CREATE TABLE "ActivityProgress" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "activityId" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "totalProgress" INTEGER NOT NULL DEFAULT 0,
    "totalScore" INTEGER NOT NULL DEFAULT 0,
    "readingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "paraphraseCompleted" BOOLEAN NOT NULL DEFAULT false,
    "mainIdeaCompleted" BOOLEAN NOT NULL DEFAULT false,
    "summaryCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivityProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ActivityProgress_studentId_activityId_key" ON "ActivityProgress"("studentId", "activityId");

-- AddForeignKey
ALTER TABLE "ActivityProgress" ADD CONSTRAINT "ActivityProgress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityProgress" ADD CONSTRAINT "ActivityProgress_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
