import { PrismaClient } from "@prisma/client";
import Roles from "../models/roles.js";

const prisma = new PrismaClient();

export const availableRoles = async (req, res) => {
  try {
    const userId = req.id;

    if (!userId) {
      return res.status(401).json({ ok: false, message: "No autenticado" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      return res
        .status(404)
        .json({ ok: false, message: "Usuario no encontrado" });
    }

    const userRole = user.role?.name;

    if (userRole === Roles.superUser) {
      return res.status(200).json({ ok: true, message: "Ya es superUser" });
    }

    const roleMap = {
      student: [Roles.professor],
      professor: [Roles.admin],
      admin: [Roles.superUser],
    };

    const availableRolesNames = roleMap[userRole] || [];

    const availableRoles = await prisma.role.findMany({
      where: { name: { in: availableRolesNames } },
    });

    return res.status(200).json({ ok: true, roles: availableRoles });
  } catch (error) {
    console.error("Error en getAvailableRoles:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const askForRole = async (req, res) => {
  try {
    const userId = req.id;
    const requestedRoleId = parseInt(req.params.roleId);

    if (!requestedRoleId) {
      return res
        .status(400)
        .json({ ok: false, message: "Debe indicar el rol a solicitar" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      return res
        .status(404)
        .json({ ok: false, message: "Usuario no encontrado" });
    }

    const currentRole = user.role?.name;

    if (currentRole === Roles.superUser) {
      return res.status(400).json({
        ok: false,
        message: "Ya es superUser, no puede solicitar otro rol",
      });
    }

    const roleMap = {
      student: [Roles.professor],
      professor: [Roles.admin],
      admin: [Roles.superUser],
    };
    const allowedRolesNames = roleMap[currentRole] || [];
    const requestedRole = await prisma.role.findUnique({
      where: { id: requestedRoleId },
    });

    if (!requestedRole) {
      return res
        .status(404)
        .json({ ok: false, message: "Rol solicitado no existe" });
    }

    if (!allowedRolesNames.includes(requestedRole.name)) {
      return res
        .status(403)
        .json({ message: "No puedes solicitar este rol según tu rol actual" });
    }

    const existingRequest = await prisma.roleRequest.findFirst({
      where: {
        userId,
        requestedRoleId,
        statusId: 1,
      },
    });

    if (existingRequest) {
      return res.status(400).json({
        ok: false,
        message: "Ya tienes una solicitud pendiente para este rol.",
      });
    }

    const roleRequest = await prisma.roleRequest.create({
      data: {
        userId,
        requestedRoleId,
        statusId: 1,
      },
      include: {
        status: true,
      },
    });

    return res.status(201).json({
      ok: true,
      message: "Petición de rol en cola",
      roleRequest,
    });
  } catch (error) {
    console.error("Error en askForRole: ", error);
    return res.status(500).json({
      ok: false,
      message: "No se pudo realizar la petición",
    });
  }
};

export const checkRoleRequestStatus = async (req, res) => {
  try {
    const userId = req.id;

    if (!userId) {
      return res.status(401).json({ ok: false, message: "No autenticado" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      return res
        .status(404)
        .json({ ok: false, message: "Usuario no encontrado" });
    }

    const existingRequest = await prisma.roleRequest.findFirst({
      where: { userId },
      include: { status: true, requestedRole: true },
    });

    if (!existingRequest) {
      return res.status(404).json({
        ok: false,
        message: "No existe ninguna solicitud de rol para este usuario",
      });
    }

    return res.status(200).json({
      ok: true,
      roleId: existingRequest.requestedRoleId,
      roleName: existingRequest.requestedRole.name,
      statusId: existingRequest.statusId,
      status: existingRequest.status.name,
      message: `Solicitud para rol ${existingRequest.requestedRole.name} actualmente: ${existingRequest.status.name}`,
    });
  } catch (error) {
    console.error("Error checkRoleRequestStatus: ", error);
    return res.status(500).json({
      ok: false,
      message: "No se pudo verificar el estado de la solicitud",
    });
  }
};

export const getAllRoleRequest = async (req, res) => {
  try {
    
    // Obtener todas las solicitudes pendientes
    const roleRequests = await prisma.roleRequest.findMany({
      include: {
        user: {
          include: {
            role: true, // trae todos los campos del role del usuario
          },
        },
        requestedRole: true, // trae todos los campos del rol solicitado
        status: true, // trae todos los campos del status
      },
    });

    return res.status(200).json({
      ok: true,
      message: "Solicitudes de roles obtenidas",
      data: roleRequests,
    });
  } catch (error) {
    console.error("Error getting all role requests: ", error);
    return res.status(500).json({
      ok: false,
      message: "No se pudo obtener las solicitudes de roles",
    });
  }
};

export const grantRoleAccess = async (req, res) => {
  try {
    const { userId } = req.body;
    const statusId = parseInt(req.params.statusId);

    if (!userId) {
      return res
        .status(400)
        .json({ ok: false, message: "Debe enviar el userId" });
    }

    if (![2, 3].includes(statusId)) {
      return res.status(400).json({ ok: false, message: "Status inválido" });
    }

    const roleRequest = await prisma.roleRequest.findFirst({
      where: { userId },
    });

    if (!roleRequest) {
      return res.status(404).json({
        ok: false,
        message: "No hay solicitud de rol para este usuario",
      });
    }

    await prisma.roleRequest.update({
      where: { id: roleRequest.id },
      data: { statusId },
    });

    if (statusId === 3) {
      return res.status(200).json({ ok: true, message: "Solicitud rechazada" });
    }

    if (statusId === 2) {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { roleId: roleRequest.requestedRoleId },
      });
      return res.status(200).json({
        ok: true,
        message: "Solicitud aprobada y rol del usuario actualizado",
        updatedUser,
      });
    }
  } catch (error) {
    console.error("Error granting role request: ", error);
    return res
      .status(500)
      .json({ ok: false, message: "No se pudo procesar la solicitud de rol" });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { targetUserId } = req.body;
    const { newRole } = req.query;
    const currentRoleName = req.role;
    const currentUserId = req.id;
    console.log(
      `target user id: ${targetUserId}, newRole: ${newRole}, currentRoleName: ${currentRoleName}, currentUserId: ${currentUserId}`
    );

    if (!targetUserId || !newRole) {
      return res.status(400).json({
        ok: false,
        message: "Debe enviar targetUserId y newRole",
      });
    }

    if (targetUserId === currentUserId) {
      return res.status(403).json({
        ok: false,
        message: "No puedes modificar tu propio rol",
      });
    }

    const targetUserIdInt = parseInt(targetUserId);

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserIdInt },
      include: { role: true },
    });

    if (!targetUser || !targetUser.role) {
      return res.status(404).json({
        ok: false,
        message: "Usuario a actualizar no encontrado",
      });
    }

    const targetRoleName = targetUser.role.name;

    if (currentRoleName === "admin") {
      if (targetRoleName === "admin" || targetRoleName === "superUser") {
        return res.status(403).json({
          ok: false,
          message: "Un admin no tiene poder sobre otro admin ni superUser",
        });
      }

      if (!["student", "professor"].includes(newRole)) {
        return res.status(403).json({
          ok: false,
          message:
            "Un admin solo puede asignar los roles de 'student' o 'professor'",
        });
      }
    }

    if (currentRoleName === "superUser") {
      if (targetRoleName === "superUser") {
        return res.status(403).json({
          ok: false,
          message: "Un superUser no puede cambiar el rol de otro superUser",
        });
      }

      if (newRole === "superUser") {
        return res.status(403).json({
          ok: false,
          message: "Un superUser no puede asignar el rol de 'superUser'",
        });
      }
    }

    const roleToAssign = await prisma.role.findUnique({
      where: { name: newRole },
    });

    if (!roleToAssign) {
      return res.status(404).json({
        ok: false,
        message: "El rol nuevo no existe",
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetUserIdInt },
      data: { roleId: roleToAssign.id },
      include: { role: true },
    });

    return res.status(200).json({
      ok: true,
      message: `Rol actualizado a ${roleToAssign.name} exitosamente`,
      updatedUser,
    });
  } catch (error) {
    console.error("Error updating user role: ", error);
    return res.status(500).json({
      ok: false,
      message: "No se pudo actualizar el rol del usuario",
    });
  }
};
