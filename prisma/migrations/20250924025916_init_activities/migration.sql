/*
  Warnings:

  - You are about to drop the column `file` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the column `typeId` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the `ActivityStudent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ActivityType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AnswerOption` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ContentType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CourseContent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Question` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuestionType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StudentAnswer` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `type` to the `Activity` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_typeId_fkey";

-- DropForeignKey
ALTER TABLE "ActivityStudent" DROP CONSTRAINT "ActivityStudent_activityId_fkey";

-- DropForeignKey
ALTER TABLE "ActivityStudent" DROP CONSTRAINT "ActivityStudent_studentId_fkey";

-- DropForeignKey
ALTER TABLE "AnswerOption" DROP CONSTRAINT "AnswerOption_questionId_fkey";

-- DropForeignKey
ALTER TABLE "CourseContent" DROP CONSTRAINT "CourseContent_contentTypeId_fkey";

-- DropForeignKey
ALTER TABLE "CourseContent" DROP CONSTRAINT "CourseContent_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_activityId_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_typeId_fkey";

-- DropForeignKey
ALTER TABLE "StudentAnswer" DROP CONSTRAINT "StudentAnswer_answerOptionId_fkey";

-- DropForeignKey
ALTER TABLE "StudentAnswer" DROP CONSTRAINT "StudentAnswer_questionId_fkey";

-- DropForeignKey
ALTER TABLE "StudentAnswer" DROP CONSTRAINT "StudentAnswer_studentId_fkey";

-- AlterTable
ALTER TABLE "Activity" DROP COLUMN "file",
DROP COLUMN "typeId",
ADD COLUMN     "type" TEXT NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Course" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "CourseStudent" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Role" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "RoleRequest" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "RoleRequestStatus" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- DropTable
DROP TABLE "ActivityStudent";

-- DropTable
DROP TABLE "ActivityType";

-- DropTable
DROP TABLE "AnswerOption";

-- DropTable
DROP TABLE "ContentType";

-- DropTable
DROP TABLE "CourseContent";

-- DropTable
DROP TABLE "Question";

-- DropTable
DROP TABLE "QuestionType";

-- DropTable
DROP TABLE "StudentAnswer";

-- CreateTable
CREATE TABLE "AIReading" (
    "id" SERIAL NOT NULL,
    "activityId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIReading_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityCompletion" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "activityId" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "reward" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivityCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AIReading_activityId_key" ON "AIReading"("activityId");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityCompletion_studentId_activityId_key" ON "ActivityCompletion"("studentId", "activityId");

-- AddForeignKey
ALTER TABLE "AIReading" ADD CONSTRAINT "AIReading_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityCompletion" ADD CONSTRAINT "ActivityCompletion_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityCompletion" ADD CONSTRAINT "ActivityCompletion_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
