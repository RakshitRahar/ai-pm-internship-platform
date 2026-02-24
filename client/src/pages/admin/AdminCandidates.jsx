import { useEffect, useState } from 'react';
import { adminAPI, internshipAPI } from '@/services/api';
import ScoreCard from '@/components/ui/ScoreCard';
import { OverallScore } from '@/components/ui/ScoreCard';
import {
    MagnifyingGlassIcon, FunnelIcon, ChevronDownIcon,
    ChevronUpIcon, UserCircleIcon, SparklesIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const STATUS_BADGE = {
    pending: 'badge-yellow',
    under_review: 'badge-blue',
    ai_analyzed: 'badge-purple',
    shortlisted: 'badge-green',
    allocated: 'badge-green',
    rejected: 'badge-red',
    withdrawn: 'badge-gray',
};

function CandidateRow({ application }) {
    const [expanded, setExpanded] = useState(false);
    const { student, internship, aiScore, status, rank, createdAt } = application;

    return (
        <>
            <tr className="tr-hover cursor-pointer" onClick={() => setExpanded(!expanded)}>
                <td className="td">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-white">{student?.firstName?.[0]}{student?.lastName?.[0]}</span>
                        </div>
                        <div>
                            <p className="font-medium text-white text-sm">{student?.firstName} {student?.lastName}</p>
                            <p className="text-xs text-slate-400">{student?.email}</p>
                        </div>
                    </div>
                </td>
                <td className="td">
                    <p className="text-sm text-white">{internship?.title}</p>
                    <p className="text-xs text-slate-400">{internship?.company}</p>
                </td>
                <td className="td text-center">
                    {rank ? <span className="font-bold text-white">#{rank}</span> : <span className="text-slate-500">—</span>}
                </td>
                <td className="td text-center">
                    {aiScore?.overall !== null && aiScore?.overall !== undefined ? (
                        <span className={`font-bold text-sm ${aiScore.overall >= 80 ? 'text-emerald-400' : aiScore.overall >= 60 ? 'text-blue-400' : aiScore.overall >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
                            {aiScore.overall}
                        </span>
                    ) : <span className="text-slate-500">—</span>}
                </td>
                <td className="td">
                    {aiScore?.recommendation ? (
                        <span className={`badge text-xs ${aiScore.recommendation === 'Strongly Recommend' ? 'badge-green' :
                                aiScore.recommendation === 'Recommend' ? 'badge-blue' :
                                    aiScore.recommendation === 'Consider' ? 'badge-yellow' : 'badge-red'
                            }`}>{aiScore.recommendation}</span>
                    ) : <span className="text-slate-500">—</span>}
                </td>
                <td className="td">
                    <span className={`badge ${STATUS_BADGE[status] || 'badge-gray'} text-xs`}>{status?.replace('_', ' ')}</span>
                </td>
                <td className="td text-slate-400">{new Date(createdAt).toLocaleDateString()}</td>
                <td className="td">
                    {expanded ? <ChevronUpIcon className="w-4 h-4 text-slate-400" /> : <ChevronDownIcon className="w-4 h-4 text-slate-400" />}
                </td>
            </tr>

            {expanded && (
                <tr>
                    <td colSpan={8} className="px-4 py-0">
                        <div className="py-4 border-t border-surface-700 animate-fade-in">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <ScoreCard aiScore={aiScore} />
                                <div className="space-y-3">
                                    <div className="card p-3">
                                        <p className="text-xs text-slate-400 mb-2">Student Info</p>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between"><span className="text-slate-400">University</span><span className="text-white">{student?.university || '—'}</span></div>
                                            <div className="flex justify-between"><span className="text-slate-400">Degree</span><span className="text-white">{student?.degree || '—'}</span></div>
                                            <div className="flex justify-between"><span className="text-slate-400">Skills</span><span className="text-white">{(student?.skills || []).slice(0, 3).join(', ') || '—'}</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}

export default function AdminCandidates() {
    const [internships, setInternships] = useState([]);
    const [selectedInternship, setSelectedInternship] = useState('');
    const [applications, setApplications] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [scoring, setScoring] = useState(false);
    const [filters, setFilters] = useState({ status: '', minScore: '' });

    useEffect(() => {
        internshipAPI.getAll({}).then(({ data }) => setInternships(data.internships));
    }, []);

    useEffect(() => {
        if (!selectedInternship) return;
        setLoading(true);
        adminAPI.getRankedCandidates(selectedInternship, {
            status: filters.status || undefined,
            minScore: filters.minScore || undefined,
        }).then(({ data }) => {
            setApplications(data.applications);
            setStats(data.stats);
        }).finally(() => setLoading(false));
    }, [selectedInternship, filters]);

    const handleBatchScore = async () => {
        if (!selectedInternship) return toast.error('Select an internship first');
        setScoring(true);
        try {
            const { data } = await adminAPI.triggerBatchScoring(selectedInternship);
            toast.success(`Scoring complete: ${data.result.scored} candidates analyzed`);
            // Reload
            const reloaded = await adminAPI.getRankedCandidates(selectedInternship, {});
            setApplications(reloaded.data.applications);
            setStats(reloaded.data.stats);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Scoring failed');
        } finally {
            setScoring(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="section-title">Candidate Rankings</h1>
                    <p className="section-subtitle">View AI-ranked candidates per internship</p>
                </div>
                <button
                    onClick={handleBatchScore}
                    disabled={!selectedInternship || scoring}
                    className="btn btn-accent"
                    id="run-ai-scoring"
                >
                    <SparklesIcon className="w-4 h-4" />
                    {scoring ? 'Running AI Analysis...' : 'Run AI Scoring'}
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <select
                    value={selectedInternship}
                    onChange={(e) => setSelectedInternship(e.target.value)}
                    className="input flex-1 max-w-xs"
                    id="internship-select"
                >
                    <option value="">Select Internship</option>
                    {internships.map(i => (
                        <option key={i._id} value={i._id}>{i.title} — {i.company}</option>
                    ))}
                </select>

                <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })} className="input w-auto">
                    <option value="">All Statuses</option>
                    <option value="ai_analyzed">AI Analyzed</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="allocated">Allocated</option>
                    <option value="pending">Pending</option>
                </select>

                <select value={filters.minScore} onChange={e => setFilters({ ...filters, minScore: e.target.value })} className="input w-auto">
                    <option value="">All Scores</option>
                    <option value="80">80+ (Excellent)</option>
                    <option value="60">60+ (Good)</option>
                    <option value="40">40+ (Average)</option>
                </select>
            </div>

            {/* Stats bar */}
            {stats && (
                <div className="grid grid-cols-4 gap-4">
                    {[
                        { label: 'Total', value: stats.totalApplicants },
                        { label: 'Avg Score', value: stats.avgScore ? Math.round(stats.avgScore) : '—' },
                        { label: 'Top Score', value: stats.maxScore ? Math.round(stats.maxScore) : '—' },
                        { label: 'Min Score', value: stats.minScore ? Math.round(stats.minScore) : '—' },
                    ].map(({ label, value }) => (
                        <div key={label} className="card p-3 text-center">
                            <p className="text-2xl font-display font-bold text-white">{value}</p>
                            <p className="text-xs text-slate-400">{label}</p>
                        </div>
                    ))}
                </div>
            )}

            {!selectedInternship ? (
                <div className="card p-12 text-center">
                    <FunnelIcon className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <p className="text-lg font-medium text-white mb-2">Select an Internship</p>
                    <p className="text-slate-400">Choose an internship to view ranked candidates</p>
                </div>
            ) : loading ? (
                <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" /></div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                {['Candidate', 'Internship', 'Rank', 'AI Score', 'Recommendation', 'Status', 'Applied', ''].map(h => (
                                    <th key={h} className="th">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-700">
                            {applications.length > 0 ? applications.map((app) => (
                                <CandidateRow key={app._id} application={app} />
                            )) : (
                                <tr>
                                    <td colSpan={8} className="text-center py-12 text-slate-400">No candidates found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
