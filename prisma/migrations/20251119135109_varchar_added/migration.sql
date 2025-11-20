/*
  Warnings:

  - You are about to alter the column `name` on the `Role` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `description` on the `Role` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - Made the column `description` on table `Role` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Role" ALTER COLUMN "name" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "description" SET DATA TYPE VARCHAR(255);
