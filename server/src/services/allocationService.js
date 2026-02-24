/**
 * Allocation Service
 * Orchestrates the end-to-end smart allocation process:
 *  1. Batch score all applications for an internship
 *  2. Rank candidates by score
 *  3. Allocate top candidates respecting seat limits
 *  4. Produce allocation report
 */

'use strict';

const Application = require('../models/Application');
const Internship = require('../models/Internship');
const AIAnalysis = require('../models/AIAnalysis');
const User = require('../models/User');
const { scoreCandidateForInternship } = require('./aiService');
const { APPLICATION_STATUS, SCORE_THRESHOLDS } = require('../config/constants');
const logger = require('../utils/logger');

// ─── Batch Score All Applications ────────────────────────────────────────────

/**
 * Score all pending/under_review applications for a given internship
 * @param {string} internshipId
 * @param {string} adminId - Who triggered the analysis
 * @returns {Object} Summary of scoring results
 */
const runBatchScoring = async (internshipId, adminId) => {
    const internship = await Internship.findById(internshipId);
    if (!internship) throw new Error('Internship not found');

    // Fetch all non-rejected/withdrawn applications
    const applications = await Application.find({
        internship: internshipId,
        status: { $in: [APPLICATION_STATUS.PENDING, APPLICATION_STATUS.UNDER_REVIEW, APPLICATION_STATUS.AI_ANALYZED] },
    }).populate('student');

    if (applications.length === 0) {
        return { message: 'No applications to analyze', scored: 0 };
    }

    logger.info(`Starting batch scoring for internship: ${internship.title} | ${applications.length} applications`);

    const results = {
        scored: 0,
        failed: 0,
        skipped: 0,
        errors: [],
    };

    // Process in batches of 5 to avoid rate limits
    const BATCH_SIZE = 5;
    for (let i = 0; i < applications.length; i += BATCH_SIZE) {
        const batch = applications.slice(i, i + BATCH_SIZE);

        await Promise.allSettled(
            batch.map(async (application) => {
                try {
                    // Get the AI analysis for this student
                    const aiAnalysis = await AIAnalysis.findOne({ user: application.student._id });

                    if (!aiAnalysis || !aiAnalysis.extractedData) {
                        logger.warn(`No AI analysis found for student ${application.student._id}, skipping`);
                        results.skipped++;
                        return;
                    }

                    // Score the candidate
                    const scoreResult = await scoreCandidateForInternship(aiAnalysis, internship);

                    // Update application with AI score
                    application.aiScore = scoreResult;
                    application.status = APPLICATION_STATUS.AI_ANALYZED;
                    application.reviewedBy = adminId;
                    application.statusHistory.push({
                        status: APPLICATION_STATUS.AI_ANALYZED,
                        changedAt: new Date(),
                        changedBy: adminId,
                        note: 'AI scoring completed by batch analysis',
                    });

                    await application.save();
                    results.scored++;

                    logger.info(
                        `Scored application ${application._id}: ${scoreResult.overall}/100 (${scoreResult.recommendation})`
                    );
                } catch (error) {
                    logger.error(`Failed to score application ${application._id}: ${error.message}`);
                    results.failed++;
                    results.errors.push({
                        applicationId: application._id,
                        error: error.message,
                    });
                }
            })
        );

        // Small delay between batches to respect rate limits
        if (i + BATCH_SIZE < applications.length) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    }

    // After scoring, compute rankings for this internship
    await computeRankings(internshipId);

    logger.info(`Batch scoring complete: ${results.scored} scored, ${results.failed} failed, ${results.skipped} skipped`);
    return results;
};

// ─── Compute Rankings ─────────────────────────────────────────────────────────

/**
 * Rank all scored applications for an internship by overall AI score
 * @param {string} internshipId
 */
const computeRankings = async (internshipId) => {
    const scoredApplications = await Application.find({
        internship: internshipId,
        status: APPLICATION_STATUS.AI_ANALYZED,
        'aiScore.overall': { $ne: null },
    }).sort({ 'aiScore.overall': -1 });

    // Assign rank (1 = best)
    const bulkOps = scoredApplications.map((app, index) => ({
        updateOne: {
            filter: { _id: app._id },
            update: { $set: { rank: index + 1 } },
        },
    }));

    if (bulkOps.length > 0) {
        await Application.bulkWrite(bulkOps);
        logger.info(`Rankings computed for internship ${internshipId}: ${bulkOps.length} applications ranked`);
    }
};

// ─── Smart Allocation ─────────────────────────────────────────────────────────

/**
 * Automatically allocate top-ranked candidates to fill available seats
 * @param {string} internshipId
 * @param {string} adminId
 * @param {Object} options - { minScore, forceAllocate }
 * @returns {Object} Allocation report
 */
