/**
 * User Model
 * Handles both Student and Admin users with role-based differentiation
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ROLES } = require('../config/constants');

const userSchema = new mongoose.Schema(
    {
        // ─── Basic Info ────────────────────────────────────────────────────────
        firstName: {
            type: String,
            required: [true, 'First name is required'],
            trim: true,
            maxlength: [50, 'First name cannot exceed 50 characters'],
        },
        lastName: {
            type: String,
            required: [true, 'Last name is required'],
            trim: true,
            maxlength: [50, 'Last name cannot exceed 50 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [8, 'Password must be at least 8 characters'],
            select: false, // Never return password in queries
        },
        role: {
            type: String,
            enum: Object.values(ROLES),
            default: ROLES.STUDENT,
        },

        // ─── Profile ──────────────────────────────────────────────────────────
        phone: {
            type: String,
            trim: true,
            match: [/^[+]?[\d\s\-()]{7,15}$/, 'Please enter a valid phone number'],
        },
        avatar: {
            type: String,
            default: null,
        },
        bio: {
            type: String,
            maxlength: [500, 'Bio cannot exceed 500 characters'],
        },

        // ─── Academic Info (Student-specific) ─────────────────────────────────
        university: {
            type: String,
            trim: true,
        },
        degree: {
            type: String,
            trim: true,
        },
        major: {
            type: String,
            trim: true,
        },
        graduationYear: {
            type: Number,
            min: 2000,
            max: 2035,
        },
        cgpa: {
            type: Number,
            min: 0,
            max: 10,
        },

        // ─── CV / Resume ──────────────────────────────────────────────────────
        cv: {
            filename: String,
            originalName: String,
            path: String,
            mimetype: String,
            size: Number,
            uploadedAt: Date,
        },

        // ─── Parsed Skills (from AI) ──────────────────────────────────────────
        skills: [{ type: String, trim: true }],

        // ─── Account Status ───────────────────────────────────────────────────
        isActive: {
            type: Boolean,
            default: true,
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        lastLogin: {
            type: Date,
        },
        passwordChangedAt: Date,
        passwordResetToken: String,
        passwordResetExpiry: Date,
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// ─── Virtuals ──────────────────────────────────────────────────────────────
userSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

userSchema.virtual('applications', {
    ref: 'Application',
    localField: '_id',
    foreignField: 'student',
    justOne: false,
});

// ─── Indexes ───────────────────────────────────────────────────────────────
// Note: email index is implicit from unique:true on the field definition
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

// ─── Pre-save Hooks ────────────────────────────────────────────────────────

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const saltRounds = 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    if (!this.isNew) {
        this.passwordChangedAt = Date.now() - 1000; // Ensure token issued before this
    }
    next();
});

// ─── Instance Methods ──────────────────────────────────────────────────────

// Compare plain password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
userSchema.methods.getSignedJwtToken = function () {
    return jwt.sign(
        { id: this._id, role: this.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

// Check if password was changed after token was issued
userSchema.methods.changedPasswordAfter = function (jwtTimestamp) {
    if (this.passwordChangedAt) {
        const changedAtTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return jwtTimestamp < changedAtTimestamp;
    }
    return false;
};

module.exports = mongoose.model('User', userSchema);
