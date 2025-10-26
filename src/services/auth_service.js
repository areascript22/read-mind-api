import jwt from "jsonwebtoken";

export const generateToken = (user) => {
  const JWT_SECRET1 = process.env.JWT_SECRET;
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    JWT_SECRET1,
    { expiresIn: "24h" }
  );
};

export const generateEmailtoken = (user) => {
  const JWT_EMAIL_SECRET = process.env.JWT_EMAIL_SECRET;
  return jwt.sign(
    {
      email: user.email,
    },
    JWT_EMAIL_SECRET,
    { expiresIn: "1h" }
  );
};
