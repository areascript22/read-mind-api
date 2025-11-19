/*
  Warnings:

  - You are about to drop the column `minVersionAndroid` on the `GlobalConfig` table. All the data in the column will be lost.
  - Added the required column `buildNumber` to the `GlobalConfig` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GlobalConfig" DROP COLUMN "minVersionAndroid",
ADD COLUMN     "buildNumber" INTEGER NOT NULL;
