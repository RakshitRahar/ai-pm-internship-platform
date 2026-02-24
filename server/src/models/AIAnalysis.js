/**
 * AIAnalysis Model
 * Stores the raw AI-parsed CV analysis for a user — separate from Application
 * to allow reuse across multiple applications
 */

const mongoose = require('mongoose');

const aiAnalysisSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true, // One analysis record per user (updated on each CV upload)
        },

        // ─── CV Reference ──────────────────────────────────────────────────────
        cvFilename: String,
        rawText: {
            type: String,
            select: false, // Large field; exclude from default queries
        },

        // ─── Extracted Profile ─────────────────────────────────────────────────
        extractedData: {
            // Personal
            name: String,
            email: String,
            phone: String,
            location: String,
            linkedIn: String,
            github: String,
            portfolio: String,

            // Skills breakdown
            technicalSkills: [String],
            softSkills: [String],
            tools: [String],
            languages: [String], // Programming languages
            frameworks: [String],
            databases: [String],
            cloudPlatforms: [String],

            // Education
            education: [
                {
                    institution: String,
                    degree: String,
                    field: String,
                    cgpa: Number,
                    startYear: Number,
                    endYear: Number,
                    achievements: [String],
                },
            ],

            // Experience
            experience: [
                {
                    company: String,
                    position: String,
                    duration: String,
                    startDate: String,
                    endDate: String,
                    description: String,
                    skills: [String],
                    isInternship: Boolean,
                },
            ],

            // Projects
            projects: [
                {
                    name: String,
                    description: String,
                    technologies: [String],
                    impact: String,
                    link: String,
                },
            ],

            // Certifications & Awards
            certifications: [
                {
                    name: String,
                    issuer: String,
                    year: Number,
                },
            ],
            awards: [String],
            publications: [String],

            // Summary stats extracted by AI
            totalExperienceYears: Number,
            industryDomains: [String],
            keyStrengths: [String],
            careerLevel: {
                type: String,
                enum: ['Fresher', 'Junior', 'Mid-Level', 'Senior'],
            },
        },

        // ─── AI Metadata ──────────────────────────────────────────────────────
        aiModel: String,
        tokensUsed: Number,
        processingTimeMs: Number,
        analysisVersion: { type: Number, default: 1 },
        lastAnalyzedAt: {
            type: Date,
            default: Date.now,
        },

        // ─── Overall CV Quality Score ─────────────────────────────────────────
        cvQualityScore: {
            type: Number,
            min: 0,
            max: 100,
            default: null,
        },
        cvFeedback: [String], // Suggestions for improving the CV
    },
    {
        timestamps: true,
    }
);

// Note: user index is implicit from unique:true on the field definition
aiAnalysisSchema.index({ lastAnalyzedAt: -1 });

module.exports = mongoose.model('AIAnalysis', aiAnalysisSchema);
