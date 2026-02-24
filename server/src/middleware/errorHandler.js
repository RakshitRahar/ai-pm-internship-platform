/**
 * Global Error Handler Middleware
 * Catches all errors and returns consistent JSON responses
 */

const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log the error
    logger.error(`${err.name || 'Error'}: ${err.message} | URL: ${req.originalUrl} | Method: ${req.method}`);

    // ── Mongoose: Bad ObjectId ───────────────────────────────────────────────
    if (err.name === 'CastError') {
        error = { message: `Resource not found with id: ${err.value}`, statusCode: 404 };
    }

    // ── Mongoose: Duplicate Key (e.g., unique email) ─────────────────────────
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || 'field';
        const value = err.keyValue?.[field];
        error = {
            message: `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists.`,
            statusCode: 400,
        };
    }

    // ── Mongoose: Validation Errors ──────────────────────────────────────────
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((val) => val.message);
        error = { message: messages.join('. '), statusCode: 400 };
    }

    // ── JWT Errors ───────────────────────────────────────────────────────────
    if (err.name === 'JsonWebTokenError') {
        error = { message: 'Invalid token. Please login again.', statusCode: 401 };
    }
    if (err.name === 'TokenExpiredError') {
        error = { message: 'Token expired. Please login again.', statusCode: 401 };
    }

    // ── Multer File Upload Errors ────────────────────────────────────────────
    if (err.code === 'LIMIT_FILE_SIZE') {
        error = { message: 'File size too large. Maximum allowed size is 10MB.', statusCode: 400 };
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        error = { message: 'Unexpected file field.', statusCode: 400 };
    }

    const statusCode = error.statusCode || err.statusCode || 500;

    res.status(statusCode).json({
        success: false,
        message: error.message || 'Internal server error',
        // Only show stack trace in development
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

module.exports = errorHandler;
