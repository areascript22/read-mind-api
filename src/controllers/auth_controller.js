import {
  comparePasswords,
  hashPassword,
} from "../services/password_service.js";
import { PrismaClient } from "@prisma/client";
import { generateEmailtoken, generateToken } from "../services/auth_service.js";
import { isValidEspochEmail } from "../services/validators_servide.js";
import Roles from "../models/roles.js";
import { sendEmail } from "../services/email_service.js";

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
    const verificationLink = `http://localhost:3000/api/auth/verify_email?token=${verificationToken}`;

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

export const sendVerificationEmail = async (req, res) => {
  try {
  } catch (error) {
    console.log("Error sending verification email: ", error);
  }
};
