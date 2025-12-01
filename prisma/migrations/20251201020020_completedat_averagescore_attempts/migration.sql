/*
  Warnings:

  - Added the required column `averageScore` to the `MainIdeaAttempt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `averageScore` to the `ParaphraseAttempt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `averageScore` to the `SummaryAttempt` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MainIdeaAttempt" ADD COLUMN     "averageScore" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "completedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ParaphraseAttempt" ADD COLUMN     "averageScore" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "completedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "SummaryAttempt" ADD COLUMN     "averageScore" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "completedAt" TIMESTAMP(3);
