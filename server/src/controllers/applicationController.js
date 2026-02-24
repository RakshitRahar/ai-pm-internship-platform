/**
 * Application Controller
 * Student: submit/withdraw applications, view recommendations
 * Admin: view all applications, update statuses
 */

'use strict';

const Application = require('../models/Application');
const Internship = require('../models/Internship');
const AIAnalysis = require('../models/AIAnalysis');
const User = require('../models/User');
const { scoreCandidateForInternship } = require('../services/aiService');
const { APPLICATION_STATUS } = require('../config/constants');
const logger = require('../utils/logger');

// ─── POST /api/applications (student) ────────────────────────────────────────
exports.submitApplication = async (req, res, next) => {
    try {
        const { internshipId, coverLetter } = req.body;
        const studentId = req.user.id;

        // Validate internship exists and is open
        const internship = await Internship.findById(internshipId);
        if (!internship) {
            return res.status(404).json({ success: false, message: 'Internship not found.' });
        }
        if (!internship.isOpen) {
            return res.status(400).json({ success: false, message: 'This internship is not accepting applications.' });
        }

        // Check if student has uploaded a CV
        const student = await User.findById(studentId);
        if (!student.cv || !student.cv.filename) {
            return res.status(400).json({
                success: false,
                message: 'Please upload your CV before applying.',
            });
        }

        // Prevent duplicate applications
        const existingApp = await Application.findOne({ student: studentId, internship: internshipId });
        if (existingApp) {
            return res.status(409).json({
                success: false,
                message: 'You have already applied to this internship.',
            });
        }

        // Create application
        const application = await Application.create({
            student: studentId,
            internship: internshipId,
            coverLetter,
            cvSnapshot: {
                filename: student.cv.filename,
                path: student.cv.path,
                uploadedAt: student.cv.uploadedAt,
            },
            status: APPLICATION_STATUS.PENDING,
            statusHistory: [{ status: APPLICATION_STATUS.PENDING, changedAt: new Date() }],
        });

        await application.populate([
            { path: 'student', select: 'firstName lastName email' },
            { path: 'internship', select: 'title company location' },
        ]);

        logger.info(`Application submitted: Student ${studentId} → Internship ${internshipId}`);

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully.',
            application,
        });
    } catch (error) {
        next(error);
    }
};

// ─── GET /api/applications/my (student) ──────────────────────────────────────
exports.getMyApplications = async (req, res, next) => {
    try {
        const applications = await Application.find({ student: req.user.id })
            .sort({ createdAt: -1 })
            .populate('internship', 'title company location stipend duration status applicationDeadline');

        res.status(200).json({ success: true, applications });
    } catch (error) {
        next(error);
    }
};

// ─── GET /api/applications/:id (student/admin) ───────────────────────────────
exports.getApplication = async (req, res, next) => {
    try {
        const application = await Application.findById(req.params.id)
            .populate('student', 'firstName lastName email university degree skills')
            .populate('internship', 'title company location requiredSkills preferredSkills');

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found.' });
        }

        // Students can only view their own applications
        if (req.user.role === 'student' && application.student._id.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to view this application.' });
        }

        res.status(200).json({ success: true, application });
    } catch (error) {
        next(error);
    }
};

// ─── PATCH /api/applications/:id/withdraw (student) ──────────────────────────
exports.withdrawApplication = async (req, res, next) => {
    try {
        const application = await Application.findOne({
            _id: req.params.id,
            student: req.user.id,
        });

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found.' });
        }

        if ([APPLICATION_STATUS.ALLOCATED, APPLICATION_STATUS.REJECTED].includes(application.status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot withdraw an application with status '${application.status}'.`,
            });
        }

        application.status = APPLICATION_STATUS.WITHDRAWN;
        application.statusHistory.push({
            status: APPLICATION_STATUS.WITHDRAWN,
            changedAt: new Date(),
            changedBy: req.user.id,
            note: 'Withdrawn by applicant',
        });
        await application.save();

        res.status(200).json({ success: true, message: 'Application withdrawn.', application });
    } catch (error) {
        next(error);
    }
};

// ─── GET /api/applications/recommendations (student) ─────────────────────────
exports.getRecommendations = async (req, res, next) => {
    try {
        const aiAnalysis = await AIAnalysis.findOne({ user: req.user.id });

        if (!aiAnalysis) {
            return res.status(200).json({
                success: true,
                message: 'Upload your CV to get personalized internship recommendations.',
                recommendations: [],
            });
        }

        const candidateSkills = [
            ...(aiAnalysis.extractedData.technicalSkills || []),
            ...(aiAnalysis.extractedData.languages || []),
            ...(aiAnalysis.extractedData.frameworks || []),
        ].map((s) => s.toLowerCase());

        // Find open internships with skill overlap
        const internships = await Internship.find({ status: 'open' }).lean();

        const scored = internships.map((internship) => {
            const required = (internship.requiredSkills || []).map((s) => s.toLowerCase());
            const matched = required.filter((s) =>
                candidateSkills.some((cs) => cs.includes(s) || s.includes(cs))
            );
            const matchScore = required.length > 0 ? Math.round((matched.length / required.length) * 100) : 50;
            return { internship, matchScore, matchedSkills: matched };
        });

        // Sort by match score, return top 10
        const recommendations = scored
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 10);

        res.status(200).json({ success: true, recommendations });
    } catch (error) {
        next(error);
    }
};

// ─── PATCH /api/applications/:id/status (admin) ──────────────────────────────
exports.updateApplicationStatus = async (req, res, next) => {
    try {
        const { status, adminNotes } = req.body;

        const application = await Application.findById(req.params.id);
        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found.' });
        }

        const validStatuses = Object.values(APPLICATION_STATUS);
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status value.' });
        }

        application.status = status;
        application.adminNotes = adminNotes;
        application.reviewedBy = req.user.id;
        application.statusHistory.push({
            status,
            changedAt: new Date(),
            changedBy: req.user.id,
            note: adminNotes || `Status updated to ${status}`,
        });

        await application.save();

        res.status(200).json({ success: true, application });
    } catch (error) {
        next(error);
    }
};
