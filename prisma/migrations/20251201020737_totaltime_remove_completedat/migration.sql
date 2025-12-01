/*
  Warnings:

  - You are about to drop the column `completedAt` on the `MainIdeaAttempt` table. All the data in the column will be lost.
  - You are about to drop the column `completedAt` on the `ParaphraseAttempt` table. All the data in the column will be lost.
  - You are about to drop the column `completedAt` on the `SummaryAttempt` table. All the data in the column will be lost.
  - Added the required column `timeSpentSec` to the `MainIdeaAttempt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timeSpentSec` to the `ParaphraseAttempt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timeSpentSec` to the `SummaryAttempt` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MainIdeaAttempt" DROP COLUMN "completedAt",
ADD COLUMN     "timeSpentSec" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "ParaphraseAttempt" DROP COLUMN "completedAt",
ADD COLUMN     "timeSpentSec" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "SummaryAttempt" DROP COLUMN "completedAt",
ADD COLUMN     "timeSpentSec" INTEGER NOT NULL;
