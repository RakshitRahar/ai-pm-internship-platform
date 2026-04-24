/**
 * MongoDB Connection Configuration
 * Uses Mongoose with retry logic and connection event logging
 */

const mongoose = require('mongoose');
const logger = require('../utils/logger');

let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        logger.info('Using existing MongoDB connection');
        return;
    }

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000, // 5 second timeout for DB connection
        });
        isConnected = conn.connection.readyState === 1;
        logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
        
        // Only register listeners once
        if (isConnected && mongoose.connection.listenerCount('error') === 0) {
            mongoose.connection.on('error', (err) => {
                logger.error(`❌ MongoDB connection error: ${err.message}`);
                isConnected = false;
            });
        }
    } catch (error) {
        logger.error(`❌ MongoDB connection failed: ${error.message}`);
        // In serverless, we don't want to kill the process immediately; 
        // the next invocation will try again.
        if (!process.env.VERCEL && !process.env.NETLIFY) {
            process.exit(1);
        }
        throw error;
    }
};

module.exports = connectDB;
