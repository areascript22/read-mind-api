/*
  Warnings:

  - A unique constraint covering the columns `[sourceTextNormalized,sourceLang,targetLang,readingId]` on the table `Translation` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Translation_sourceTextNormalized_sourceLang_targetLang_key";

-- CreateIndex
CREATE UNIQUE INDEX "Translation_sourceTextNormalized_sourceLang_targetLang_read_key" ON "Translation"("sourceTextNormalized", "sourceLang", "targetLang", "readingId");
