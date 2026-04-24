# Algorithms and Key Processes Report

This document outlines the core algorithms and mathematical/AI processes implemented in the **AI-Based PM Internship Platform**. These can be directly used in your project report.

---

## 1. AI-Powered CV Parsing & Extraction Pipeline
The platform uses a sophisticated pipeline to transform unstructured PDF/DOCX resumes into clean, structured JSON data.

*   **Multi-Model Strategy**: The system implements a hierarchical fallback mechanism:
    1.  **Primary**: Google Gemini 2.0 (via `geminiService.js`)
    2.  **Secondary**: OpenAI GPT-4o-mini (via `aiService.js`)
    3.  **Tertiary**: Local Rule-Based Regex Parser (via `userController.js`)
*   **Technique**: **Few-Shot Prompting with Schema Enforcement**. The LLMs are prompted with a strict JSON schema to ensure 100% parse-rate into standardized fields: `technicalSkills`, `softSkills`, `experienceYears`, `educationScore`, etc.

## 2. Hybrid Candidate Scoring Algorithm
Located in `aiService.js`, this is a multi-factor weighted sum model used to evaluate how well a candidate matches a specific internship.

### Scoring Factors:
| Factor | Weighting Logic |
| :--- | :--- |
| **Skills Match** | Jaccard-like similarity between extracted student skills and internship requirements (Required vs Preferred). |
| **Experience Tenure** | Logarithmic scaling of years of experience relative to the internship's minimum requirements. |
| **Education Quality** | Linear normalization of CGPA (0-10 or 0-4 scale) and degree relevancy. |
| **Project Relevance** | Heuristic counting of projects that utilize the specific technology stack required for the role. |
| **Keyword Density** | Frequency analysis of domain-specific keywords (e.g., "Product Roadmap", "User Stories") within the CV text. |

### Final Formula:
$$Score = \sum (Factor_{i} \times Weight_{i})$$
*Where weights are defined in the system constants (e.g., Skills: 40%, Experience: 20%, etc.).*

## 3. Smart Allocation & Ranking Engine
Located in `allocationService.js`, this handles the competitive matching of students to available internship slots.

*   **Ranking Logic**: Implements a global sorting algorithm across the applicant pool for a specific internship, assigning a persistent `rank` integer to each application.
*   **Capacity-Constrained Allocation**: An automated process that:
    1.  Selects the top-ranked $N$ candidates where $N$ is the `availableSeats`.
    2.  Applies a **Minimum Score Threshold** (e.g., 60%) to ensure quality.
    3.  Performs a **Bulk State Transition** to move candidates from "AI Analyzed" to "Allocated".
    4.  Triggers **Automated Regret Workflows** for the remaining candidates once capacity is reached.

## 4. Local Rule-Based Parser (Fail-safe)
In scenarios where external AI APIs are unavailable, a local "shallow" parsing algorithm is used:

*   **Keyword Detection**: Uses a dictionary-based regex engine to identify 50+ technology stacks and PM methodologies.
*   **Career Level Heuristics**: Deterministic logic to categorize users:
    *   If words like "Graduate" or "Pursuing" exist $\rightarrow$ **Fresher**.
    *   If "Years" > 2 $\rightarrow$ **Junior/Mid-level**.
*   **Structure Scoring**: A density-based algorithm that evaluates the "fullness" of a CV based on word-count-to-section ratios.

## 5. Statistical Data Aggregation
The platform uses the **MongoDB Aggregation Framework** to perform complex data analysis for admin reports:

*   **Bucket Analysis**: Categorizes the entire applicant pool into score ranges (0-20, 21-40, etc.) to visualize candidate quality distribution.
*   **Moving Averages**: Calculates real-time average scores and standard deviations for specific internship cohorts to help admins set selection benchmarks.

## 6. Contextual AI Chat Assistant
A RAG-inspired (Retrieval-Augmented Generation) chatbot.

*   **Context Injection**: Instead of standard chat, the system injects the candidate's extracted profile data and AI-calculated scores into the LLM's system prompt.
*   **Result**: The AI "knows" why the student scored low in a particular area and provides targeted improvement advice.
