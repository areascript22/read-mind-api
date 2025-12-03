/*
  Warnings:

  - You are about to drop the column `confidenceScore` on the `FlashCardSession` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FlashCardSession" DROP COLUMN "confidenceScore",
ADD COLUMN     "score" DOUBLE PRECISION NOT NULL DEFAULT 0;
