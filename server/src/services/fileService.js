/**
 * File Service
 * Handles CV file parsing — supports both local disk and Cloudinary URLs
 */

"use strict";

const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const os = require("os");
const logger = require("../utils/logger");

/**
 * Download a file from a URL to a temp path, return that path
 */
const downloadToTemp = (url) => {
  return new Promise((resolve, reject) => {
    const tmpFile = path.join(os.tmpdir(), `cv-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    const file = fs.createWriteStream(tmpFile);
    const protocol = url.startsWith("https") ? https : http;
    protocol.get(url, (res) => {
      res.pipe(file);
      file.on("finish", () => { file.close(); resolve(tmpFile); });
    }).on("error", (err) => { fs.unlink(tmpFile, () => {}); reject(err); });
  });
};

/**
 * Extract raw text from uploaded CV file (PDF or DOCX)
 * @param {string} filePathOrUrl - Local path OR Cloudinary URL
 * @param {string} mimetype - File MIME type
 */
const extractTextFromCV = async (filePathOrUrl, mimetype) => {
  let localPath = filePathOrUrl;
  let isTemp = false;

  try {
    // If it's a URL (Cloudinary), download to temp first
    if (filePathOrUrl && filePathOrUrl.startsWith("http")) {
      localPath = await downloadToTemp(filePathOrUrl);
      isTemp = true;
    }

    let text;
    if (mimetype === "application/pdf") {
      text = await extractFromPDF(localPath);
    } else if (
      mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      mimetype === "application/msword"
    ) {
      text = await extractFromDOCX(localPath);
    } else {
      throw new Error(`Unsupported file type: ${mimetype}`);
    }
    return text;
  } catch (error) {
    logger.error(`Text extraction failed for ${filePathOrUrl}: ${error.message}`);
    throw error;
  } finally {
    if (isTemp && localPath) {
      try { fs.unlinkSync(localPath); } catch (_) {}
    }
  }
};

const extractFromPDF = async (filePath) => {
  const pdfParse = require("pdf-parse");
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  if (!data.text || data.text.trim().length < 50) {
    throw new Error("PDF appears to be empty or image-only. Please upload a text-based PDF.");
  }
  return data.text.trim();
};

const extractFromDOCX = async (filePath) => {
  const mammoth = require("mammoth");
  const result = await mammoth.extractRawText({ path: filePath });
  if (!result.value || result.value.trim().length < 50) {
    throw new Error("DOCX file appears to be empty. Please upload a valid CV.");
  }
  if (result.messages && result.messages.length > 0) {
    logger.warn(`DOCX parsing warnings: ${result.messages.map((m) => m.message).join(", ")}`);
  }
  return result.value.trim();
};

/**
 * Delete a local file (no-op for Cloudinary URLs)
 */
const deleteFile = (filePathOrUrl) => {
  if (!filePathOrUrl || filePathOrUrl.startsWith("http")) return;
  try {
    if (fs.existsSync(filePathOrUrl)) {
      fs.unlinkSync(filePathOrUrl);
      logger.info(`Deleted file: ${filePathOrUrl}`);
    }
  } catch (error) {
    logger.warn(`Could not delete file ${filePathOrUrl}: ${error.message}`);
  }
};

const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

module.exports = { extractTextFromCV, deleteFile, formatFileSize };
