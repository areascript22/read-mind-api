import {
  comparePasswords,
  hashPassword,
} from "../services/password_service.js";
import { PrismaClient } from "@prisma/client";
import { generateToken } from "../services/auth_service.js";
import { isValidEspochEmail } from "../services/validators_servide.js";
import Roles from "../models/roles.js";

const prisma = new PrismaClient();

//SIGN UP FUNCTION
export const signUp = async (req, res) => {
  const { name, lastName, email, password } = req.body;
  //meake sure parameters exist
  if (!name || !lastName || !email || !password) {
    res.status(400).json({
      message: "All parameters are required",
    });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  //Check if it is ESPOCH email
  const isvalidEmail = isValidEspochEmail(email);
  if (!isvalidEmail) {
    console.log("No Email valido");
    res.status(400).json({
      ok: false,
      message: "El email no es valido ",
    });
    return;
  }

  //Check if email is already in usertry {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    return res.status(409).json({
      message: "Este email ya está en uso",
    });
  }

  try {
    //Get student  role id
    const studentRole = await prisma.role.findUnique({
      where: {
        name: Roles.student,
      },
    });
    const roleId = studentRole.id;
    //Check i am the superUser
    if (email == "jose.guamang@espoch.edu.ec") {
      const superUserRole = await prisma.role.findUnique({
        where: {
          name: Roles.superUser,
        },
      });
      roleId = superUserRole.id;
    }
    //hash password
    const hashedPassword = await hashPassword(password);
    console.log("hashed password: ", hashedPassword);
    const user = await prisma.user.create({
      data: {
        name: name,
        lastName: lastName,
        email: email,
        passwordHash: hashedPassword,
        roleId: roleId,
      },
    });
    console.log("Created user: ", user);
    //token
    const token = generateToken(user);
    res.status(201).json({
      ok: true,
      token: token,
      user: user,
      message: "User succesfully created",
    });
  } catch (error) {
    console.log("Error: ", error);
    res.status(500).json({
      message: "Hubo un error",
    });
  }
};

//SIGN IN FUNCTION
export const signIn = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({
      message: "All parameters are required",
    });
    return;
  }
  //Check if it is ESPOCH email
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
  //Const uid
  const id = req.id;

  //Obtner el usuario por el UID
  const usuario = await prisma.user.findUnique({
    where: { id },
  });

  //generate new JWT
  const newToken = await generateToken(usuario);

  res.json({
    ok: true,
    message: "renew",
    user: usuario,
    token: newToken,
  });
};
