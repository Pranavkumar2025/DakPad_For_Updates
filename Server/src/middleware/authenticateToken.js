import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/jwt.config.js";

const authenticateToken = (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json({ error: "Access denied" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Token expired or invalid" });

    if (user.adminId || user.supervisorId) {
      req.user = user;
      next();
    } else {
      res.status(403).json({ error: "Invalid token payload" });
    }
  });
};

export default authenticateToken;