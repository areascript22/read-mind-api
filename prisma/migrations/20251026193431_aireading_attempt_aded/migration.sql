/*
  Warnings:

  - You are about to drop the `AudioEvent` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AudioEvent" DROP CONSTRAINT "AudioEvent_aiReadingId_fkey";

-- DropForeignKey
ALTER TABLE "AudioEvent" DROP CONSTRAINT "AudioEvent_userId_fkey";

-- DropTable
DROP TABLE "AudioEvent";

-- CreateTable
CREATE TABLE "AIReadingAttempt" (
    "id" SERIAL NOT NULL,
    "aiReadingId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "timeSinceEnterSec" INTEGER NOT NULL DEFAULT 0,
    "timeSinceNextActivitySec" INTEGER NOT NULL DEFAULT 0,
    "playCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIReadingAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AIReadingAttempt_aiReadingId_idx" ON "AIReadingAttempt"("aiReadingId");

-- CreateIndex
CREATE INDEX "AIReadingAttempt_userId_idx" ON "AIReadingAttempt"("userId");

-- AddForeignKey
ALTER TABLE "AIReadingAttempt" ADD CONSTRAINT "AIReadingAttempt_aiReadingId_fkey" FOREIGN KEY ("aiReadingId") REFERENCES "AIReading"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIReadingAttempt" ADD CONSTRAINT "AIReadingAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
