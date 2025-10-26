import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    if (role) {
      const roleExists = await prisma.role.findUnique({
        where: { name: role },
      });

      if (!roleExists) {
        return res.status(404).json({
          ok: false,
          message: `El rol '${role}' no existe en la base de datos.`,
        });
      }

      where.role = { name: role };
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: { role: true },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    return res.status(200).json({
      ok: true,
      message: role
        ? `Usuarios con rol '${role}' obtenidos correctamente`
        : "Usuarios obtenidos correctamente",
      data: users,
      pagination: {
        total,
        totalPages,
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching users: ", error);
    return res.status(500).json({
      ok: false,
      message: "No se pudieron obtener los usuarios",
    });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { query = "", roles = "" } = req.query;
    const rolesArray = roles ? roles.split(",") : [];

    const where = {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ],
    };

    if (rolesArray.length > 0) {
      where.role = { name: { in: rolesArray } };
    }

    const users = await prisma.user.findMany({
      where,
      include: { role: true },
      take: 10, // limitar resultados
      orderBy: { name: "asc" },
    });

    return res.status(200).json({
      ok: true,
      message: "Resultados de búsqueda",
      data: users,
    });
  } catch (error) {
    console.error("Error searching users:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al buscar usuarios",
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validación básica de ID
    const userId = parseInt(id);
    if (isNaN(userId)) {
      return res.status(400).json({
        ok: false,
        message: "El ID del usuario debe ser un número válido.",
      });
    }

    // Buscar usuario con su rol incluido
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true, // Incluye el rol asignado
      },
    });

    // Si no existe el usuario
    if (!user) {
      return res.status(404).json({
        ok: false,
        message: `No se encontró un usuario con el ID ${userId}.`,
      });
    }

    // Respuesta exitosa
    return res.status(200).json({
      ok: true,
      message: "Usuario obtenido correctamente.",
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return res.status(500).json({
      ok: false,
      message: "No se pudo obtener la información del usuario.",
      ...(process.env.NODE_ENV === "development" && { error: error.message }),
    });
  }
};
