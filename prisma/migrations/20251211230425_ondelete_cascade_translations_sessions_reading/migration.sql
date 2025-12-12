-- DropForeignKey
ALTER TABLE "AIReadingSession" DROP CONSTRAINT "AIReadingSession_aiReadingId_fkey";

-- DropForeignKey
ALTER TABLE "UserTranslation" DROP CONSTRAINT "UserTranslation_translationId_fkey";

-- AddForeignKey
ALTER TABLE "AIReadingSession" ADD CONSTRAINT "AIReadingSession_aiReadingId_fkey" FOREIGN KEY ("aiReadingId") REFERENCES "AIReading"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_readingId_fkey" FOREIGN KEY ("readingId") REFERENCES "AIReading"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTranslation" ADD CONSTRAINT "UserTranslation_translationId_fkey" FOREIGN KEY ("translationId") REFERENCES "Translation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
