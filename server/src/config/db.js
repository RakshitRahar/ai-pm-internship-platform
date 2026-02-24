/**
 * MongoDB Connection Configuration
 * Uses Mongoose with retry logic and connection event logging
 */

const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            // Modern Mongoose doesn't need deprecated options
        });

        logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);

        // Connection event listeners
        mongoose.connection.on('disconnected', () => {
            logger.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
        });

        mongoose.connection.on('reconnected', () => {
            logger.info('✅ MongoDB reconnected successfully');
        });

        mongoose.connection.on('error', (err) => {
            logger.error(`❌ MongoDB connection error: ${err.message}`);
        });

    } catch (error) {
        logger.error(`❌ MongoDB connection failed: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
