import {
  comparePasswords,
  hashPassword,
} from "../services/password_service.js";
import { PrismaClient } from "@prisma/client";
import {
  generateEmailtoken,
  generatePasswordResetToken,
  generateToken,
} from "../services/auth_service.js";
import { isValidEspochEmail } from "../services/validators_servide.js";
import Roles from "../models/roles.js";
import { sendEmail } from "../services/email_service.js";

import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

export const signUp = async (req, res) => {
  const { name, lastName, email, password } = req.body;

  if (!name || !lastName || !email || !password) {
    res.status(400).json({
      message: "All parameters are required",
    });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();

  const isvalidEmail = isValidEspochEmail(normalizedEmail);
  if (!isvalidEmail) {
    return res.status(400).json({
      ok: false,
      message: "El email no es válido",
    });
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    return res.status(409).json({
      message: "Este email ya está en uso",
    });
  }

  try {
    const studentRole = await prisma.role.findUnique({
      where: { name: Roles.student },
    });

    let roleId = studentRole.id;

    // Super user override
    if (normalizedEmail === "jose.guamang@espoch.edu.ec") {
      const superUserRole = await prisma.role.findUnique({
        where: { name: Roles.superUser },
      });
      roleId = superUserRole.id;
    }

    const hashedPassword = await hashPassword(password);

    // 🟦 TRANSACTION STARTS HERE
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name: name.trim(),
          lastName: lastName.trim(),
          email: normalizedEmail,
          passwordHash: hashedPassword,
          roleId,
        },
        include: {
          role: true,
        },
      });

      // Create UserPreferences linked to this user
      await tx.userPreferences.create({
        data: {
          userId: user.id,
          // seenNotificationDialog defaults to false
        },
      });

      return user;
    });
    // 🟦 TRANSACTION ENDS HERE

    // Email verification
    const verificationToken = generateEmailtoken(result);
    const verificationLink = `${process.env.BASE_URL}/api/auth/verify_email?token=${verificationToken}`;

    await sendEmail(
      result.email,
      "Verifica tu cuenta",
      `Hola ${result.name}, verifica tu correo haciendo clic aquí: ${verificationLink}`
    );

    const jwtToken = generateToken(result);

    res.status(201).json({
      ok: true,
      token: jwtToken,
      user: result,
      message: "User successfully created",
    });
  } catch (error) {
    console.log("Error: ", error);
    res.status(500).json({
      message: "Hubo un error al crear el usuario",
    });
  }
};

export const verifyEmail = async (req, res) => {
  const email = req.email;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (user.emailVerified) {
      return res.status(200).json({ message: "Correo ya verificado" });
    }

    await prisma.user.update({
      where: { email },
      data: { emailVerified: true },
    });

    res.status(201).json({
      ok: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error verifyinig email" });
  }
};

export const signIn = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({
      message: "All parameters are required",
    });
    return;
  }

  const isvalidEmail = isValidEspochEmail(email);
  if (!isvalidEmail) {
    console.log("Email is not valid (@espoch.edu.ec)");
    res.status(400).json({
      message: "Email is not valid",
    });
    return;
  }
  //Try to log in
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
      },
    });

    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }
    const isPasswordMatched = await comparePasswords(
      password,
      user.passwordHash
    );
    if (!isPasswordMatched) {
      res.status(401).json({
        message: "User and password does not match",
      });
      return;
    }
    const token = generateToken(user);
    res.status(200).json({
      ok: true,
      message: "Successfully logged in",
      token: token,
      user: user,
    });
  } catch (error) {
    console.log("Erro while logging in: ", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

export const renewToken = async (req, res = response) => {
  try {
    //Const uid
    const id = req.id;

    //Obtner el usuario por el UID
    const usuario = await prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
      },
    });

    //generate new JWT
    const newToken = await generateToken(usuario);

    res.status(200).json({
      ok: true,
      message: "renew",
      user: usuario,
      token: newToken,
    });
  } catch (error) {
    console.log("Error renew token: ", error);
    res.status(500).json({
      ok: false,
      message: "No se pudo renovar el token",
    });
  }
};

export const renewUser = async (req, res = response) => {
  try {
    //Const uid
    const id = req.id;

    //Obtner el usuario por el UID
    const usuario = await prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
      },
    });

    if (!usuario) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      ok: true,
      message: "Usuario actualizado",
      user: usuario,
    });
  } catch (error) {
    console.log("Error renew token: ", error);
    res.status(500).json({
      ok: false,
      message: "No se pudo renovar el token",
    });
  }
};

export const forgotPassowrd = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
      return res.json({ ok: true });
    }
    const token = generatePasswordResetToken(email);
    const resetLink = `${process.env.BASE_URL}/api/auth/password/check_reset?token=${token}`;
    await sendEmail(
      email,
      "Restablecer contraseña",
      `
        Haz click aquí para restablecer tu contraseña:
        ${resetLink}
    `
    );

    res.status(200).json({
      ok: true,
      token: token,
      user: user,
      link: resetLink,
      message: "Enlace de recuperación de contraseña enviado",
    });
  } catch (error) {
    console.log("Error sending password recovery link: ", error);
    res.status(500).json({
      message: "Error sending password recovery link",
    });
  }
};

export const checkRestPasswordToken = async (req, res) => {
  try {
    // 1️⃣ Leer el HTML
    let html = fs.readFileSync(
      path.join(__dirname, "../html/reset_password_form.html"),
      "utf8"
    );

    // 2️⃣ Insertar BASE_URL del .env
    html = html.replace("__API_URL__", process.env.BASE_URL);

    // 3️⃣ Enviar HTML modificado
    res.send(html);
  } catch (err) {
    console.error(err);
    res.sendFile(path.join(__dirname, "../html/reset_error.html"));
  }
};

export const setNewPassword = async (req, res) => {
  try {
    const { password } = req.body;
    console.log(`Setting new password for email: ${req.email},   ${password}`);
    const hashedPassword = await hashPassword(password);
    console.log(`Hashed password: ${hashedPassword}`);
    const updatedUser = await prisma.user.update({
      where: { email: req.email },
      data: { passwordHash: hashedPassword },
    });

    res.status(200).json({
      ok: true,
      user: updatedUser,
      message: "Contraseña actualizada exitosamente",
    });
  } catch (error) {
    console.log("Error setting new password: ", error);
    res.status(500).json({
      message: "Error setting new password",
    });
  }
};
