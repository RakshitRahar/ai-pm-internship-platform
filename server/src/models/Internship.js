/**
 * Internship Model
 * Represents PM internship roles with requirements for AI matching
 */

const mongoose = require('mongoose');
const { INTERNSHIP_STATUS } = require('../config/constants');

const internshipSchema = new mongoose.Schema(
    {
        // ─── Basic Info ────────────────────────────────────────────────────────
        title: {
            type: String,
            required: [true, 'Internship title is required'],
            trim: true,
            maxlength: [100, 'Title cannot exceed 100 characters'],
        },
        company: {
            type: String,
            required: [true, 'Company name is required'],
            trim: true,
        },
        department: {
            type: String,
            trim: true,
        },
        location: {
            type: String,
            required: [true, 'Location is required'],
            trim: true,
        },
        isRemote: {
            type: Boolean,
            default: false,
        },

        // ─── Job Details ──────────────────────────────────────────────────────
        description: {
            type: String,
            required: [true, 'Description is required'],
            maxlength: [5000, 'Description cannot exceed 5000 characters'],
        },
        responsibilities: [{ type: String }],
        duration: {
            value: { type: Number, required: true },
            unit: { type: String, enum: ['weeks', 'months'], default: 'months' },
        },
        stipend: {
            amount: { type: Number, default: 0 },
            currency: { type: String, default: 'INR' },
            isPaid: { type: Boolean, default: false },
        },

        // ─── Requirements (used by AI matching engine) ─────────────────────────
        requiredSkills: {
            type: [String],
            required: [true, 'Required skills are needed for AI matching'],
        },
        preferredSkills: [String],
        educationRequirements: {
            minDegree: {
                type: String,
                enum: ['Any', 'Diploma', 'Bachelors', 'Masters', 'PhD'],
                default: 'Any',
            },
            preferredMajors: [String],
            minCgpa: { type: Number, default: 0, min: 0, max: 10 },
        },
        experienceRequirements: {
            minYears: { type: Number, default: 0 },
            preferredDomains: [String],
        },
        keywords: [String], // Important terms for keyword-based scoring

        // ─── Capacity ─────────────────────────────────────────────────────────
        totalSeats: {
            type: Number,
            required: true,
            min: [1, 'Must have at least 1 seat'],
        },
        filledSeats: {
            type: Number,
            default: 0,
        },

        // ─── Dates ────────────────────────────────────────────────────────────
        applicationDeadline: {
            type: Date,
            required: [true, 'Application deadline is required'],
        },
        startDate: {
            type: Date,
            required: [true, 'Start date is required'],
        },
        endDate: Date,

        // ─── Status & Meta ────────────────────────────────────────────────────
        status: {
            type: String,
            enum: Object.values(INTERNSHIP_STATUS),
            default: INTERNSHIP_STATUS.DRAFT,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        tags: [String],

        // ─── AI enrichment ────────────────────────────────────────────────────
        aiDescription: String, // AI-enhanced description for matching
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// ─── Virtuals ──────────────────────────────────────────────────────────────
internshipSchema.virtual('availableSeats').get(function () {
    return this.totalSeats - this.filledSeats;
});

internshipSchema.virtual('isOpen').get(function () {
    return (
        this.status === 'open' &&
        this.applicationDeadline > new Date() &&
        this.filledSeats < this.totalSeats
    );
});

internshipSchema.virtual('applications', {
    ref: 'Application',
    localField: '_id',
    foreignField: 'internship',
    justOne: false,
});

// ─── Indexes ───────────────────────────────────────────────────────────────
internshipSchema.index({ status: 1, applicationDeadline: 1 });
internshipSchema.index({ requiredSkills: 1 });
internshipSchema.index({ createdBy: 1 });
internshipSchema.index({ title: 'text', description: 'text', keywords: 'text' });

module.exports = mongoose.model('Internship', internshipSchema);
