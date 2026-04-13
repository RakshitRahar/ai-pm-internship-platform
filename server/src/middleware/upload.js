/**
 * Multer File Upload Middleware
 * Uses Cloudinary in production, local disk in development
 */

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { ALLOWED_FILE_TYPES, MAX_FILE_SIZE_MB } = require("../config/constants");

const fileFilter = (req, file, cb) => {
  if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PDF and DOCX files are accepted."), false);
  }
};

let storage;

if (process.env.NODE_ENV === "production" && process.env.CLOUDINARY_CLOUD_NAME) {
  const { CloudinaryStorage } = require("multer-storage-cloudinary");
  const { cloudinary } = require("../config/cloudinary");
  storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "pm-internship-cvs",
      allowed_formats: ["pdf", "doc", "docx"],
      resource_type: "raw",
    },
  });
} else {
  const uploadsDir = path.join(__dirname, "..", "..", "uploads", "cvs");
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
      const safeOriginalName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
      cb(null, `${req.user.id}-${Date.now()}-${safeOriginalName}`);
    },
  });
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_MB * 1024 * 1024,
    files: 1,
  },
});

module.exports = upload;
