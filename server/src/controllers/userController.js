/**
 * User Controller
 * Profile management, CV upload and AI analysis pipeline
 */

'use strict';

const path = require('path');
const User = require('../models/User');
const AIAnalysis = require('../models/AIAnalysis');
const { extractTextFromCV, deleteFile, formatFileSize } = require('../services/fileService');
const { parseCVWithAI } = require('../services/aiService');
const logger = require('../utils/logger');

// ─── GET /api/users/profile ───────────────────────────────────────────────────
exports.getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        const aiAnalysis = await AIAnalysis.findOne({ user: req.user.id });

        res.status(200).json({
            success: true,
            user,
            aiAnalysis: aiAnalysis || null,
        });
    } catch (error) {
        next(error);
    }
};

// ─── PUT /api/users/profile ───────────────────────────────────────────────────
exports.updateProfile = async (req, res, next) => {
    try {
        const allowedFields = [
            'firstName', 'lastName', 'phone', 'bio',
            'university', 'degree', 'major', 'graduationYear', 'cgpa',
        ];

        const updates = {};
        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        });

        const user = await User.findByIdAndUpdate(
            req.user.id,
            updates,
            { new: true, runValidators: true }
        );

        res.status(200).json({ success: true, user });
    } catch (error) {
        next(error);
    }
};

// ─── POST /api/users/upload-cv ────────────────────────────────────────────────
exports.uploadCV = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a CV file (PDF or DOCX).' });
        }

        const { filename, originalname, path: filePath, mimetype, size } = req.file;

        logger.info(`CV uploaded by user ${req.user.id}: ${originalname} (${formatFileSize(size)})`);

        // Update user CV record
        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                cv: {
                    filename,
                    originalName: originalname,
                    path: filePath,
                    mimetype,
                    size,
                    uploadedAt: new Date(),
                },
            },
            { new: true }
        );

        // ── Trigger AI Analysis Pipeline ─────────────────────────────────────────
        let rawText;
        try {
            rawText = await extractTextFromCV(filePath, mimetype);
        } catch (extractErr) {
            deleteFile(filePath);
            return res.status(422).json({
                success: false,
                message: extractErr.message,
            });
        }

        // Parse CV with AI
        let analysisResult;
        try {
            analysisResult = await parseCVWithAI(rawText);
        } catch (aiErr) {
            logger.error(`AI parsing failed for user ${req.user.id}: ${aiErr.message}`);
            // Return success for upload but note AI analysis failed
            return res.status(207).json({
                success: true,
                message: 'CV uploaded successfully. AI analysis failed — please try again.',
                user,
                aiAnalysis: null,
                warning: aiErr.message,
            });
        }

        // Save/update AI analysis record
        const aiAnalysis = await AIAnalysis.findOneAndUpdate(
            { user: req.user.id },
            {
                user: req.user.id,
                cvFilename: filename,
                rawText, // Store raw text for debugging (excluded from default queries)
                extractedData: analysisResult.extractedData,
                aiModel: analysisResult.aiModel,
                tokensUsed: analysisResult.tokensUsed,
                processingTimeMs: analysisResult.processingTimeMs,
                cvQualityScore: analysisResult.cvQualityScore,
                cvFeedback: analysisResult.cvFeedback,
                lastAnalyzedAt: new Date(),
                $inc: { analysisVersion: 1 },
            },
            { new: true, upsert: true }
        );

        // Update user's skills field with extracted skills
        const allSkills = [
            ...(analysisResult.extractedData.technicalSkills || []),
            ...(analysisResult.extractedData.softSkills || []),
            ...(analysisResult.extractedData.tools || []),
        ].slice(0, 30); // Cap at 30 skills

        await User.findByIdAndUpdate(req.user.id, { skills: allSkills });

        logger.info(`AI CV analysis complete for user ${req.user.id} | Score: ${analysisResult.cvQualityScore}/100`);

        res.status(200).json({
            success: true,
            message: 'CV uploaded and analyzed successfully.',
            user,
            aiAnalysis,
        });
    } catch (error) {
        // Cleanup uploaded file on unexpected errors
        if (req.file) deleteFile(req.file.path);
        next(error);
    }
};

// ─── GET /api/users/cv-analysis ──────────────────────────────────────────────
exports.getCVAnalysis = async (req, res, next) => {
    try {
        const aiAnalysis = await AIAnalysis.findOne({ user: req.user.id });

        if (!aiAnalysis) {
            return res.status(404).json({
                success: false,
                message: 'No CV analysis found. Please upload your CV first.',
            });
        }

        res.status(200).json({ success: true, aiAnalysis });
    } catch (error) {
        next(error);
    }
};
