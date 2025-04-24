import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "jwtsecret";

export const authRequired = (req, res, next) => {
  const token = req.cookies?.token || 
               req.headers['authorization']?.split(' ')[1] || 
               req.body?.token;

  if (!token) {
    console.log('No token found in request');
    return res.status(401).json({ message: "No autorizado, token no proporcionado" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('Token verification error:', err);
      return res.status(401).json({ 
        message: "Token inválido o expirado",
        error: err.message 
      });
    }

    req.user = {
      ID_Usuario: decoded.usuarioId || decoded.ID_Usuario,
      ...decoded
    };
    
    console.log('Authenticated user:', req.user);
    next();
  });
};