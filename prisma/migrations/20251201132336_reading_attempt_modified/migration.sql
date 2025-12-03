/*
  Warnings:

  - You are about to drop the column `timeSinceEnterSec` on the `AIReadingAttempt` table. All the data in the column will be lost.
  - You are about to drop the column `timeSinceNextActivitySec` on the `AIReadingAttempt` table. All the data in the column will be lost.
  - Added the required column `timeSpentSec` to the `AIReadingAttempt` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AIReadingAttempt" DROP COLUMN "timeSinceEnterSec",
DROP COLUMN "timeSinceNextActivitySec",
ADD COLUMN     "timeSpentSec" INTEGER NOT NULL;
