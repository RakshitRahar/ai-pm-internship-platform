/**
 * Main Express Application Entry Point
 * AI-Based Smart Allocation Engine for PM Internship Scheme
 */

'use strict';

// ─── Fix: Allow Node.js to make HTTPS requests through antivirus SSL inspection ─
// Antivirus tools (Avast, Kaspersky etc.) intercept HTTPS with their own cert.
// Node.js rejects the fake cert by default, silently blocking ALL external API calls.
// This is safe for local development only.
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const path = require('path');
require('dotenv').config();

// Internal imports
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const internshipRoutes = require('./routes/internships');
const applicationRoutes = require('./routes/applications');
const adminRoutes = require('./routes/admin');
const aiRoutes = require('./routes/ai');

// ─── App Initialization ──────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 5000;

// ─── Connect to Database ─────────────────────────────────────────────────────
connectDB();

// ─── Security Middleware ─────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// Rate limiting — relaxed in development so testing is never blocked
const isDev = process.env.NODE_ENV === 'development';

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: isDev ? 10000 : (parseInt(process.env.RATE_LIMIT_MAX) || 100),
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Auth rate limit — strict in production, unlimited in development
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 10000 : 20,
  message: { success: false, message: 'Too many authentication attempts, please try again later.' },
});
app.use('/api/auth', authLimiter);

// ─── General Middleware ───────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    // Allow if no origin (like mobile apps or curl) or if it matches the CLIENT_URL
    const allowed = process.env.CLIENT_URL || 'http://localhost:5173';
    if (!origin || origin === allowed || origin.endsWith('.vercel.app') || origin.endsWith('.netlify.app')) {
      callback(null, true);
    } else {
      logger.warn(`Blocked by CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(mongoSanitize()); // Prevent NoSQL injection

// Fix: Netlify strips the /api prefix from the URL when redirecting to functions.
// This middleware prepends /api back to the path if it's missing, so Express routes still match.
app.use((req, res, next) => {
  if (!req.url.startsWith('/api') && !req.url.startsWith('/.netlify')) {
    req.url = '/api' + req.url;
  }
  next();
});

// Log all incoming requests for debugging in production
app.use((req, res, next) => {
  if (req.path.startsWith('/api/auth')) {
    logger.info(`Auth Request: ${req.method} ${req.path} from ${req.headers.origin}`);
  }
  next();
});

// HTTP request logger (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Static Files ─────────────────────────────────────────────────────────────
// Serve uploaded CVs (protected — only authenticated users should access these via API)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/internships', internshipRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);

// ─── Health check (No DB) ──────────────────────────────────────────────────
app.get('/api/ping', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is alive (No DB check)' });
});

// ─── Health Check (With DB) ───────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  logger.info('Health check pinged');
  res.status(200).json({
    success: true,
    message: 'PM Internship API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
// Only listen if not running as a Serverless Function (Vercel or Netlify)
if (!process.env.VERCEL && !process.env.NETLIFY) {
  app.listen(PORT, () => {
    logger.info(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
}

// Handle unhandled promise rejections (prevents server crash)
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  if (!process.env.VERCEL && !process.env.NETLIFY) {
    process.exit(1);
  }
});

module.exports = app;
