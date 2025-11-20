/*
  Warnings:

  - You are about to alter the column `complexity` on the `AIReading` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(10)`.
  - You are about to alter the column `length` on the `AIReading` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(20)`.
  - You are about to alter the column `style` on the `AIReading` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `title` on the `Activity` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(200)`.
  - You are about to alter the column `description` on the `Activity` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.
  - You are about to alter the column `description` on the `Course` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.
  - You are about to alter the column `inviteCode` on the `Course` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `name` on the `Course` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(150)`.
  - You are about to alter the column `name` on the `NotificationType` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `description` on the `NotificationType` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `template` on the `NotificationType` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.
  - You are about to alter the column `title` on the `PushNotification` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(150)`.
  - You are about to alter the column `name` on the `RoleRequestStatus` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `description` on the `RoleRequestStatus` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `sourceText` on the `Translation` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.
  - You are about to alter the column `sourceLang` on the `Translation` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(10)`.
  - You are about to alter the column `targetLang` on the `Translation` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(10)`.
  - You are about to alter the column `name` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `lastName` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `email` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `passwordHash` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - Made the column `description` on table `NotificationType` required. This step will fail if there are existing NULL values in that column.
  - Made the column `template` on table `NotificationType` required. This step will fail if there are existing NULL values in that column.
  - Made the column `description` on table `RoleRequestStatus` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "AIReading" ALTER COLUMN "complexity" SET DATA TYPE VARCHAR(10),
ALTER COLUMN "length" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "style" SET DATA TYPE VARCHAR(50);

-- AlterTable
ALTER TABLE "Activity" ALTER COLUMN "title" SET DATA TYPE VARCHAR(200),
ALTER COLUMN "description" SET DATA TYPE VARCHAR(500);

-- AlterTable
ALTER TABLE "Course" ALTER COLUMN "description" SET DATA TYPE VARCHAR(500),
ALTER COLUMN "inviteCode" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "name" SET DATA TYPE VARCHAR(150);

-- AlterTable
ALTER TABLE "NotificationType" ALTER COLUMN "name" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "description" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "template" SET NOT NULL,
ALTER COLUMN "template" SET DATA TYPE VARCHAR(500);

-- AlterTable
ALTER TABLE "PushNotification" ALTER COLUMN "title" SET DATA TYPE VARCHAR(150);

-- AlterTable
ALTER TABLE "RoleRequestStatus" ALTER COLUMN "name" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "description" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "Translation" ALTER COLUMN "sourceText" SET DATA TYPE VARCHAR(500),
ALTER COLUMN "sourceLang" SET DATA TYPE VARCHAR(10),
ALTER COLUMN "targetLang" SET DATA TYPE VARCHAR(10);

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "name" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "lastName" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "email" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "passwordHash" SET DATA TYPE VARCHAR(255);
