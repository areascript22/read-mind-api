-- CreateEnum
CREATE TYPE "NotificationDeliveryStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'FAILED', 'EXPIRED');

-- CreateTable
CREATE TABLE "NotificationType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "template" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PushNotification" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "typeId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "deliveryStatus" "NotificationDeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PushNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NotificationType_name_key" ON "NotificationType"("name");

-- CreateIndex
CREATE INDEX "PushNotification_userId_read_idx" ON "PushNotification"("userId", "read");

-- CreateIndex
CREATE INDEX "PushNotification_userId_sentAt_idx" ON "PushNotification"("userId", "sentAt");

-- CreateIndex
CREATE INDEX "PushNotification_deliveryStatus_idx" ON "PushNotification"("deliveryStatus");

-- CreateIndex
CREATE INDEX "PushNotification_expiresAt_idx" ON "PushNotification"("expiresAt");

-- AddForeignKey
ALTER TABLE "PushNotification" ADD CONSTRAINT "PushNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PushNotification" ADD CONSTRAINT "PushNotification_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "NotificationType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