const runSmartAllocation = async (internshipId, adminId, options = {}) => {
    const { minScore = SCORE_THRESHOLDS.AVERAGE, forceAllocate = false } = options;

    const internship = await Internship.findById(internshipId).populate('createdBy');
    if (!internship) throw new Error('Internship not found');

    const availableSeats = internship.totalSeats - internship.filledSeats;
    if (availableSeats <= 0) {
        throw new Error('No available seats in this internship');
    }

    // Get top-ranked, scored applications that meet the minimum score threshold
    const eligibleApplications = await Application.find({
        internship: internshipId,
        status: APPLICATION_STATUS.AI_ANALYZED,
        'aiScore.overall': { $gte: forceAllocate ? 0 : minScore },
    })
        .sort({ rank: 1 }) // Rank 1 = best
        .limit(availableSeats)
        .populate('student', 'firstName lastName email');

    if (eligibleApplications.length === 0) {
        return {
            allocated: 0,
            message: `No eligible candidates scored above ${minScore}/100. Try lowering the minimum score threshold.`,
        };
    }

    // Allocate top candidates
    const allocated = [];
    const allocationDate = new Date();

    for (const application of eligibleApplications) {
        application.status = APPLICATION_STATUS.ALLOCATED;
        application.allocationDate = allocationDate;
        application.allocationNotes = `Auto-allocated by Smart Allocation Engine. Score: ${application.aiScore.overall}/100, Rank: ${application.rank}`;
        application.reviewedBy = adminId;
        application.statusHistory.push({
            status: APPLICATION_STATUS.ALLOCATED,
            changedAt: allocationDate,
            changedBy: adminId,
            note: 'Allocated by Smart Allocation Engine',
        });

        await application.save();
        allocated.push({
            applicationId: application._id,
            student: application.student,
            score: application.aiScore.overall,
            rank: application.rank,
            recommendation: application.aiScore.recommendation,
        });
    }

    // Update internship filled seats
    await Internship.findByIdAndUpdate(internshipId, {
        $inc: { filledSeats: allocated.length },
    });

    // Reject remaining analysed applications (those not allocated)
    if (allocated.length > 0) {
        const allocatedIds = allocated.map((a) => a.applicationId);
        await Application.updateMany(
            {
                internship: internshipId,
                status: APPLICATION_STATUS.AI_ANALYZED,
                _id: { $nin: allocatedIds },
            },
            {
                $set: {
                    status: APPLICATION_STATUS.REJECTED,
                    allocationNotes: 'Not selected in the automated allocation round',
                },
                $push: {
                    statusHistory: {
                        status: APPLICATION_STATUS.REJECTED,
                        changedAt: allocationDate,
                        changedBy: adminId,
                        note: 'Not selected during automated allocation',
                    },
                },
            }
        );
    }

    logger.info(`Allocation complete for ${internship.title}: ${allocated.length} candidates allocated`);

    return {
        internship: { id: internship._id, title: internship.title, company: internship.company },
        allocated: allocated.length,
        candidates: allocated,
        availableSeats,
        remainingSeats: availableSeats - allocated.length,
        allocationDate,
    };
};

// ─── Get Ranked Candidates ────────────────────────────────────────────────────

/**
 * Get ranked list of candidates for an internship (for admin view)
 * @param {string} internshipId
 * @param {Object} filters - { status, minScore, maxScore, page, limit }
 */
const getRankedCandidates = async (internshipId, filters = {}) => {
    const {
        status,
        minScore = 0,
        maxScore = 100,
        page = 1,
        limit = 20,
    } = filters;

    const query = {
        internship: internshipId,
        'aiScore.overall': { $gte: minScore, $lte: maxScore },
    };

    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
        Application.find(query)
            .sort({ rank: 1, 'aiScore.overall': -1 })
            .skip(skip)
            .limit(limit)
            .populate('student', 'firstName lastName email university degree skills'),
        Application.countDocuments(query),
    ]);

    // Compute statistics
    const stats = await Application.aggregate([
        { $match: { internship: require('mongoose').Types.ObjectId.createFromHexString(internshipId) } },
        {
            $group: {
                _id: null,
                avgScore: { $avg: '$aiScore.overall' },
                maxScore: { $max: '$aiScore.overall' },
                minScore: { $min: '$aiScore.overall' },
                totalApplicants: { $sum: 1 },
            },
        },
    ]);

    return {
        applications,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        stats: stats[0] || { avgScore: 0, maxScore: 0, minScore: 0, totalApplicants: 0 },
    };
};

// ─── Allocation Report ────────────────────────────────────────────────────────

/**
 * Generate a summary allocation report for an internship
 */
const getAllocationReport = async (internshipId) => {
    const internship = await Internship.findById(internshipId);
    if (!internship) throw new Error('Internship not found');

    const statusCounts = await Application.aggregate([
        { $match: { internship: require('mongoose').Types.ObjectId.createFromHexString(internshipId) } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const scoreDistribution = await Application.aggregate([
        {
            $match: {
                internship: require('mongoose').Types.ObjectId.createFromHexString(internshipId),
                'aiScore.overall': { $ne: null },
            },
        },
        {
            $bucket: {
                groupBy: '$aiScore.overall',
                boundaries: [0, 20, 40, 60, 80, 101],
                default: 'Other',
                output: { count: { $sum: 1 } },
            },
        },
    ]);

    const statusMap = {};
    statusCounts.forEach(({ _id, count }) => { statusMap[_id] = count; });

    return {
        internship: {
            id: internship._id,
            title: internship.title,
            company: internship.company,
            totalSeats: internship.totalSeats,
            filledSeats: internship.filledSeats,
            status: internship.status,
        },
        applicationStatus: statusMap,
        scoreDistribution,
        allocationRate: internship.totalSeats > 0
            ? ((internship.filledSeats / internship.totalSeats) * 100).toFixed(1)
            : 0,
    };
};

module.exports = {
    runBatchScoring,
    computeRankings,
    runSmartAllocation,
    getRankedCandidates,
    getAllocationReport,
};
