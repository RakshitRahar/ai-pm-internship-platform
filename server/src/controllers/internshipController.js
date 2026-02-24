/**
 * Internship Controller
 * CRUD for internship listings — public reads, admin writes
 */

'use strict';

const Internship = require('../models/Internship');
const Application = require('../models/Application');
const { DEFAULT_PAGE_SIZE } = require('../config/constants');

// ─── GET /api/internships ─────────────────────────────────────────────────────
exports.getInternships = async (req, res, next) => {
    try {
        const {
            status = 'open',
            search,
            skills,
            location,
            isRemote,
            page = 1,
            limit = DEFAULT_PAGE_SIZE,
            sort = '-createdAt',
        } = req.query;

        const query = {};

        // Filter by status
        if (status) query.status = status;

        // Text search
        if (search) {
            query.$text = { $search: search };
        }

        // Skills filter
        if (skills) {
            const skillsArray = skills.split(',').map((s) => s.trim().toLowerCase());
            query.requiredSkills = {
                $in: skillsArray.map((s) => new RegExp(s, 'i')),
            };
        }

        // Location filter
        if (location) {
            query.location = new RegExp(location, 'i');
        }

        // Remote filter
        if (isRemote !== undefined) {
            query.isRemote = isRemote === 'true';
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [internships, total] = await Promise.all([
            Internship.find(query)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .populate('createdBy', 'firstName lastName'),
            Internship.countDocuments(query),
        ]);

        res.status(200).json({
            success: true,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit)),
            },
            internships,
        });
    } catch (error) {
        next(error);
    }
};

// ─── GET /api/internships/:id ─────────────────────────────────────────────────
exports.getInternship = async (req, res, next) => {
    try {
        const internship = await Internship.findById(req.params.id).populate(
            'createdBy',
            'firstName lastName email'
        );

        if (!internship) {
            return res.status(404).json({ success: false, message: 'Internship not found.' });
        }

        res.status(200).json({ success: true, internship });
    } catch (error) {
        next(error);
    }
};

// ─── POST /api/internships (admin only) ───────────────────────────────────────
exports.createInternship = async (req, res, next) => {
    try {
        req.body.createdBy = req.user.id;

        const internship = await Internship.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Internship created successfully.',
            internship,
        });
    } catch (error) {
        next(error);
    }
};

// ─── PUT /api/internships/:id (admin only) ────────────────────────────────────
exports.updateInternship = async (req, res, next) => {
    try {
        // Prevent changing createdBy
        delete req.body.createdBy;

        const internship = await Internship.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!internship) {
            return res.status(404).json({ success: false, message: 'Internship not found.' });
        }

        res.status(200).json({ success: true, internship });
    } catch (error) {
        next(error);
    }
};

// ─── DELETE /api/internships/:id (admin only) ─────────────────────────────────
exports.deleteInternship = async (req, res, next) => {
    try {
        const internship = await Internship.findByIdAndDelete(req.params.id);

        if (!internship) {
            return res.status(404).json({ success: false, message: 'Internship not found.' });
        }

        // Remove all associated applications
        await Application.deleteMany({ internship: req.params.id });

        res.status(200).json({ success: true, message: 'Internship and all applications deleted.' });
    } catch (error) {
        next(error);
    }
};

// ─── GET /api/internships/:id/stats (admin only) ─────────────────────────────
exports.getInternshipStats = async (req, res, next) => {
    try {
        const internship = await Internship.findById(req.params.id);
        if (!internship) {
            return res.status(404).json({ success: false, message: 'Internship not found.' });
        }

        const stats = await Application.aggregate([
            { $match: { internship: internship._id } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    avgScore: { $avg: '$aiScore.overall' },
                },
            },
        ]);

        res.status(200).json({ success: true, internship, stats });
    } catch (error) {
        next(error);
    }
};
