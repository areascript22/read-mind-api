-- CreateTable
CREATE TABLE "ActivityReminder" (
    "id" SERIAL NOT NULL,
    "activityId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "notifyId" INTEGER NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityReminder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ActivityReminder_activityId_userId_notifyId_idx" ON "ActivityReminder"("activityId", "userId", "notifyId");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityReminder_activityId_userId_notifyId_key" ON "ActivityReminder"("activityId", "userId", "notifyId");

-- AddForeignKey
ALTER TABLE "ActivityReminder" ADD CONSTRAINT "ActivityReminder_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityReminder" ADD CONSTRAINT "ActivityReminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityReminder" ADD CONSTRAINT "ActivityReminder_notifyId_fkey" FOREIGN KEY ("notifyId") REFERENCES "PushNotification"("id") ON DELETE CASCADE ON UPDATE CASCADE;
