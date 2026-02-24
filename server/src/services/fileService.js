/**
 * File Service
 * Handles CV file parsing — extracts raw text from PDF and DOCX files
 */

'use strict';

const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

/**
 * Extract raw text from uploaded CV file (PDF or DOCX)
 * @param {string} filePath - Absolute path to the uploaded file
 * @param {string} mimetype - File MIME type
 * @returns {string} Extracted raw text
 */
const extractTextFromCV = async (filePath, mimetype) => {
    try {
        if (mimetype === 'application/pdf') {
            return await extractFromPDF(filePath);
        } else if (
            mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ) {
            return await extractFromDOCX(filePath);
        } else {
            throw new Error(`Unsupported file type: ${mimetype}`);
        }
    } catch (error) {
        logger.error(`Text extraction failed for ${filePath}: ${error.message}`);
        throw error;
    }
};

/**
 * Extract text from PDF using pdf-parse
 */
const extractFromPDF = async (filePath) => {
    const pdfParse = require('pdf-parse');
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);

    if (!data.text || data.text.trim().length < 50) {
        throw new Error('PDF appears to be empty or image-only. Please upload a text-based PDF.');
    }

    return data.text.trim();
};

/**
 * Extract text from DOCX using mammoth
 */
const extractFromDOCX = async (filePath) => {
    const mammoth = require('mammoth');
    const result = await mammoth.extractRawText({ path: filePath });

    if (!result.value || result.value.trim().length < 50) {
        throw new Error('DOCX file appears to be empty. Please upload a valid CV.');
    }

    if (result.messages && result.messages.length > 0) {
        logger.warn(`DOCX parsing warnings for ${filePath}: ${result.messages.map((m) => m.message).join(', ')}`);
    }

    return result.value.trim();
};

/**
 * Delete a file from disk (for cleanup on errors)
 * @param {string} filePath
 */
const deleteFile = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            logger.info(`Deleted file: ${filePath}`);
        }
    } catch (error) {
        logger.warn(`Could not delete file ${filePath}: ${error.message}`);
    }
};

/**
 * Get file size in a human-readable format
 */
const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

module.exports = { extractTextFromCV, deleteFile, formatFileSize };
