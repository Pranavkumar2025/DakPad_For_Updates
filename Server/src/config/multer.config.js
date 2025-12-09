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
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files are allowed!"), false);
  },
});

export const uploadNone = multer();

export const uploadPdfToCloudinary = (buffer, originalName) => {
  return new Promise((resolve, reject) => {
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