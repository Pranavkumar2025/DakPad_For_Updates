// src/config/multer.config.js
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    // Basic mimetype check (can be spoofed)
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed!"), false);
    }
  },
});

export const uploadNone = multer();

export const uploadPdfToCloudinary = (buffer, originalName) => {
  return new Promise((resolve, reject) => {
    // ---------------------------------------------------------
    // SECURITY FIX: Magic Byte Verification for %PDF
    // ---------------------------------------------------------
    if (!buffer || buffer.length < 4) {
      return reject(new Error("Invalid file content"));
    }
    // PDF Header: %PDF (Hex: 25 50 44 46)
    if (
      buffer[0] !== 0x25 ||
      buffer[1] !== 0x50 ||
      buffer[2] !== 0x44 ||
      buffer[3] !== 0x46
    ) {
      return reject(new Error("Security Error: File is not a valid PDF (Invalid Magic Bytes)"));
    }
    // ---------------------------------------------------------

    const cleanName = originalName
      .replace(/[^a-zA-Z0-9.-]/g, "_")
      .replace(/\.pdf$/i, "");

    const publicId = `${Date.now()}-${cleanName}`;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "my_dak_pad/pdfs",
        public_id: publicId,
        format: "pdf",
        resource_type: "raw",
        overwrite: true,
        tags: ["pdf", "dakpad"],
        context: { content_type: "application/pdf" },
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};