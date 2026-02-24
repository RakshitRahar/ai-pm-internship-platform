/**
 * Application-wide Constants
 * Centralizes all magic numbers and configuration values
 */

module.exports = {
    // User Roles
    ROLES: {
        STUDENT: 'student',
        ADMIN: 'admin',
    },

    // Application Status
    APPLICATION_STATUS: {
        PENDING: 'pending',
        UNDER_REVIEW: 'under_review',
        AI_ANALYZED: 'ai_analyzed',
        SHORTLISTED: 'shortlisted',
        ALLOCATED: 'allocated',
        REJECTED: 'rejected',
        WITHDRAWN: 'withdrawn',
    },

    // Internship Status
    INTERNSHIP_STATUS: {
        DRAFT: 'draft',
        OPEN: 'open',
        CLOSED: 'closed',
        COMPLETED: 'completed',
    },

    // AI Scoring Weights (must sum to 1.0)
    SCORING_WEIGHTS: {
        SKILLS_MATCH: 0.40,      // 40% — skill overlap between candidate and role
        EXPERIENCE: 0.20,         // 20% — years/relevance of experience
        EDUCATION: 0.15,          // 15% — degree relevance
        PROJECTS: 0.15,           // 15% — project relevance
        KEYWORDS: 0.10,           // 10% — keyword match in CV
    },

    // Score Thresholds
    SCORE_THRESHOLDS: {
        EXCELLENT: 80,
        GOOD: 60,
        AVERAGE: 40,
        POOR: 0,
    },

    // File Upload
    ALLOWED_FILE_TYPES: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    MAX_FILE_SIZE_MB: 10,

    // Pagination
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,

    // JWT
    TOKEN_TYPES: {
        ACCESS: 'access',
        REFRESH: 'refresh',
    },
};
