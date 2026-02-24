/**
 * Admin Controller
 * Platform management, analytics, allocation triggers
 */

'use strict';

const User = require('../models/User');
const Internship = require('../models/Internship');
const Application = require('../models/Application');
const AIAnalysis = require('../models/AIAnalysis');
const { runBatchScoring, runSmartAllocation, getRankedCandidates, getAllocationReport } = require('../services/allocationService');
const { DEFAULT_PAGE_SIZE } = require('../config/constants');

// ─── GET /api/admin/dashboard ─────────────────────────────────────────────────
exports.getDashboardStats = async (req, res, next) => {
    try {
        const [
            totalStudents,
            totalInternships,
            totalApplications,
            allocatedCount,
            recentApplications,
            internshipStatusBreakdown,
            applicationStatusBreakdown,
            topScoringApplications,
        ] = await Promise.all([
            User.countDocuments({ role: 'student' }),
            Internship.countDocuments(),
            Application.countDocuments(),
            Application.countDocuments({ status: 'allocated' }),
            Application.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('student', 'firstName lastName email')
                .populate('internship', 'title company'),
            Internship.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } },
            ]),
            Application.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } },
            ]),
            Application.find({ 'aiScore.overall': { $ne: null } })
                .sort({ 'aiScore.overall': -1 })
                .limit(5)
                .populate('student', 'firstName lastName email')
                .populate('internship', 'title company'),
        ]);

        // Monthly application trend (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyTrend = await Application.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]);

        res.status(200).json({
            success: true,
            stats: {
                totalStudents,
                totalInternships,
                totalApplications,
                allocatedCount,
                allocationRate: totalApplications > 0
                    ? ((allocatedCount / totalApplications) * 100).toFixed(1)
                    : 0,
            },
            recentApplications,
            topScoringApplications,
            charts: {
                internshipStatus: internshipStatusBreakdown,
                applicationStatus: applicationStatusBreakdown,
                monthlyTrend,
            },
        });
    } catch (error) {
        next(error);
    }
};

// ─── GET /api/admin/users ─────────────────────────────────────────────────────
exports.getAllUsers = async (req, res, next) => {
    try {
        const {
            role,
            search,
            page = 1,
            limit = DEFAULT_PAGE_SIZE,
            sort = '-createdAt',
        } = req.query;

        const query = {};
        if (role) query.role = role;
        if (search) {
            query.$or = [
                { firstName: new RegExp(search, 'i') },
                { lastName: new RegExp(search, 'i') },
                { email: new RegExp(search, 'i') },
                { university: new RegExp(search, 'i') },
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [users, total] = await Promise.all([
            User.find(query).sort(sort).skip(skip).limit(parseInt(limit)),
            User.countDocuments(query),
        ]);

        res.status(200).json({
            success: true,
            pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
            users,
        });
    } catch (error) {
        next(error);
    }
};

// ─── GET /api/admin/users/:id ─────────────────────────────────────────────────
exports.getUserDetail = async (req, res, next) => {
    try {
        const [user, aiAnalysis, applications] = await Promise.all([
            User.findById(req.params.id),
            AIAnalysis.findOne({ user: req.params.id }),
            Application.find({ student: req.params.id }).populate('internship', 'title company status'),
        ]);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        res.status(200).json({ success: true, user, aiAnalysis, applications });
    } catch (error) {
        next(error);
    }
};

// ─── PATCH /api/admin/users/:id/toggle-active ────────────────────────────────
exports.toggleUserActive = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

        user.isActive = !user.isActive;
        await user.save();

        res.status(200).json({
            success: true,
            message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully.`,
            user,
        });
    } catch (error) {
        next(error);
    }
};

// ─── GET /api/admin/applications ─────────────────────────────────────────────
exports.getAllApplications = async (req, res, next) => {
    try {
        const {
            internshipId,
            status,
            minScore,
            search,
            page = 1,
            limit = DEFAULT_PAGE_SIZE,
        } = req.query;

        const query = {};
        if (internshipId) query.internship = internshipId;
        if (status) query.status = status;
        if (minScore) query['aiScore.overall'] = { $gte: parseInt(minScore) };

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [applications, total] = await Promise.all([
            Application.find(query)
                .sort({ rank: 1, 'aiScore.overall': -1, createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .populate('student', 'firstName lastName email university degree')
                .populate('internship', 'title company location'),
            Application.countDocuments(query),
        ]);

        res.status(200).json({
            success: true,
            pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
            applications,
        });
    } catch (error) {
        next(error);
    }
};

// ─── POST /api/admin/internships/:id/score-all ────────────────────────────────
exports.triggerBatchScoring = async (req, res, next) => {
    try {
        const result = await runBatchScoring(req.params.id, req.user.id);
        res.status(200).json({ success: true, message: 'Batch scoring completed.', result });
    } catch (error) {
        next(error);
    }
};

// ─── GET /api/admin/internships/:id/candidates ───────────────────────────────
exports.getRankedCandidatesForInternship = async (req, res, next) => {
    try {
        const result = await getRankedCandidates(req.params.id, req.query);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
};

// ─── POST /api/admin/internships/:id/allocate ─────────────────────────────────
exports.triggerAllocation = async (req, res, next) => {
    try {
        const { minScore, forceAllocate } = req.body;
        const result = await runSmartAllocation(req.params.id, req.user.id, { minScore, forceAllocate });
        res.status(200).json({ success: true, message: 'Allocation completed.', result });
    } catch (error) {
        next(error);
    }
};

// ─── GET /api/admin/internships/:id/report ────────────────────────────────────
exports.getAllocationReport = async (req, res, next) => {
    try {
        const report = await getAllocationReport(req.params.id);
        res.status(200).json({ success: true, report });
    } catch (error) {
        next(error);
    }
};
