/**
 * ScoreCard Component
 * Displays AI score breakdown with animated score bars
 */

const SCORE_COLORS = {
    excellent: 'from-emerald-500 to-emerald-400',
    good: 'from-blue-500 to-blue-400',
    average: 'from-amber-500 to-amber-400',
    poor: 'from-red-500 to-red-400',
};

const getScoreColor = (score) => {
    if (score >= 80) return SCORE_COLORS.excellent;
    if (score >= 60) return SCORE_COLORS.good;
    if (score >= 40) return SCORE_COLORS.average;
    return SCORE_COLORS.poor;
};

const getScoreLabel = (score) => {
    if (score >= 80) return { label: 'Excellent', color: 'text-emerald-400' };
    if (score >= 60) return { label: 'Good', color: 'text-blue-400' };
    if (score >= 40) return { label: 'Average', color: 'text-amber-400' };
    return { label: 'Poor', color: 'text-red-400' };
};

const RECOMMENDATION_STYLES = {
    'Strongly Recommend': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'Recommend': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Consider': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'Not Recommended': 'bg-red-500/20 text-red-400 border-red-500/30',
};

export function OverallScore({ score, recommendation, size = 'md' }) {
    const { label, color } = getScoreLabel(score);
    const gradientColor = getScoreColor(score);
    const radius = size === 'lg' ? 52 : 40;
    const strokeWidth = 6;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <div className="flex flex-col items-center gap-2">
            <div className={`relative ${size === 'lg' ? 'w-36 h-36' : 'w-24 h-24'}`}>
                <svg
                    className="w-full h-full -rotate-90"
                    viewBox={`0 0 ${(radius + strokeWidth) * 2} ${(radius + strokeWidth) * 2}`}
                >
                    <circle
                        cx={radius + strokeWidth}
                        cy={radius + strokeWidth}
                        r={radius}
                        fill="none"
                        stroke="rgba(255,255,255,0.06)"
                        strokeWidth={strokeWidth}
                    />
                    <circle
                        cx={radius + strokeWidth}
                        cy={radius + strokeWidth}
                        r={radius}
                        fill="none"
                        stroke="url(#scoreGradient)"
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                        <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                    </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`font-display font-bold text-white ${size === 'lg' ? 'text-3xl' : 'text-xl'}`}>
                        {score ?? '--'}
                    </span>
                    <span className="text-xs text-slate-400">/100</span>
                </div>
            </div>
            <div className="text-center">
                <span className={`text-sm font-semibold ${color}`}>{label}</span>
                {recommendation && (
                    <div className={`mt-1 text-xs px-2 py-0.5 rounded-full border ${RECOMMENDATION_STYLES[recommendation] || 'bg-slate-500/20 text-slate-400 border-slate-500/30'}`}>
                        {recommendation}
                    </div>
                )}
            </div>
        </div>
    );
}

export function ScoreBreakdown({ breakdown }) {
    const categories = [
        { key: 'skillsMatch', label: 'Skills Match', weight: '40%' },
        { key: 'experience', label: 'Experience', weight: '20%' },
        { key: 'education', label: 'Education', weight: '15%' },
        { key: 'projects', label: 'Projects', weight: '15%' },
        { key: 'keywords', label: 'Keywords', weight: '10%' },
    ];

    return (
        <div className="space-y-3">
            {categories.map(({ key, label, weight }) => {
                const score = breakdown?.[key] ?? 0;
                const gradient = getScoreColor(score);
                return (
                    <div key={key}>
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-300">{label}</span>
                                <span className="text-xs text-slate-500">({weight})</span>
                            </div>
                            <span className={`text-sm font-semibold ${getScoreLabel(score).color}`}>{score}</span>
                        </div>
                        <div className="score-bar">
                            <div
                                className={`score-bar-fill bg-gradient-to-r ${gradient}`}
                                style={{ width: `${score}%` }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default function ScoreCard({ aiScore, compact = false }) {
    if (!aiScore || aiScore.overall === null) {
        return (
            <div className="card p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-surface-700 flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🤖</span>
                </div>
                <p className="text-slate-400 text-sm">AI analysis not yet available</p>
            </div>
        );
    }

    return (
        <div className={`card ${compact ? 'p-4' : 'p-6'}`}>
            {!compact && (
                <h3 className="font-semibold text-white mb-4">AI Evaluation Score</h3>
            )}
            <div className={`${compact ? 'flex items-center gap-4' : 'flex flex-col items-center gap-6'}`}>
                <OverallScore
                    score={aiScore.overall}
                    recommendation={aiScore.recommendation}
                    size={compact ? 'md' : 'lg'}
                />
                {!compact && (
                    <div className="w-full">
                        <ScoreBreakdown breakdown={aiScore.breakdown} />
                    </div>
                )}
            </div>

            {!compact && aiScore.aiSummary && (
                <div className="mt-4 p-3 bg-surface-700/50 rounded-xl border border-surface-600">
                    <p className="text-xs text-slate-400 font-medium mb-1">AI Summary</p>
                    <p className="text-sm text-slate-300 leading-relaxed">{aiScore.aiSummary}</p>
                </div>
            )}

            {!compact && (aiScore.matchedSkills?.length > 0 || aiScore.missingSkills?.length > 0) && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                    {aiScore.matchedSkills?.length > 0 && (
                        <div>
                            <p className="text-xs text-emerald-400 font-medium mb-2">✓ Matched Skills</p>
                            <div className="flex flex-wrap gap-1">
                                {aiScore.matchedSkills.slice(0, 5).map((skill) => (
                                    <span key={skill} className="badge badge-green text-xs">{skill}</span>
                                ))}
                            </div>
                        </div>
                    )}
                    {aiScore.missingSkills?.length > 0 && (
                        <div>
                            <p className="text-xs text-red-400 font-medium mb-2">✗ Missing Skills</p>
                            <div className="flex flex-wrap gap-1">
                                {aiScore.missingSkills.slice(0, 5).map((skill) => (
                                    <span key={skill} className="badge badge-red text-xs">{skill}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
