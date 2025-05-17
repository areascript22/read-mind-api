import jwt from "jsonwebtoken";
export const validateJwt = (req, resp, next) => {
  //Extraer token
  try {
    const token = req.header("x-token");
    if (!token) {
      return resp.status(401).json({
        ok: false,
        msg: "Token not found in the request",
      });
    }
    //get uis from token
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    //Update uid in request
    req.id = id;
    next();
  } catch (error) {
    return resp.status(401).json({
      ok: false,
      msg: "Token no valido",
    });
  }
};
