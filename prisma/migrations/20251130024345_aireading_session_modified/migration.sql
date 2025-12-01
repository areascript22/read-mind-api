/*
  Warnings:

  - You are about to drop the `ActivityProgress` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ActivityProgress" DROP CONSTRAINT "ActivityProgress_aiReadingId_fkey";

-- DropForeignKey
ALTER TABLE "ActivityProgress" DROP CONSTRAINT "ActivityProgress_studentId_fkey";

-- DropTable
DROP TABLE "ActivityProgress";

-- CreateTable
CREATE TABLE "AIReadingSession" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "aiReadingId" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "totalProgress" INTEGER NOT NULL DEFAULT 0,
    "totalScore" INTEGER NOT NULL DEFAULT 0,
    "readingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "paraphraseCompleted" BOOLEAN NOT NULL DEFAULT false,
    "mainIdeaCompleted" BOOLEAN NOT NULL DEFAULT false,
    "summaryCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIReadingSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AIReadingSession_studentId_aiReadingId_key" ON "AIReadingSession"("studentId", "aiReadingId");

-- AddForeignKey
ALTER TABLE "AIReadingSession" ADD CONSTRAINT "AIReadingSession_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIReadingSession" ADD CONSTRAINT "AIReadingSession_aiReadingId_fkey" FOREIGN KEY ("aiReadingId") REFERENCES "AIReading"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
