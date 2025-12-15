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

  // Insert Notification Types
  await prisma.notificationType.createMany({
    data: [
      {
        name: "ACTIVITY_REMINDERS",
        description: "Recordatorios relacionados con actividades académicas",
        titleTemplate: "Recordatorio de actividad",
        bodyTemplate: "La actividad {{activityTitle}} vence el {{{dueDate}}}",
      },
      {
        name: "ACTIVITY_ALERTS",
        description: "Alertas y avisos sobre nuevas actividades",
        titleTemplate: "Nueva actividad",
        bodyTemplate:
          "El profesor {{teacherName}} creó la actividad {{activityTitle}}",
      },
      {
        name: "GENERAL_APP_NOTICES",
        description: "Avisos generales de la aplicación",
        titleTemplate: "Aviso importante",
        bodyTemplate: "{{message}}",
      },
    ],
    skipDuplicates: true,
  });

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
