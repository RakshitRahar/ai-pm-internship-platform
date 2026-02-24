/**
 * Multer File Upload Middleware
 * Handles CV upload — validates type and size before storage
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { ALLOWED_FILE_TYPES, MAX_FILE_SIZE_MB } = require('../config/constants');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'cvs');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// ─── Storage Configuration ────────────────────────────────────────────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Format: userId-timestamp-originalname (sanitized)
        const safeOriginalName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        const uniqueFilename = `${req.user.id}-${Date.now()}-${safeOriginalName}`;
        cb(null, uniqueFilename);
    },
});

// ─── File Filter ──────────────────────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
    if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error('Invalid file type. Only PDF and DOCX files are accepted.'),
            false
        );
    }
};

// ─── Upload Middleware ────────────────────────────────────────────────────────
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE_MB * 1024 * 1024, // Convert MB to bytes
        files: 1, // Only one file per upload
    },
});

module.exports = upload;
