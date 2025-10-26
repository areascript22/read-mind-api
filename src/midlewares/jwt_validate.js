import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const validateJwt = async (req, resp, next) => {
  try {
    const token = req.header("x-token");
    if (!token) {
      return resp.status(401).json({
        ok: false,
        msg: "Token not found in the request",
      });
    }

    // Verificar token
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    req.id = id;

    // Obtener usuario y rol
    const user = await prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });

    if (!user || !user.role) {
      return resp.status(403).json({
        ok: false,
        message: "Usuario no autorizado o rol no encontrado",
      });
    }

    req.role = user.role.name; // Guardamos el rol para uso posterior
    next();
  } catch (error) {
    console.error("JWT validation error:", error);
    return resp.status(401).json({
      ok: false,
      message: "Token no válido",
    });
  }
};

export const validateEmailToken = (req, res, next) => {
  const token = req.query.token;

  if (!token) {
    return res.status(400).json({ message: "Token de verificación faltante" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_EMAIL_SECRET);
    req.email = decoded.email; // Pasamos el email decodificado al controlador
    next(); // Todo bien, seguimos al controlador
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "Token inválido o expirado" });
  }
};
