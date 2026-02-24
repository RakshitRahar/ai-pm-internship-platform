const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const AIAnalysis = require('../models/AIAnalysis');
const logger = require('../utils/logger');

// ─── Helper: check if a key looks like a real key (not a placeholder) ──────────
const isRealKey = (key) => {
    if (!key) return false;
    const placeholders = ['your_', 'your-', 'add_your', 'add-your', 'placeholder', 'change_me', 'xxxx', 'sk-proj-XXXX'];
    return !placeholders.some(p => key.toLowerCase().startsWith(p));
};

// ─── Local fallback responses when both APIs are unavailable ──────────────────
const getLocalFallbackReply = (message, context) => {
    const msg = message.toLowerCase();
    const skills = (context.skills || []).join(', ') || 'your skills';

    if (msg.includes('score') || msg.includes('improve')) {
        return `To improve your application score, focus on: (1) Adding more relevant projects to your CV, (2) Getting certifications in your domain, (3) Gaining internship experience. Your current skills (${skills}) are a great foundation!`;
    }
    if (msg.includes('skill') || msg.includes('learn')) {
        return `Based on your profile, I recommend learning: Python (for data & AI), Communication & Leadership (for PM roles), SQL (for analytics), and tools like Jira & Figma. PM roles value both technical depth and soft skills.`;
    }
    if (msg.includes('interview') || msg.includes('prepare')) {
        return `For PM internship interviews: (1) Practice STAR-method answers, (2) Study product case studies (study apps like Swiggy, Zomato), (3) Prepare for product design questions, (4) Know your metrics — DAU, MAU, retention, churn. Research the company's products deeply before the interview!`;
    }
    if (msg.includes('cv') || msg.includes('resume')) {
        return `Key CV tips: (1) Keep it to 1 page, (2) Quantify your impact (e.g. "improved performance by 30%"), (3) List skills that match the job description, (4) Add GitHub/LinkedIn links, (5) Include 2-3 strong projects with measurable outcomes. Upload your CV for AI-powered analysis!`;
    }
    if (msg.includes('stipend') || msg.includes('salary') || msg.includes('salary')) {
        return `The PM Internship Scheme 2024-25 offers ₹5,000/month stipend for a 12-month internship at India's top 500 companies like Tata, Reliance, Infosys, ONGC, and many more. A great opportunity to kickstart your career!`;
    }
    if (msg.includes('company') || msg.includes('companies')) {
        return `Top companies participating in the PM Internship Scheme include Tata Group, Reliance Industries, Infosys, Wipro, HDFC Bank, ONGC, L&T, Mahindra, and 490+ more leading Indian companies across all sectors.`;
    }
    return `Great question! As your AI Career Advisor, I recommend: (1) Upload your CV for personalized analysis, (2) Apply to internships that match your skills (${skills}), (3) Write a strong cover letter highlighting your projects, (4) Keep improving your profile regularly. You're on the right track — keep going! 💪`;
};

// POST /api/ai/chat
router.post('/chat', protect, async (req, res, next) => {
    try {
        const { message, history = [] } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, message: 'Message is required.' });
        }

        // Fetch user CV context
        let context = { skills: [], careerLevel: 'Student', education: null, experience: 0 };
        try {
            const aiAnalysis = await AIAnalysis.findOne({ user: req.user.id });
            if (aiAnalysis) {
                context = {
                    skills: [
                        ...(aiAnalysis.extractedData?.technicalSkills || []),
                        ...(aiAnalysis.extractedData?.languages || []),
                        ...(aiAnalysis.extractedData?.frameworks || []),
                    ],
                    careerLevel: aiAnalysis.extractedData?.careerLevel || 'Student',
                    education: aiAnalysis.extractedData?.education?.[0]?.degree || null,
                    experience: aiAnalysis.extractedData?.totalExperienceYears || 0,
                };
            }
        } catch (dbErr) {
            logger.warn('Could not load AI analysis for chat: ' + dbErr.message);
        }

        let reply = null;

        // ── Try Gemini (only if real key is set) ─────────────────────────────────
        if (isRealKey(process.env.GEMINI_API_KEY)) {
            try {
                const { chatWithGemini } = require('../services/geminiService');
                const result = await chatWithGemini(message.trim(), context, history);
                reply = result.reply;
                logger.info('Chat served by Gemini.');
            } catch (geminiErr) {
                logger.warn('Gemini chat failed: ' + geminiErr.message);
            }
        }

        // ── Try OpenAI if Gemini didn't work ─────────────────────────────────────
        if (!reply && isRealKey(process.env.OPENAI_API_KEY)) {
            try {
                const { chatWithAssistant } = require('../services/aiService');
                const result = await chatWithAssistant(message.trim(), context, history);
                reply = result.reply;
                logger.info('Chat served by OpenAI.');
            } catch (openaiErr) {
                logger.warn('OpenAI chat failed: ' + openaiErr.message);
            }
        }

        // ── Local fallback — never let the chat fully crash ───────────────────────
        if (!reply) {
            logger.info('Both AI APIs unavailable — using local fallback response.');
            reply = getLocalFallbackReply(message.trim(), context);
        }

        res.status(200).json({ success: true, reply, tokensUsed: 0 });

    } catch (error) {
        logger.error('Chat error: ' + error.message);
        // Even on unexpected error, return a friendly message instead of 500
        res.status(200).json({
            success: true,
            reply: "I'm here to help! For best results, please try asking about: improving your CV, skills to learn, interview tips, or company information. 😊",
            tokensUsed: 0,
        });
    }
});

module.exports = router;
