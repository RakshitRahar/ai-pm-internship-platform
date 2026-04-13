/**
 * User Controller
 * Profile management, CV upload and AI analysis pipeline
 */

'use strict';

const path = require('path');
const User = require('../models/User');
const AIAnalysis = require('../models/AIAnalysis');
const { extractTextFromCV, deleteFile, formatFileSize } = require('../services/fileService');
const logger = require('../utils/logger');

// ─── Helper: check if a key looks like a real key (not a placeholder) ──────────
const isRealKey = (key) => {
    if (!key) return false;
    const placeholders = ['your_', 'your-', 'add_your', 'add-your', 'placeholder', 'change_me', 'xxxx', 'sk-proj-XXXX'];
    return !placeholders.some(p => key.toLowerCase().startsWith(p));
};

// ─── Local Fallback CV Parser (no AI required) ─────────────────────────────────
// Extracts basic info using keyword matching when no AI API is available.
const parseCVLocally = (rawText) => {
    const text = rawText || '';
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

    // Common tech keywords to detect
    const techKeywords = [
        'Python', 'JavaScript', 'Java', 'C++', 'C#', 'TypeScript', 'React', 'Node.js',
        'Angular', 'Vue', 'Django', 'Flask', 'Spring', 'SQL', 'MongoDB', 'PostgreSQL',
        'MySQL', 'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Git', 'Linux',
        'HTML', 'CSS', 'REST', 'GraphQL', 'Machine Learning', 'Deep Learning',
        'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Excel', 'Power BI', 'Tableau',
        'Figma', 'Jira', 'Agile', 'Scrum', 'Product Management', 'Data Analysis',
    ];
    const detected = techKeywords.filter(kw =>
        text.toLowerCase().includes(kw.toLowerCase())
    );

    // Estimate career level by keywords
    const hasExperience = /experience|worked at|employed|internship/i.test(text);
    const hasFresher = /fresher|graduate|final year|pursuing/i.test(text);
    const careerLevel = hasFresher ? 'Fresher' : hasExperience ? 'Junior' : 'Fresher';

    // Simple quality score: more content = better CV
    const wordCount = text.split(/\s+/).length;
    const cvQualityScore = Math.min(75, Math.max(30, Math.round(wordCount / 15)));

    return {
        extractedData: {
            technicalSkills: detected.slice(0, 15),
            softSkills: ['Communication', 'Problem Solving', 'Teamwork'],
            tools: detected.filter(k => ['Git', 'Jira', 'Figma', 'Excel', 'Docker'].includes(k)),
            languages: detected.filter(k => ['Python', 'JavaScript', 'Java', 'C++', 'TypeScript', 'C#'].includes(k)),
            frameworks: detected.filter(k => ['React', 'Angular', 'Vue', 'Django', 'Flask', 'Node.js', 'Spring'].includes(k)),
            databases: detected.filter(k => ['MongoDB', 'MySQL', 'PostgreSQL', 'SQL'].includes(k)),
            cloudPlatforms: detected.filter(k => ['AWS', 'Azure', 'GCP'].includes(k)),
            education: [],
            experience: [],
            projects: [],
            certifications: [],
            totalExperienceYears: 0,
            industryDomains: [],
            keyStrengths: detected.slice(0, 5),
            careerLevel,
            cvQualityScore,
            cvFeedback: [
                'Add quantifiable achievements to your experience section (e.g., "increased efficiency by 20%")',
                'Include links to GitHub, LinkedIn, or portfolio for stronger profile',
                'Ensure your CV has clear sections: Summary, Skills, Experience, Education, Projects',
                detected.length < 5 ? 'Add more technical skills relevant to your target role' : null,
            ].filter(Boolean),
        },
        aiModel: 'local-fallback',
        tokensUsed: 0,
        processingTimeMs: 0,
        cvQualityScore,
        cvFeedback: [
            'Add quantifiable achievements to your experience section',
            'Include links to GitHub, LinkedIn, or portfolio',
            'Add more technical skills relevant to PM roles',
        ],
    };
};

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

        const { filename, originalname, mimetype, size } = req.file;
        // Cloudinary gives secure_url; local disk gives path
        const filePath = req.file.secure_url || req.file.path;

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

        // Parse CV — try Gemini → OpenAI → local fallback (always produces a result)
        let analysisResult = null;

        // ── Try Gemini first (free, preferred) ───────────────────────────────────
        if (isRealKey(process.env.GEMINI_API_KEY)) {
            try {
                const { parseCVWithGemini } = require('../services/geminiService');
                analysisResult = await parseCVWithGemini(rawText);
                logger.info(`CV analysis served by Gemini for user ${req.user.id}`);
            } catch (geminiErr) {
                logger.warn(`Gemini CV parsing failed: ${geminiErr.message}, trying OpenAI...`);
            }
        }

        // ── Try OpenAI if Gemini didn't work ─────────────────────────────────────
        if (!analysisResult && isRealKey(process.env.OPENAI_API_KEY)) {
            try {
                const { parseCVWithAI } = require('../services/aiService');
                analysisResult = await parseCVWithAI(rawText);
                logger.info(`CV analysis served by OpenAI for user ${req.user.id}`);
            } catch (openaiErr) {
                logger.warn(`OpenAI CV parsing failed: ${openaiErr.message}, using local fallback...`);
            }
        }

        // ── Local fallback — always works, no API key needed ─────────────────────
        if (!analysisResult) {
            logger.info(`No AI API available — using local keyword-based CV parser for user ${req.user.id}`);
            analysisResult = parseCVLocally(rawText);
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

// ─── POST /api/users/reanalyze-cv ────────────────────────────────────────────
// Re-runs AI analysis on the already-uploaded CV file (no re-upload needed)
exports.reanalyzeCV = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user?.cv?.path) {
            return res.status(400).json({
                success: false,
                message: 'No CV found on your account. Please upload your CV first.',
            });
        }

        const { path: filePath, mimetype, filename } = user.cv;

        // Extract text from the stored CV file
        let rawText;
        try {
            rawText = await extractTextFromCV(filePath, mimetype);
        } catch (extractErr) {
            return res.status(422).json({
                success: false,
                message: `Could not read your CV file: ${extractErr.message}. Please re-upload your CV.`,
            });
        }

        // Run the analysis pipeline: Gemini → OpenAI → local fallback
        let analysisResult = null;

        if (isRealKey(process.env.GEMINI_API_KEY)) {
            try {
                const { parseCVWithGemini } = require('../services/geminiService');
                analysisResult = await parseCVWithGemini(rawText);
                logger.info(`Re-analysis served by Gemini for user ${req.user.id}`);
            } catch (geminiErr) {
                logger.warn(`Gemini re-analysis failed: ${geminiErr.message}`);
            }
        }

        if (!analysisResult && isRealKey(process.env.OPENAI_API_KEY)) {
            try {
                const { parseCVWithAI } = require('../services/aiService');
                analysisResult = await parseCVWithAI(rawText);
                logger.info(`Re-analysis served by OpenAI for user ${req.user.id}`);
            } catch (openaiErr) {
                logger.warn(`OpenAI re-analysis failed: ${openaiErr.message}`);
            }
        }

        if (!analysisResult) {
            analysisResult = parseCVLocally(rawText);
            logger.info(`Re-analysis using local fallback for user ${req.user.id}`);
        }

        // Save updated analysis
        const aiAnalysis = await AIAnalysis.findOneAndUpdate(
            { user: req.user.id },
            {
                user: req.user.id,
                cvFilename: filename,
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

        // Update user skills
        const allSkills = [
            ...(analysisResult.extractedData.technicalSkills || []),
            ...(analysisResult.extractedData.softSkills || []),
            ...(analysisResult.extractedData.tools || []),
        ].slice(0, 30);
        await User.findByIdAndUpdate(req.user.id, { skills: allSkills });

        logger.info(`CV re-analysis complete for user ${req.user.id} | Score: ${analysisResult.cvQualityScore}/100`);

        res.status(200).json({
            success: true,
            message: 'CV re-analyzed successfully.',
            aiAnalysis,
        });
    } catch (error) {
        next(error);
    }
};

