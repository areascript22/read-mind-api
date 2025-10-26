/*
  Warnings:

  - You are about to drop the `Paraphrase` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ParaphraseResult` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Paraphrase" DROP CONSTRAINT "Paraphrase_activityId_fkey";

-- DropForeignKey
ALTER TABLE "ParaphraseResult" DROP CONSTRAINT "ParaphraseResult_paraphraseId_fkey";

-- DropForeignKey
ALTER TABLE "ParaphraseResult" DROP CONSTRAINT "ParaphraseResult_userId_fkey";

-- DropTable
DROP TABLE "Paraphrase";

-- DropTable
DROP TABLE "ParaphraseResult";

-- CreateTable
CREATE TABLE "ParaphraseAttempt" (
    "id" SERIAL NOT NULL,
    "aiReadingId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "userText" TEXT NOT NULL,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParaphraseAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MainIdeaAttempt" (
    "id" SERIAL NOT NULL,
    "aiReadingId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "userText" TEXT NOT NULL,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MainIdeaAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SummaryAttempt" (
    "id" SERIAL NOT NULL,
    "aiReadingId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "userText" TEXT NOT NULL,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SummaryAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AudioEvent" (
    "id" SERIAL NOT NULL,
    "aiReadingId" INTEGER NOT NULL,
    "userId" INTEGER,
    "eventType" TEXT NOT NULL,
    "positionSec" INTEGER,
    "durationSec" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AudioEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ParaphraseAttempt_aiReadingId_idx" ON "ParaphraseAttempt"("aiReadingId");

-- CreateIndex
CREATE INDEX "ParaphraseAttempt_userId_idx" ON "ParaphraseAttempt"("userId");

-- CreateIndex
CREATE INDEX "MainIdeaAttempt_aiReadingId_idx" ON "MainIdeaAttempt"("aiReadingId");

-- CreateIndex
CREATE INDEX "MainIdeaAttempt_userId_idx" ON "MainIdeaAttempt"("userId");

-- CreateIndex
CREATE INDEX "SummaryAttempt_aiReadingId_idx" ON "SummaryAttempt"("aiReadingId");

-- CreateIndex
CREATE INDEX "SummaryAttempt_userId_idx" ON "SummaryAttempt"("userId");

-- CreateIndex
CREATE INDEX "AudioEvent_aiReadingId_idx" ON "AudioEvent"("aiReadingId");

-- CreateIndex
CREATE INDEX "AudioEvent_userId_idx" ON "AudioEvent"("userId");

-- CreateIndex
CREATE INDEX "AudioEvent_createdAt_idx" ON "AudioEvent"("createdAt");

-- AddForeignKey
ALTER TABLE "ParaphraseAttempt" ADD CONSTRAINT "ParaphraseAttempt_aiReadingId_fkey" FOREIGN KEY ("aiReadingId") REFERENCES "AIReading"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParaphraseAttempt" ADD CONSTRAINT "ParaphraseAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MainIdeaAttempt" ADD CONSTRAINT "MainIdeaAttempt_aiReadingId_fkey" FOREIGN KEY ("aiReadingId") REFERENCES "AIReading"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MainIdeaAttempt" ADD CONSTRAINT "MainIdeaAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SummaryAttempt" ADD CONSTRAINT "SummaryAttempt_aiReadingId_fkey" FOREIGN KEY ("aiReadingId") REFERENCES "AIReading"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SummaryAttempt" ADD CONSTRAINT "SummaryAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudioEvent" ADD CONSTRAINT "AudioEvent_aiReadingId_fkey" FOREIGN KEY ("aiReadingId") REFERENCES "AIReading"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudioEvent" ADD CONSTRAINT "AudioEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
