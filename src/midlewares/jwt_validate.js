import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

export const validateResetPasswordTokenHtml = (req, res, next) => {
  const token = req.query.token;

  if (!token) {
    console.log("Token de restablecimiento faltante");
    return res.sendFile(path.join(__dirname, "../html/reset_error.html"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_Password_RESET_SECRET);
    req.email = decoded.email;
    next();
  } catch (error) {
    console.error(error);
    return res.sendFile(path.join(__dirname, "../html/reset_error.html"));
  }
};

export const validateResetPasswordTokenJson = (req, res, next) => {
  const token = req.query.token;

  if (!token) {
    return res.status(400).json({ message: "Token de contraseña faltante" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_Password_RESET_SECRET);
    req.email = decoded.email;
    next();
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "Token inválido o expirado" });
  }
};
