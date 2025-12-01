-- CreateTable
CREATE TABLE "FlashCardActivity" (
    "id" SERIAL NOT NULL,
    "activityId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "maxCards" INTEGER NOT NULL DEFAULT 10,
    "cardOrder" VARCHAR(20) NOT NULL,

    CONSTRAINT "FlashCardActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlashCardSession" (
    "id" SERIAL NOT NULL,
    "flashCardActivityId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "totalTimeSec" INTEGER NOT NULL DEFAULT 0,
    "cardsCompleted" INTEGER NOT NULL DEFAULT 0,
    "correctAnswers" INTEGER NOT NULL DEFAULT 0,
    "incorrectAnswers" INTEGER NOT NULL DEFAULT 0,
    "confidenceScore" DOUBLE PRECISION,

    CONSTRAINT "FlashCardSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlashCardAttempt" (
    "id" SERIAL NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "userTranslationId" INTEGER NOT NULL,
    "userAnswer" VARCHAR(500) NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "timeSpentSec" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FlashCardAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FlashCardActivity_activityId_key" ON "FlashCardActivity"("activityId");

-- CreateIndex
CREATE INDEX "FlashCardSession_studentId_completedAt_idx" ON "FlashCardSession"("studentId", "completedAt");

-- CreateIndex
CREATE INDEX "FlashCardSession_flashCardActivityId_startedAt_idx" ON "FlashCardSession"("flashCardActivityId", "startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "FlashCardSession_studentId_flashCardActivityId_startedAt_key" ON "FlashCardSession"("studentId", "flashCardActivityId", "startedAt");

-- CreateIndex
CREATE INDEX "FlashCardAttempt_sessionId_createdAt_idx" ON "FlashCardAttempt"("sessionId", "createdAt");

-- CreateIndex
CREATE INDEX "FlashCardAttempt_userTranslationId_idx" ON "FlashCardAttempt"("userTranslationId");

-- AddForeignKey
ALTER TABLE "FlashCardActivity" ADD CONSTRAINT "FlashCardActivity_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlashCardSession" ADD CONSTRAINT "FlashCardSession_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlashCardSession" ADD CONSTRAINT "FlashCardSession_flashCardActivityId_fkey" FOREIGN KEY ("flashCardActivityId") REFERENCES "FlashCardActivity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlashCardAttempt" ADD CONSTRAINT "FlashCardAttempt_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "FlashCardSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlashCardAttempt" ADD CONSTRAINT "FlashCardAttempt_userTranslationId_fkey" FOREIGN KEY ("userTranslationId") REFERENCES "UserTranslation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
