-- CreateTable
CREATE TABLE "Paraphrase" (
    "id" SERIAL NOT NULL,
    "activityId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Paraphrase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParaphraseResult" (
    "id" SERIAL NOT NULL,
    "paraphraseId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "userAttempt" TEXT NOT NULL,
    "similarity" INTEGER NOT NULL,
    "fluency" INTEGER NOT NULL,
    "originality" INTEGER NOT NULL,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParaphraseResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Paraphrase_activityId_key" ON "Paraphrase"("activityId");

-- CreateIndex
CREATE UNIQUE INDEX "ParaphraseResult_paraphraseId_userId_key" ON "ParaphraseResult"("paraphraseId", "userId");

-- AddForeignKey
ALTER TABLE "Paraphrase" ADD CONSTRAINT "Paraphrase_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParaphraseResult" ADD CONSTRAINT "ParaphraseResult_paraphraseId_fkey" FOREIGN KEY ("paraphraseId") REFERENCES "Paraphrase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParaphraseResult" ADD CONSTRAINT "ParaphraseResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
