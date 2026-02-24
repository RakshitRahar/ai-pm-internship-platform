/**
 * AI Service
 * Handles all interactions with OpenAI API:
 *  - CV parsing and structured data extraction
 *  - Candidate scoring against internship requirements
 *  - AI-generated evaluation summaries
 *  - CV quality feedback
 */

'use strict';

const OpenAI = require('openai');
const logger = require('../utils/logger');
const { SCORING_WEIGHTS } = require('../config/constants');

// Initialize OpenAI client (lazily to allow env loading)
let openaiClient = null;
const getOpenAIClient = () => {
    if (!openaiClient) {
        openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return openaiClient;
};

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

// ─── CV Parser ────────────────────────────────────────────────────────────────

/**
 * Parse raw CV text and extract structured information using AI
 * @param {string} rawText - Plain text extracted from PDF/DOCX
 * @returns {Object} Structured parsed CV data
 */
const parseCVWithAI = async (rawText) => {
    const startTime = Date.now();
    const openai = getOpenAIClient();

    const systemPrompt = `You are an expert CV/Resume parser for a professional internship platform.
Your job is to extract structured information from CV text with high accuracy.
Always return valid JSON. If a field is not found, use null or empty array as appropriate.
Be thorough — extract ALL skills, technologies, tools mentioned anywhere in the CV.`;

    const userPrompt = `Parse this CV and extract all information into the following JSON structure.
Be precise, accurate, and comprehensive. Extract EVERY skill, technology, and tool mentioned.

CV TEXT:
---
${rawText.slice(0, 12000)} 
---

Return ONLY valid JSON with this exact structure:
{
  "name": "string or null",
  "email": "string or null",
  "phone": "string or null",
  "location": "string or null",
  "linkedIn": "string or null",
  "github": "string or null",
  "portfolio": "string or null",
  "technicalSkills": ["skill1", "skill2"],
  "softSkills": ["skill1", "skill2"],
  "tools": ["tool1", "tool2"],
  "languages": ["Python", "JavaScript"],
  "frameworks": ["React", "Django"],
  "databases": ["MongoDB", "PostgreSQL"],
  "cloudPlatforms": ["AWS", "GCP"],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "field": "string",
      "cgpa": number_or_null,
      "startYear": number_or_null,
      "endYear": number_or_null,
      "achievements": ["string"]
    }
  ],
  "experience": [
    {
      "company": "string",
      "position": "string",
      "duration": "string",
      "startDate": "string or null",
      "endDate": "string or null",
      "description": "string",
      "skills": ["string"],
      "isInternship": boolean
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "technologies": ["string"],
      "impact": "string or null",
      "link": "string or null"
    }
  ],
  "certifications": [
    {
      "name": "string",
      "issuer": "string or null",
      "year": number_or_null
    }
  ],
  "awards": ["string"],
  "publications": ["string"],
  "totalExperienceYears": number,
  "industryDomains": ["string"],
  "keyStrengths": ["string"],
  "careerLevel": "Fresher|Junior|Mid-Level|Senior",
  "cvQualityScore": number_between_0_and_100,
  "cvFeedback": ["actionable improvement suggestion 1", "suggestion 2"]
}`;

    try {
        const response = await openai.chat.completions.create({
            model: MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            temperature: 0.1, // Low temperature for factual extraction
            response_format: { type: 'json_object' },
        });

        const content = response.choices[0].message.content;
        const parsed = JSON.parse(content);
        const processingTimeMs = Date.now() - startTime;

        logger.info(`CV parsed successfully | tokens: ${response.usage?.total_tokens} | time: ${processingTimeMs}ms`);

        return {
            extractedData: parsed,
            aiModel: MODEL,
            tokensUsed: response.usage?.total_tokens || 0,
            processingTimeMs,
            cvQualityScore: parsed.cvQualityScore || null,
            cvFeedback: parsed.cvFeedback || [],
        };
    } catch (error) {
        logger.error(`CV parsing failed: ${error.message}`);
        throw new Error(`AI CV parsing failed: ${error.message}`);
    }
};

// ─── Candidate Scorer ─────────────────────────────────────────────────────────

/**
 * Score a candidate against a specific internship using AI + weighted algorithm
 * @param {Object} candidateAnalysis - AIAnalysis document's extractedData
 * @param {Object} internship - Internship document
 * @returns {Object} Detailed scoring result
 */
const scoreCandidateForInternship = async (candidateAnalysis, internship) => {
    const openai = getOpenAIClient();
    const data = candidateAnalysis.extractedData;

    // ── Step 1: Algorithmic Pre-scoring ─────────────────────────────────────────
    const allCandidateSkills = [
        ...(data.technicalSkills || []),
        ...(data.softSkills || []),
        ...(data.tools || []),
        ...(data.languages || []),
        ...(data.frameworks || []),
        ...(data.databases || []),
    ].map((s) => s.toLowerCase().trim());

    const requiredSkills = (internship.requiredSkills || []).map((s) => s.toLowerCase().trim());
    const preferredSkills = (internship.preferredSkills || []).map((s) => s.toLowerCase().trim());
    const internshipKeywords = (internship.keywords || []).map((k) => k.toLowerCase().trim());

    // Skills match score
    const matchedRequired = requiredSkills.filter((skill) =>
        allCandidateSkills.some((cs) => cs.includes(skill) || skill.includes(cs))
    );
    const matchedPreferred = preferredSkills.filter((skill) =>
        allCandidateSkills.some((cs) => cs.includes(skill) || skill.includes(cs))
    );

    const requiredSkillScore = requiredSkills.length > 0
        ? (matchedRequired.length / requiredSkills.length) * 100
        : 50;
    const preferredSkillBonus = preferredSkills.length > 0
        ? (matchedPreferred.length / preferredSkills.length) * 15
        : 0;
    const skillsMatchScore = Math.min(100, requiredSkillScore + preferredSkillBonus);

    // Education score
    const candidateEducation = data.education?.[0] || {};
    const minCgpa = internship.educationRequirements?.minCgpa || 0;
    const cgpaScore = candidateEducation.cgpa
        ? Math.min(100, (candidateEducation.cgpa / 10) * 100)
        : 50;
    const cgpaMeetsMin = !minCgpa || !candidateEducation.cgpa || candidateEducation.cgpa >= minCgpa;
    const educationScore = cgpaMeetsMin ? cgpaScore : cgpaScore * 0.7;

    // Experience score
    const totalExp = data.totalExperienceYears || 0;
    const minExp = internship.experienceRequirements?.minYears || 0;
    const expScore = minExp === 0 ? Math.min(100, totalExp * 20 + 60)
        : totalExp >= minExp ? Math.min(100, 70 + totalExp * 5) : (totalExp / minExp) * 60;

    // Projects score (based on count and tech overlap)
    const projectCount = (data.projects || []).length;
    const projectTechSkills = (data.projects || []).flatMap((p) =>
        (p.technologies || []).map((t) => t.toLowerCase())
    );
    const projectRelevance = requiredSkills.filter((s) =>
        projectTechSkills.some((pt) => pt.includes(s) || s.includes(pt))
    ).length;
    const projectScore = Math.min(100, projectCount * 15 + projectRelevance * 10 + 20);

    // Keywords score
    const candidateText = [
        ...(data.keyStrengths || []),
        ...(data.industryDomains || []),
        candidateEducation.field || '',
        ...((data.experience || []).map((e) => e.description || '')),
    ].join(' ').toLowerCase();

    const matchedKeywords = internshipKeywords.filter((kw) => candidateText.includes(kw));
    const keywordsScore = internshipKeywords.length > 0
        ? (matchedKeywords.length / internshipKeywords.length) * 100
        : 50;

    // ── Step 2: Calculate Weighted Overall Score ─────────────────────────────────
    const weights = SCORING_WEIGHTS;
    const overallScore = Math.round(
        skillsMatchScore * weights.SKILLS_MATCH +
        expScore * weights.EXPERIENCE +
        educationScore * weights.EDUCATION +
        projectScore * weights.PROJECTS +
        keywordsScore * weights.KEYWORDS
    );

    // ── Step 3: AI-Generated Summary ─────────────────────────────────────────────
    const aiSummary = await generateEvaluationSummary({
        candidateData: data,
        internship,
        scores: {
            overall: overallScore,
            skillsMatch: Math.round(skillsMatchScore),
            experience: Math.round(expScore),
            education: Math.round(educationScore),
            projects: Math.round(projectScore),
            keywords: Math.round(keywordsScore),
        },
        matchedSkills: matchedRequired,
        missingSkills: requiredSkills.filter((s) => !matchedRequired.includes(s)),
    });

    // Determine recommendation tier
    let recommendation;
    if (overallScore >= 80) recommendation = 'Strongly Recommend';
    else if (overallScore >= 65) recommendation = 'Recommend';
    else if (overallScore >= 45) recommendation = 'Consider';
    else recommendation = 'Not Recommended';

    return {
        overall: overallScore,
        breakdown: {
            skillsMatch: Math.round(skillsMatchScore),
            experience: Math.round(expScore),
            education: Math.round(educationScore),
            projects: Math.round(projectScore),
            keywords: Math.round(keywordsScore),
        },
        matchedSkills: matchedRequired,
        missingSkills: requiredSkills.filter((s) =>
            !allCandidateSkills.some((cs) => cs.includes(s) || s.includes(cs))
        ),
        strengthAreas: deriveStrengths(data),
        improvementAreas: deriveImprovements(data, internship),
        aiSummary,
        recommendation,
        analyzedAt: new Date(),
    };
};

// ─── AI Summary Generator ─────────────────────────────────────────────────────

/**
 * Generate an AI-written evaluation summary for a candidate-internship match
 */
const generateEvaluationSummary = async ({ candidateData, internship, scores, matchedSkills, missingSkills }) => {
    const openai = getOpenAIClient();

    const prompt = `You are a senior HR evaluator at a prestigious PM internship program.
Write a concise professional evaluation (3-4 sentences) for this candidate applying to this role.
Be specific, objective, and constructive. Mention concrete matched skills and gaps.

Internship: ${internship.title} at ${internship.company}
Required Skills: ${internship.requiredSkills.join(', ')}

Candidate Profile:
- Career Level: ${candidateData.careerLevel || 'Unknown'}
- Technical Skills: ${[...(candidateData.technicalSkills || []), ...(candidateData.languages || [])].join(', ')}
- Experience: ${candidateData.totalExperienceYears || 0} years
- Projects: ${(candidateData.projects || []).length} projects

Scores: Overall ${scores.overall}/100 | Skills ${scores.skillsMatch}/100 | Experience ${scores.experience}/100
Matched Skills: ${matchedSkills.join(', ') || 'None'}
Missing Skills: ${missingSkills.join(', ') || 'None'}

Write the evaluation summary:`;

    try {
        const response = await openai.chat.completions.create({
            model: MODEL,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.4,
            max_tokens: 200,
        });
        return response.choices[0].message.content.trim();
    } catch (error) {
        logger.warn(`AI summary generation failed, using fallback: ${error.message}`);
        return `Candidate scored ${scores.overall}/100 overall. Skills match: ${scores.skillsMatch}/100. ${matchedSkills.length > 0
                ? `Matched skills: ${matchedSkills.slice(0, 3).join(', ')}.`
                : 'Limited skill overlap detected.'
            } ${missingSkills.length > 0 ? `Key gaps: ${missingSkills.slice(0, 3).join(', ')}.` : ''}`;
    }
};

// ─── AI Chat Assistant ────────────────────────────────────────────────────────

/**
 * AI Chat assistant for applicant feedback
 * @param {string} message - User's message
 * @param {Object} context - User's CV/application context
 * @param {Array} history - Previous conversation messages
 */
const chatWithAssistant = async (message, context, history = []) => {
    const openai = getOpenAIClient();

    const systemMessage = `You are a helpful career coach and PM internship advisor.
You have access to the student's profile:
- Skills: ${(context.skills || []).join(', ')}
- Career Level: ${context.careerLevel || 'Student'}
- Education: ${context.education || 'Not specified'}
- Experience: ${context.experience || 0} years

Help them with:
1. Understanding their AI evaluation scores
2. Tips to improve their CV and application
3. PM internship preparation advice
4. Interview tips
Be encouraging, specific, and actionable. Keep responses concise (2-4 sentences).`;

    const messages = [
        { role: 'system', content: systemMessage },
        ...history.slice(-10), // Keep last 10 messages for context
        { role: 'user', content: message },
    ];

    try {
        const response = await openai.chat.completions.create({
            model: MODEL,
            messages,
            temperature: 0.7,
            max_tokens: 300,
        });

        return {
            reply: response.choices[0].message.content.trim(),
            tokensUsed: response.usage?.total_tokens || 0,
        };
    } catch (error) {
        logger.error(`Chat assistant error: ${error.message}`);
        throw new Error('Chat assistant is temporarily unavailable');
    }
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

const deriveStrengths = (data) => {
    const strengths = [];
    if ((data.technicalSkills || []).length > 5) strengths.push('Strong technical skill set');
    if ((data.projects || []).length >= 3) strengths.push('Solid project portfolio');
    if (data.totalExperienceYears >= 1) strengths.push('Relevant work experience');
    if ((data.certifications || []).length > 0) strengths.push('Professional certifications');
    if (data.careerLevel === 'Mid-Level' || data.careerLevel === 'Senior') strengths.push('Experienced professional');
    return strengths;
};

const deriveImprovements = (data, internship) => {
    const improvements = [];
    const allSkills = [
        ...(data.technicalSkills || []),
        ...(data.languages || []),
        ...(data.frameworks || []),
    ].map((s) => s.toLowerCase());

    const missingRequired = (internship.requiredSkills || []).filter(
        (s) => !allSkills.some((cs) => cs.includes(s.toLowerCase()))
    );
    if (missingRequired.length > 0) {
        improvements.push(`Learn required skills: ${missingRequired.slice(0, 3).join(', ')}`);
    }
    if ((data.projects || []).length < 2) improvements.push('Add more relevant projects to your CV');
    if (!data.linkedIn) improvements.push('Add LinkedIn profile link');
    if ((data.cvQualityScore || 0) < 60) improvements.push('Improve CV structure and content depth');
    return improvements;
};

module.exports = {
    parseCVWithAI,
    scoreCandidateForInternship,
    generateEvaluationSummary,
    chatWithAssistant,
};
