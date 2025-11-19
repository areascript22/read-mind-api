/*
  Warnings:

  - You are about to drop the column `coverageScore` on the `MainIdeaAttempt` table. All the data in the column will be lost.
  - You are about to drop the column `accuracyScore` on the `ParaphraseAttempt` table. All the data in the column will be lost.
  - You are about to drop the column `clarityScore` on the `ParaphraseAttempt` table. All the data in the column will be lost.
  - You are about to drop the column `coverageScore` on the `ParaphraseAttempt` table. All the data in the column will be lost.
  - Added the required column `concisenessScore` to the `MainIdeaAttempt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fluencyScore` to the `ParaphraseAttempt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalityScore` to the `ParaphraseAttempt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `similarityScore` to the `ParaphraseAttempt` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MainIdeaAttempt" DROP COLUMN "coverageScore",
ADD COLUMN     "concisenessScore" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "ParaphraseAttempt" DROP COLUMN "accuracyScore",
DROP COLUMN "clarityScore",
DROP COLUMN "coverageScore",
ADD COLUMN     "fluencyScore" INTEGER NOT NULL,
ADD COLUMN     "originalityScore" INTEGER NOT NULL,
ADD COLUMN     "similarityScore" INTEGER NOT NULL;
