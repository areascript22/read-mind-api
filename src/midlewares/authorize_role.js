export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const role = req.role;
    const id = req.id

    if (!id || !role) {
      return res.status(401).json({ message: "No autenticado" });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ message: "No tienes permisos para realizar esta acción" });
    }
    
    next();
  };
};
