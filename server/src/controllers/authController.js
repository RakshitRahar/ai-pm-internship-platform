/**
 * Auth Controller
 * Handles registration, login, profile retrieval
 */

'use strict';

const User = require('../models/User');
const { ROLES } = require('../config/constants');

// ─── Helper: Send Token Response ─────────────────────────────────────────────
const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();

    // Remove sensitive fields before sending
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.passwordChangedAt;
    delete userResponse.passwordResetToken;
    delete userResponse.passwordResetExpiry;

    res.status(statusCode).json({
        success: true,
        token,
        user: userResponse,
    });
};

// ─── POST /api/auth/register ──────────────────────────────────────────────────
exports.register = async (req, res, next) => {
    try {
        const { firstName, lastName, email, password, role, university, degree, major, graduationYear } = req.body;

        // Prevent creating admin accounts via public registration
        const userRole = role === ROLES.ADMIN ? ROLES.STUDENT : (role || ROLES.STUDENT);

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
        }

        const user = await User.create({
            firstName,
            lastName,
            email,
            password,
            role: userRole,
            university,
            degree,
            major,
            graduationYear,
        });

        sendTokenResponse(user, 201, res);
    } catch (error) {
        next(error);
    }
};

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password.' });
        }

        // Include password field (excluded by default in schema)
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        if (!user.isActive) {
            return res.status(403).json({ success: false, message: 'Account deactivated. Contact support.' });
        }

        sendTokenResponse(user, 200, res);
    } catch (error) {
        next(error);
    }
};

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({ success: true, user });
    } catch (error) {
        next(error);
    }
};

// ─── PUT /api/auth/update-password ────────────────────────────────────────────
exports.updatePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Please provide current and new password.' });
        }

        const user = await User.findById(req.user.id).select('+password');

        if (!(await user.matchPassword(currentPassword))) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ success: false, message: 'New password must be at least 8 characters.' });
        }

        user.password = newPassword;
        await user.save();

        sendTokenResponse(user, 200, res);
    } catch (error) {
        next(error);
    }
};

// ─── POST /api/auth/admin/register ───────────────────────────────────────────
// Internal route for creating admin accounts (secured separately)
exports.registerAdmin = async (req, res, next) => {
    try {
        const { firstName, lastName, email, password, adminSecret } = req.body;

        // Validate admin secret from request vs env
        if (adminSecret !== process.env.ADMIN_SECRET) {
            return res.status(403).json({ success: false, message: 'Invalid admin secret.' });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already in use.' });
        }

        const user = await User.create({
            firstName,
            lastName,
            email,
            password,
            role: ROLES.ADMIN,
        });

        sendTokenResponse(user, 201, res);
    } catch (error) {
        next(error);
    }
};
