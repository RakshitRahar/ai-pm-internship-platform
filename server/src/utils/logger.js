const winston = require('winston');
const path = require('path');
const fs = require('fs');

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
});

// Only use File logging in development
const transports = [
    new winston.transports.Console({
        format: combine(colorize(), timestamp({ format: 'HH:mm:ss' }), logFormat),
    }),
];

if (process.env.NODE_ENV !== 'production' && !process.env.NETLIFY) {
    // Ensure logs directory exists only in dev
    const logsDir = path.join(__dirname, '..', '..', 'logs');
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
    }

    transports.push(
        new winston.transports.File({
            filename: path.join(logsDir, 'error.log'),
            level: 'error',
        }),
        new winston.transports.File({
            filename: path.join(logsDir, 'combined.log'),
        })
    );
}

const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        logFormat
    ),
    transports,
});

module.exports = logger;
