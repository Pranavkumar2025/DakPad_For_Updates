import dotenv from "dotenv";
dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
export const ACCESS_EXPIRES = "30m";
export const REFRESH_EXPIRES = "7d";