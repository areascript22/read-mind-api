/*
  Warnings:

  - A unique constraint covering the columns `[sourceTextNormalized,sourceLang,targetLang]` on the table `Translation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sourceTextNormalized` to the `Translation` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Translation_sourceText_key";

-- AlterTable
ALTER TABLE "Translation" ADD COLUMN     "sourceTextNormalized" TEXT NOT NULL,
ADD COLUMN     "timesUsed" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX "Translation_sourceTextNormalized_idx" ON "Translation"("sourceTextNormalized");

-- CreateIndex
CREATE UNIQUE INDEX "Translation_sourceTextNormalized_sourceLang_targetLang_key" ON "Translation"("sourceTextNormalized", "sourceLang", "targetLang");
