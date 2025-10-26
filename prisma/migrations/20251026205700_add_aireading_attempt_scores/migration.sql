/*
  Warnings:

  - You are about to drop the column `userText` on the `MainIdeaAttempt` table. All the data in the column will be lost.
  - You are about to drop the column `userText` on the `ParaphraseAttempt` table. All the data in the column will be lost.
  - You are about to drop the column `userText` on the `SummaryAttempt` table. All the data in the column will be lost.
  - Added the required column `accuracyScore` to the `MainIdeaAttempt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clarityScore` to the `MainIdeaAttempt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `coverageScore` to the `MainIdeaAttempt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accuracyScore` to the `ParaphraseAttempt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clarityScore` to the `ParaphraseAttempt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `coverageScore` to the `ParaphraseAttempt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accuracyScore` to the `SummaryAttempt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clarityScore` to the `SummaryAttempt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `coverageScore` to the `SummaryAttempt` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MainIdeaAttempt" DROP COLUMN "userText",
ADD COLUMN     "accuracyScore" INTEGER NOT NULL,
ADD COLUMN     "clarityScore" INTEGER NOT NULL,
ADD COLUMN     "coverageScore" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "ParaphraseAttempt" DROP COLUMN "userText",
ADD COLUMN     "accuracyScore" INTEGER NOT NULL,
ADD COLUMN     "clarityScore" INTEGER NOT NULL,
ADD COLUMN     "coverageScore" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "SummaryAttempt" DROP COLUMN "userText",
ADD COLUMN     "accuracyScore" INTEGER NOT NULL,
ADD COLUMN     "clarityScore" INTEGER NOT NULL,
ADD COLUMN     "coverageScore" INTEGER NOT NULL;
