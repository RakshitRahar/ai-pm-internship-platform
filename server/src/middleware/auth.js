/**
 * Authentication Middleware
 * Protects routes with JWT verification and role-based access control
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ROLES } = require('../config/constants');

/**
 * protect — Verify JWT and attach user to request
 */
const protect = async (req, res, next) => {
    try {
        let token;

        // Extract token from Authorization header or cookie
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized. Please login to access this resource.',
            });
        }

        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ success: false, message: 'Session expired. Please login again.' });
            }
            return res.status(401).json({ success: false, message: 'Invalid token. Please login again.' });
        }

        // Fetch user from DB (ensures user still exists and is active)
        const user = await User.findById(decoded.id).select('+passwordChangedAt');

        if (!user) {
            return res.status(401).json({ success: false, message: 'User no longer exists.' });
        }

        if (!user.isActive) {
            return res.status(403).json({ success: false, message: 'Your account has been deactivated. Contact support.' });
        }

        // Check if password changed after token was issued
        if (user.changedPasswordAfter(decoded.iat)) {
            return res.status(401).json({
                success: false,
                message: 'Password was recently changed. Please login again.',
            });
        }

        // Update last login timestamp
        await User.findByIdAndUpdate(decoded.id, { lastLogin: new Date() });

        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
};

/**
 * authorize — Restrict access to specific roles
 * Usage: authorize('admin') or authorize('admin', 'student')
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Role '${req.user.role}' is not authorized to access this resource.`,
            });
        }
        next();
    };
};

// Convenience shortcuts
const adminOnly = authorize(ROLES.ADMIN);
const studentOnly = authorize(ROLES.STUDENT);

module.exports = { protect, authorize, adminOnly, studentOnly };
