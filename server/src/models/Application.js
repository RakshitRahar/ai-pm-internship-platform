/**
 * Application Model
 * Links a Student to an Internship, tracks AI scoring and status lifecycle
 */

const mongoose = require('mongoose');
const { APPLICATION_STATUS } = require('../config/constants');

const applicationSchema = new mongoose.Schema(
    {
        // ─── Relationships ─────────────────────────────────────────────────────
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        internship: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Internship',
            required: true,
        },

        // ─── Application Content ───────────────────────────────────────────────
        coverLetter: {
            type: String,
            maxlength: [2000, 'Cover letter cannot exceed 2000 characters'],
        },
        cvSnapshot: {
            // Snapshot of CV details at time of application
            filename: String,
            path: String,
            uploadedAt: Date,
        },

        // ─── AI Scoring ────────────────────────────────────────────────────────
        aiScore: {
            overall: { type: Number, min: 0, max: 100, default: null },
            breakdown: {
                skillsMatch: { type: Number, min: 0, max: 100, default: 0 },
                experience: { type: Number, min: 0, max: 100, default: 0 },
                education: { type: Number, min: 0, max: 100, default: 0 },
                projects: { type: Number, min: 0, max: 100, default: 0 },
                keywords: { type: Number, min: 0, max: 100, default: 0 },
            },
            matchedSkills: [String],
            missingSkills: [String],
            strengthAreas: [String],
            improvementAreas: [String],
            aiSummary: String,          // AI-generated evaluation text
            recommendation: {
                type: String,
                enum: ['Strongly Recommend', 'Recommend', 'Consider', 'Not Recommended', null],
                default: null,
            },
            analyzedAt: Date,
        },

        // ─── Admin Actions ─────────────────────────────────────────────────────
        adminNotes: {
            type: String,
            maxlength: [1000, 'Admin notes cannot exceed 1000 characters'],
        },
        allocationDate: Date,
        allocationNotes: String,
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },

        // ─── Status Lifecycle ─────────────────────────────────────────────────
        status: {
            type: String,
            enum: Object.values(APPLICATION_STATUS),
            default: APPLICATION_STATUS.PENDING,
        },
        statusHistory: [
            {
                status: String,
                changedAt: { type: Date, default: Date.now },
                changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                note: String,
            },
        ],

        // ─── Rank ─────────────────────────────────────────────────────────────
        rank: {
            type: Number,
            default: null, // Set by allocation engine
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// ─── Compound Indexes ────────────────────────────────────────────────────────
// Prevent duplicate applications from same student to same internship
applicationSchema.index({ student: 1, internship: 1 }, { unique: true });
applicationSchema.index({ internship: 1, 'aiScore.overall': -1 }); // For sorted ranking
applicationSchema.index({ student: 1, status: 1 });
applicationSchema.index({ status: 1, createdAt: -1 });

// ─── Pre-save Hook ────────────────────────────────────────────────────────────
applicationSchema.pre('save', function (next) {
    // Track status changes automatically
    if (this.isModified('status') && !this.isNew) {
        this.statusHistory.push({
            status: this.status,
            changedAt: new Date(),
        });
    }
    next();
});

module.exports = mongoose.model('Application', applicationSchema);
