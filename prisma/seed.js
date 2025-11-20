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
        name: "ROLE_REQUEST",
        description: "Actualizaciones sobre solicitudes de rol",
        template: "Solicitud de rol {status}",
      },
      {
        name: "COURSE_INVITE",
        description: "Invitaciones a cursos",
        template: "Has sido invitado al curso {courseName}",
      },
      {
        name: "ACTIVITY_ASSIGNED",
        description: "Nuevas actividades asignadas",
        template: "Nueva actividad: {activityTitle}",
      },
      {
        name: "ACTIVITY_REMINDER",
        description: "Recordatorios de actividades pendientes",
        template: "Recordatorio: {activityTitle} vence {dueDate}",
      },
      {
        name: "ROLE_APPROVED",
        description: "Aprobación de solicitud de rol",
        template: "Tu solicitud de rol {roleName} fue aprobada",
      },
      {
        name: "GRADE_AVAILABLE",
        description: "Calificaciones disponibles",
        template: "Calificación disponible para {activityTitle}",
      },
      {
        name: "SYSTEM_ANNOUNCEMENT",
        description: "Anuncios del sistema",
        template: "Anuncio del sistema: {message}",
      },
      {
        name: "COURSE_ANNOUNCEMENT",
        description: "Anuncios de cursos",
        template: "Anuncio en {courseName}: {message}",
      },
    ],
    skipDuplicates: true, // evita duplicados si ya existen
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
