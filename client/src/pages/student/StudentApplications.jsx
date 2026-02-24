import { useEffect, useState } from 'react';
import { applicationAPI } from '@/services/api';
import ScoreCard from '@/components/ui/ScoreCard';
import { ScoreBreakdown } from '@/components/ui/ScoreCard';
import {
    BriefcaseIcon, MapPinIcon, CalendarIcon,
    ChevronDownIcon, ChevronUpIcon, ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
    pending: { label: 'Pending', class: 'badge-yellow' },
    under_review: { label: 'Under Review', class: 'badge-blue' },
    ai_analyzed: { label: 'AI Analyzed', class: 'badge-purple' },
    shortlisted: { label: 'Shortlisted', class: 'badge-green' },
    allocated: { label: '🎉 Allocated', class: 'badge-green' },
    rejected: { label: 'Not Selected', class: 'badge-red' },
    withdrawn: { label: 'Withdrawn', class: 'badge-gray' },
};

function ApplicationCard({ application, onWithdraw }) {
    const [expanded, setExpanded] = useState(false);
    const [withdrawing, setWithdrawing] = useState(false);
    const { internship, aiScore, status, createdAt, rank } = application;
    const s = STATUS_CONFIG[status] || { label: status, class: 'badge-gray' };

    const handleWithdraw = async () => {
        if (!window.confirm('Are you sure you want to withdraw this application?')) return;
        setWithdrawing(true);
        try {
            await applicationAPI.withdraw(application._id);
            toast.success('Application withdrawn');
            onWithdraw(application._id);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to withdraw');
        } finally {
            setWithdrawing(false);
        }
    };

    return (
        <div className="card overflow-hidden transition-all duration-300">
            {/* Allocated banner */}
            {status === 'allocated' && (
                <div className="px-4 py-2 bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-2">
                    🎉 Congratulations! You have been allocated to this internship.
                </div>
            )}

            <div className="p-4 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-surface-700 flex items-center justify-center flex-shrink-0">
                    <BriefcaseIcon className="w-5 h-5 text-slate-400" />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                            <h3 className="font-medium text-white">{internship?.title}</h3>
                            <p className="text-sm text-slate-400">{internship?.company}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            {rank && <span className="text-xs text-slate-500">Rank #{rank}</span>}
                            <span className={`badge ${s.class}`}>{s.label}</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                            <MapPinIcon className="w-3 h-3" />{internship?.location}
                        </span>
                        <span className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />Applied {new Date(createdAt).toLocaleDateString()}
                        </span>
                        {aiScore?.overall !== null && aiScore?.overall !== undefined && (
                            <span className={`font-medium ${aiScore.overall >= 70 ? 'text-emerald-400' : aiScore.overall >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                                AI Score: {aiScore.overall}/100
                            </span>
                        )}
                    </div>
                </div>

                <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-slate-400 hover:text-white transition-colors flex-shrink-0"
                >
                    {expanded ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                </button>
            </div>

            {/* Expanded Details */}
            {expanded && (
                <div className="border-t border-surface-700 p-4 space-y-4 animate-fade-in">
                    {aiScore?.overall !== null && aiScore?.overall !== undefined ? (
                        <>
                            <ScoreCard aiScore={aiScore} />
                        </>
                    ) : (
                        <p className="text-slate-400 text-sm text-center py-4">
                            AI analysis hasn't been run yet. Check back soon.
                        </p>
                    )}

                    {/* Withdraw button */}
                    {!['allocated', 'rejected', 'withdrawn'].includes(status) && (
                        <button
                            onClick={handleWithdraw}
                            disabled={withdrawing}
                            className="btn btn-danger w-full"
                        >
                            {withdrawing ? 'Withdrawing...' : 'Withdraw Application'}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export default function StudentApplications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        applicationAPI.getMy()
            .then(({ data }) => setApplications(data.applications))
            .catch(() => toast.error('Failed to load applications'))
            .finally(() => setLoading(false));
    }, []);

    const handleWithdraw = (id) => {
        setApplications((prev) =>
            prev.map((a) => a._id === id ? { ...a, status: 'withdrawn' } : a)
        );
    };

    const filtered = filter === 'all' ? applications
        : applications.filter((a) => a.status === filter);

    const filterOptions = [
        { value: 'all', label: `All (${applications.length})` },
        { value: 'pending', label: 'Pending' },
        { value: 'ai_analyzed', label: 'Analyzed' },
        { value: 'shortlisted', label: 'Shortlisted' },
        { value: 'allocated', label: 'Allocated' },
        { value: 'rejected', label: 'Rejected' },
    ];

    if (loading) return (
        <div className="flex items-center justify-center min-h-64">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="section-title">My Applications</h1>
                    <p className="section-subtitle">Track your internship applications and AI scores</p>
                </div>
            </div>

            {/* Filter tabs */}
            <div className="flex flex-wrap gap-2">
                {filterOptions.map(({ value, label }) => (
                    <button
                        key={value}
                        onClick={() => setFilter(value)}
                        className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all
              ${filter === value
                                ? 'bg-primary-600 text-white'
                                : 'bg-surface-700 text-slate-400 hover:text-white hover:bg-surface-600'
                            }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className="card p-12 text-center">
                    <ExclamationTriangleIcon className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <p className="text-xl font-medium text-white mb-2">No applications found</p>
                    <p className="text-slate-400">
                        {filter === 'all' ? "You haven't applied to any internships yet." : `No applications with status '${filter}'.`}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map((app) => (
                        <ApplicationCard key={app._id} application={app} onWithdraw={handleWithdraw} />
                    ))}
                </div>
            )}
        </div>
    );
}
