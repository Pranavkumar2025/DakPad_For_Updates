import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

export const authenticateToken = (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json({ error: "Access denied" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Token expired or invalid" });
    req.user = user;
    next();
  });
};

export const generateTokens = (admin) => {
  const payload = { adminId: admin.adminId, role: admin.role };
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
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