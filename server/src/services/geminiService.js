/**
 * Gemini AI Service
 * Replaces OpenAI — uses Google Gemini (FREE tier available)
 * Get your free API key at: https://aistudio.google.com/apikey
 */

'use strict';

const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');

// Lazy init
let geminiClient = null;
const getClient = () => {
    if (!geminiClient) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error('GEMINI_API_KEY is not set in .env file');
        geminiClient = new GoogleGenerativeAI(apiKey);
    }
    return geminiClient;
};

const MODEL_NAME = 'gemini-1.5-flash'; // Free tier model

// ─── Chat with AI Career Advisor ──────────────────────────────────────────────
const chatWithGemini = async (message, context, history = []) => {
    const genAI = getClient();
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const systemInstruction = `You are a helpful AI career advisor for India's PM Internship Scheme 2024-25.
You help students improve their applications, understand their AI scores, prepare for interviews, and learn new skills.

Student context:
- Skills: ${(context.skills || []).join(', ') || 'Not uploaded yet'}
- Career Level: ${context.careerLevel || 'Student'}
- Education: ${context.education || 'Not specified'}
- Experience: ${context.experience || 0} years

Keep responses friendly, concise (3-5 sentences), encouraging, and specific to the PM Internship Scheme.
If asked about the scheme, mention: ₹5,000/month stipend, 12-month duration, Top 500 companies like Tata, Reliance, Infosys, ONGC, etc.`;

    // Build conversation history for Gemini
    const chatHistory = history.slice(-8).map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
    }));

    try {
        const chat = model.startChat({
            history: [
                { role: 'user', parts: [{ text: systemInstruction }] },
                { role: 'model', parts: [{ text: 'Understood! I am your PM Internship AI Career Advisor. How can I help you today?' }] },
                ...chatHistory,
            ],
            generationConfig: {
                maxOutputTokens: 350,
                temperature: 0.7,
            },
        });

        const result = await chat.sendMessage(message);
        const reply = result.response.text();

        logger.info(`Gemini chat reply generated successfully.`);
        return { reply, tokensUsed: 0 };

    } catch (error) {
        logger.error(`Gemini chat error: ${error.message}`);
        throw new Error('Gemini AI is temporarily unavailable: ' + error.message);
    }
};

// ─── Parse CV with Gemini ──────────────────────────────────────────────────────
const parseCVWithGemini = async (rawText) => {
    const genAI = getClient();
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const prompt = `You are an expert CV/Resume parser. Extract structured information from this CV text and return ONLY valid JSON.

CV TEXT:
---
${rawText.slice(0, 12000)}
---

Return ONLY this JSON structure (no markdown, no extra text):
{
  "name": "string or null",
  "email": "string or null",
  "phone": "string or null",
  "location": "string or null",
  "linkedIn": "string or null",
  "github": "string or null",
  "technicalSkills": ["skill1", "skill2"],
  "softSkills": ["skill1"],
  "tools": ["tool1"],
  "languages": ["Python", "JavaScript"],
  "frameworks": ["React", "Django"],
  "databases": ["MongoDB"],
  "cloudPlatforms": ["AWS"],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "field": "string",
      "cgpa": null,
      "startYear": null,
      "endYear": null,
      "achievements": []
    }
  ],
  "experience": [
    {
      "company": "string",
      "position": "string",
      "duration": "string",
      "description": "string",
      "skills": [],
      "isInternship": false
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "technologies": [],
      "link": null
    }
  ],
  "certifications": [
    {
      "name": "string",
      "issuer": null,
      "year": null
    }
  ],
  "totalExperienceYears": 0,
  "industryDomains": [],
  "keyStrengths": [],
  "careerLevel": "Fresher",
  "cvQualityScore": 60,
  "cvFeedback": ["improvement suggestion 1", "suggestion 2"]
}`;

    try {
        const result = await model.generateContent(prompt);
        let content = result.response.text().trim();

        // Strip markdown code blocks if present
        content = content.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();

        const parsed = JSON.parse(content);
        logger.info('CV parsed with Gemini successfully');

        return {
            extractedData: parsed,
            aiModel: MODEL_NAME,
            tokensUsed: 0,
            processingTimeMs: 0,
            cvQualityScore: parsed.cvQualityScore || 60,
            cvFeedback: parsed.cvFeedback || [],
        };
    } catch (error) {
        logger.error(`Gemini CV parsing failed: ${error.message}`);
        throw new Error(`Gemini CV parsing failed: ${error.message}`);
    }
};

module.exports = { chatWithGemini, parseCVWithGemini };
