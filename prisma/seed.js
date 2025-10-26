import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Insert Roles
  await prisma.role.createMany({
    data: [
      { name: "student", description: "Regular student enrolled in a course" },
      {
        name: "professor",
        description: "Instructor who manages and evaluates the course",
      },
      {
        name: "admin",
        description: "Administrator with management permissions",
      },
      {
        name: "superUser",
        description: "Superuser with full access to all resources",
      },
    ],
    skipDuplicates: true, // evita duplicados si ya existen
  });

  // Insert roleRequestStatus
  await prisma.roleRequestStatus.createMany({
    data: [
      {
        name: "pending",
        description:
          "The role request has been submitted and is waiting for review or approval by an administrator",
      },
      {
        name: "aproved",
        description:
          "The role request has been reviewed and granted. The user now has the requested role",
      },
      {
        name: "rejected",
        description:
          "The role request was reviewed and denied. The user will not receive the requested role",
      },
    ],
    skipDuplicates: true, // evita duplicados si ya existen
  });

  // Insert Activity Types
  // await prisma.activityType.createMany({
  //   data: [
  //     { name: "assignment", description: "Teacher-assigned tasks" },
  //     { name: "homework", description: "Homework to be done at home" },
  //     { name: "evaluation", description: "Tests or exams" },
  //   ],
  //   skipDuplicates: true,
  // });

  // Insert Question Types
  // await prisma.questionType.createMany({
  //   data: [
  //     {
  //       name: "multiple_choice",
  //       description: "Question with multiple options",
  //     },
  //     { name: "free_text", description: "Open-ended written response" },
  //     { name: "boolean", description: "Yes/No question" },
  //   ],
  //   skipDuplicates: true,
  // });

  // Insert Content Types
  // await prisma.contentType.createMany({
  //   data: [
  //     { name: "announcement", description: "Text notice from teacher" },
  //     { name: "pdf", description: "PDF document" },
  //     { name: "image", description: "Image file" },
  //     { name: "video", description: "Video material" },
  //     { name: "link", description: "External link to resource" },
  //   ],
  //   skipDuplicates: true,
  // });

  console.log("✅ Datos iniciales insertados correctamente");
}

main()
  .catch((e) => {
    console.error("❌ Error insertando datos iniciales:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
