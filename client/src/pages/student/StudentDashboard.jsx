import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { userAPI, applicationAPI } from '@/services/api';
import CVUpload from '@/components/student/CVUpload';
import ScoreCard from '@/components/ui/ScoreCard';
import {
    DocumentArrowUpIcon, BriefcaseIcon, ClockIcon,
    CheckBadgeIcon, ChartBarIcon, ArrowRightIcon, SparklesIcon,
} from '@heroicons/react/24/outline';

const STATUS_BADGE = {
    pending: 'badge-yellow',
    under_review: 'badge-blue',
    ai_analyzed: 'badge-purple',
    shortlisted: 'badge-green',
    allocated: 'badge-green',
    rejected: 'badge-red',
    withdrawn: 'badge-gray',
};

export default function StudentDashboard() {
    const { user } = useAuthStore();
    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [applications, setApplications] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUpload, setShowUpload] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileRes, appsRes, recoRes] = await Promise.allSettled([
                    userAPI.getProfile(),
                    applicationAPI.getMy(),
                    applicationAPI.getRecommendations(),
                ]);

                if (profileRes.status === 'fulfilled') setAiAnalysis(profileRes.value.data.aiAnalysis);
                if (appsRes.status === 'fulfilled') setApplications(appsRes.value.data.applications);
                if (recoRes.status === 'fulfilled') setRecommendations(recoRes.value.data.recommendations || []);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const stats = [
        { label: 'Applications', value: applications.length, icon: DocumentArrowUpIcon, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { label: 'Under Review', value: applications.filter(a => ['under_review', 'ai_analyzed'].includes(a.status)).length, icon: ClockIcon, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        { label: 'Shortlisted', value: applications.filter(a => ['shortlisted', 'allocated'].includes(a.status)).length, icon: CheckBadgeIcon, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { label: 'Recommendations', value: recommendations.length, icon: SparklesIcon, color: 'text-violet-400', bg: 'bg-violet-500/10' },
    ];

    if (loading) return (
        <div className="flex items-center justify-center min-h-64">
            <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-400 text-sm">Loading your dashboard...</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="card p-6 bg-gradient-to-r from-primary-600/20 to-accent-600/20 border-primary-500/20">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="font-display text-2xl font-bold text-white">
                            Welcome back, {user?.firstName}! 👋
                        </h1>
                        <p className="text-slate-400 mt-1">
                            {aiAnalysis
                                ? `Your CV has been analyzed. CV Quality: ${aiAnalysis.cvQualityScore}/100`
                                : 'Upload your CV to get AI-powered analysis and internship recommendations.'}
                        </p>
                    </div>
                    {!user?.cv?.filename ? (
                        <button
                            onClick={() => setShowUpload(!showUpload)}
                            className="btn btn-primary flex-shrink-0"
                        >
                            <DocumentArrowUpIcon className="w-4 h-4" />
                            Upload CV
                        </button>
                    ) : (
                        <span className="badge badge-green text-sm">CV Uploaded ✓</span>
                    )}
                </div>

                {showUpload && (
                    <div className="mt-6 border-t border-surface-700 pt-6 animate-slide-up">
                        <CVUpload onSuccess={(data) => {
                            setAiAnalysis(data.aiAnalysis);
                            setShowUpload(false);
                        }} />
                    </div>
                )}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map(({ label, value, icon: Icon, color, bg }) => (
                    <div key={label} className="stat-card">
                        <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                            <Icon className={`w-5 h-5 ${color}`} />
                        </div>
                        <div className="mt-3">
                            <p className="text-2xl font-display font-bold text-white">{value}</p>
                            <p className="text-slate-400 text-sm">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* AI Analysis Card */}
                <div className="lg:col-span-1">
                    {aiAnalysis ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="section-title text-lg">Your CV Analysis</h2>
                                <Link to="/dashboard/profile" className="text-primary-400 text-sm hover:text-primary-300 flex items-center gap-1">
                                    View full <ArrowRightIcon className="w-3 h-3" />
                                </Link>
                            </div>

                            {/* CV Quality */}
                            <div className="card p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm text-slate-400">CV Quality Score</span>
                                    <span className={`font-bold ${aiAnalysis.cvQualityScore >= 70 ? 'text-emerald-400' : aiAnalysis.cvQualityScore >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                                        {aiAnalysis.cvQualityScore}/100
                                    </span>
                                </div>
                                <div className="score-bar">
                                    <div
                                        className={`score-bar-fill ${aiAnalysis.cvQualityScore >= 70 ? 'bg-emerald-500' : aiAnalysis.cvQualityScore >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                                        style={{ width: `${aiAnalysis.cvQualityScore}%` }}
                                    />
                                </div>
                            </div>

                            {/* Skills */}
                            {aiAnalysis.extractedData?.technicalSkills?.length > 0 && (
                                <div className="card p-4">
                                    <p className="text-sm font-medium text-slate-300 mb-3">Detected Skills</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {aiAnalysis.extractedData.technicalSkills.slice(0, 10).map((skill) => (
                                            <span key={skill} className="badge badge-blue">{skill}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* CV Feedback */}
                            {aiAnalysis.cvFeedback?.length > 0 && (
                                <div className="card p-4">
                                    <p className="text-sm font-medium text-slate-300 mb-3">💡 Improvement Tips</p>
                                    <ul className="space-y-2">
                                        {aiAnalysis.cvFeedback.slice(0, 3).map((tip, i) => (
                                            <li key={i} className="text-xs text-slate-400 flex gap-2">
                                                <span className="text-amber-400 flex-shrink-0">•</span>
                                                {tip}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="card p-6 text-center h-full flex flex-col items-center justify-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
                                <ChartBarIcon className="w-8 h-8 text-primary-400" />
                            </div>
                            <div>
                                <p className="font-medium text-white">No Analysis Yet</p>
                                <p className="text-slate-400 text-sm mt-1">Upload your CV to get AI-powered insights</p>
                            </div>
                            <button onClick={() => setShowUpload(true)} className="btn btn-primary btn-sm">
                                Upload CV Now
                            </button>
                        </div>
                    )}
                </div>

                {/* Recent Applications + Recommendations */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Recent Applications */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="section-title text-lg">Recent Applications</h2>
                            <Link to="/dashboard/applications" className="text-primary-400 text-sm hover:text-primary-300 flex items-center gap-1">
                                View all <ArrowRightIcon className="w-3 h-3" />
                            </Link>
                        </div>

                        {applications.length === 0 ? (
                            <div className="card p-6 text-center">
                                <BriefcaseIcon className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                                <p className="text-slate-400">No applications yet</p>
                                <Link to="/dashboard/internships" className="btn btn-primary btn-sm mt-3">
                                    Browse Internships
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {applications.slice(0, 3).map((app) => (
                                    <div key={app._id} className="card p-4 flex items-center gap-4 hover:border-surface-600 transition-all">
                                        <div className="w-10 h-10 rounded-xl bg-surface-700 flex items-center justify-center flex-shrink-0">
                                            <BriefcaseIcon className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-white text-sm truncate">{app.internship?.title}</p>
                                            <p className="text-xs text-slate-400 truncate">{app.internship?.company} • {app.internship?.location}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className={`badge ${STATUS_BADGE[app.status] || 'badge-gray'} text-xs`}>
                                                {app.status?.replace('_', ' ')}
                                            </span>
                                            {app.aiScore?.overall !== null && (
                                                <span className="text-xs text-slate-400">{app.aiScore.overall}/100</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recommendations */}
                    {recommendations.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="section-title text-lg flex items-center gap-2">
                                    <SparklesIcon className="w-5 h-5 text-accent-400" />
                                    AI Recommendations
                                </h2>
                                <Link to="/dashboard/internships" className="text-primary-400 text-sm hover:text-primary-300 flex items-center gap-1">
                                    View all <ArrowRightIcon className="w-3 h-3" />
                                </Link>
                            </div>
                            <div className="space-y-3">
                                {recommendations.slice(0, 3).map(({ internship, matchScore, matchedSkills }) => (
                                    <div key={internship._id} className="card p-4 hover:border-primary-500/30 transition-all">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-white text-sm">{internship.title}</p>
                                                <p className="text-xs text-slate-400">{internship.company} • {internship.location}</p>
                                                {matchedSkills.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {matchedSkills.slice(0, 3).map(s => (
                                                            <span key={s} className="badge badge-green text-xs">{s}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <div className={`font-bold text-sm ${matchScore >= 70 ? 'text-emerald-400' : matchScore >= 50 ? 'text-amber-400' : 'text-slate-400'}`}>
                                                    {matchScore}%
                                                </div>
                                                <div className="text-xs text-slate-500">match</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
