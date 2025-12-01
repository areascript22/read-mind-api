/*
  Warnings:

  - Added the required column `readingId` to the `Translation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Translation" ADD COLUMN     "readingId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "Translation_readingId_idx" ON "Translation"("readingId");
