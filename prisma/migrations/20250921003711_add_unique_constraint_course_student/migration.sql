/*
  Warnings:

  - A unique constraint covering the columns `[courseId,studentId]` on the table `CourseStudent` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CourseStudent_courseId_studentId_key" ON "CourseStudent"("courseId", "studentId");
