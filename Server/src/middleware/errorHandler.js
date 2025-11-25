const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "File too large. Maximum 5MB allowed." });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({ error: "Too many files uploaded." });
    }
  }

  // Custom file type error
  if (err.message?.includes("Only PDF files are allowed")) {
    return res.status(400).json({ error: "Only PDF files are allowed" });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ error: "Invalid token" });
  }
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ error: "Token expired" });
  }

  // Prisma unique constraint
  if (err.code === "P2002") {
    return res.status(409).json({ error: "Record already exists" });
  }

  // Default
  const status = err.status || 500;
  const message = process.env.NODE_ENV === "production" ? "Internal server error" : err.message;

  res.status(status).json({ error: message });
};

export default errorHandler;