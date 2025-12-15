/*
  Warnings:

  - You are about to drop the column `template` on the `NotificationType` table. All the data in the column will be lost.
  - Added the required column `bodyTemplate` to the `NotificationType` table without a default value. This is not possible if the table is not empty.
  - Added the required column `titleTemplate` to the `NotificationType` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "NotificationType" DROP COLUMN "template",
ADD COLUMN     "bodyTemplate" VARCHAR(500) NOT NULL,
ADD COLUMN     "titleTemplate" VARCHAR(500) NOT NULL;
