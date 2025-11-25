import jwt from "jsonwebtoken";
import { JWT_SECRET, ACCESS_EXPIRES, REFRESH_EXPIRES } from "../config/jwt.config.js";

export const generateTokens = (user) => {
  let payload = {};

  if (user.adminId) {
    payload = { adminId: user.adminId, role: user.role || "admin" };
  } else if (user.supervisorId || user.role === "Supervisor") {
    payload = {
      supervisorId: user.supervisorId,
      name: user.name,
      role: "Supervisor",
      department: user.department,
    };
  }

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_EXPIRES });
  const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_EXPIRES });
  return { accessToken, refreshToken };
};

export const setTokenCookie = (res, name, token, maxAgeSeconds) => {
  res.cookie(name, token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: maxAgeSeconds * 1000,
  });
};