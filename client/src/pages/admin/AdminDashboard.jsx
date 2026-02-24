import { useEffect, useState } from 'react';
import { adminAPI } from '@/services/api';
import {
    UsersIcon, BriefcaseIcon, DocumentTextIcon,
    CheckBadgeIcon, ArrowTrendingUpIcon, SparklesIcon,
} from '@heroicons/react/24/outline';
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, BarElement, ArcElement,
    LineElement, PointElement, Title, Tooltip, Legend,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Title, Tooltip, Legend);

const CHART_DEFAULTS = {
    responsive: true,
    plugins: { legend: { labels: { color: '#94a3b8', font: { size: 12 } } } },
    scales: {
        x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.04)' } },
        y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.04)' } },
    },
};

const STATUS_COLORS = {
    pending: '#f59e0b',
    under_review: '#3b82f6',
    ai_analyzed: '#8b5cf6',
    shortlisted: '#06b6d4',
    allocated: '#10b981',
    rejected: '#ef4444',
    withdrawn: '#64748b',
};

export default function AdminDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminAPI.getDashboard()
            .then(({ data }) => setData(data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-64">
            <div className="w-10 h-10 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const { stats, recentApplications, topScoringApplications, charts } = data;

    const kpiCards = [
        { label: 'Total Students', value: stats.totalStudents, icon: UsersIcon, color: 'text-blue-400', bg: 'bg-blue-500/10', change: '+12%' },
        { label: 'Internships', value: stats.totalInternships, icon: BriefcaseIcon, color: 'text-violet-400', bg: 'bg-violet-500/10', change: '+5%' },
        { label: 'Applications', value: stats.totalApplications, icon: DocumentTextIcon, color: 'text-amber-400', bg: 'bg-amber-500/10', change: '+23%' },
        { label: 'Allocated', value: stats.allocatedCount, icon: CheckBadgeIcon, color: 'text-emerald-400', bg: 'bg-emerald-500/10', change: `${stats.allocationRate}% rate` },
    ];

    // Application status doughnut
    const statusData = {
        labels: charts.applicationStatus.map(s => s._id?.replace('_', ' ')),
        datasets: [{
            data: charts.applicationStatus.map(s => s.count),
            backgroundColor: charts.applicationStatus.map(s => STATUS_COLORS[s._id] || '#64748b'),
            borderWidth: 0,
            hoverOffset: 4,
        }],
    };

    // Monthly trend line
    const MONTH_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trendData = {
        labels: charts.monthlyTrend.map(m => `${MONTH_NAMES[m._id.month]} ${m._id.year}`),
        datasets: [{
            label: 'Applications',
            data: charts.monthlyTrend.map(m => m.count),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59,130,246,0.1)',
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#3b82f6',
        }],
    };

    // Internship status bar
    const intStatusData = {
        labels: charts.internshipStatus.map(s => s._id),
        datasets: [{
            label: 'Count',
            data: charts.internshipStatus.map(s => s.count),
            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#64748b'],
            borderRadius: 6,
        }],
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="section-title">Admin Dashboard</h1>
                <p className="section-subtitle">Platform overview and allocation statistics</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {kpiCards.map(({ label, value, icon: Icon, color, bg, change }) => (
                    <div key={label} className="stat-card group">
                        <div className="flex items-center justify-between">
                            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                                <Icon className={`w-5 h-5 ${color}`} />
                            </div>
                            <span className="text-xs text-emerald-400 font-medium">{change}</span>
                        </div>
                        <div className="mt-3">
                            <p className="text-3xl font-display font-bold text-white">{value?.toLocaleString()}</p>
                            <p className="text-slate-400 text-sm">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Monthly Trend - spans 2 cols */}
                <div className="lg:col-span-2 card p-5">
                    <h3 className="font-semibold text-white mb-4">Application Trend (6 months)</h3>
                    <div className="h-48">
                        <Line data={trendData} options={{ ...CHART_DEFAULTS, maintainAspectRatio: false }} />
                    </div>
                </div>

                {/* Application Status Doughnut */}
                <div className="card p-5">
                    <h3 className="font-semibold text-white mb-4">Application Status</h3>
                    <div className="h-48 flex items-center justify-center">
                        <Doughnut
                            data={statusData}
                            options={{
                                responsive: true, maintainAspectRatio: false,
                                plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 10 }, padding: 8 } } },
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Tables Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Applications */}
                <div className="card p-5">
                    <h3 className="font-semibold text-white mb-4">Recent Applications</h3>
                    <div className="space-y-3">
                        {recentApplications.slice(0, 5).map((app) => (
                            <div key={app._id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface-700/50 transition-colors">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs font-bold text-white">{app.student?.firstName?.[0]}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{app.student?.firstName} {app.student?.lastName}</p>
                                    <p className="text-xs text-slate-400 truncate">{app.internship?.title}</p>
                                </div>
                                <span className={`badge text-xs ${app.status === 'allocated' ? 'badge-green' : app.status === 'pending' ? 'badge-yellow' : 'badge-blue'}`}>
                                    {app.status?.replace('_', ' ')}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Scoring Candidates */}
                <div className="card p-5">
                    <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                        <SparklesIcon className="w-4 h-4 text-amber-400" />
                        Top AI Scores
                    </h3>
                    <div className="space-y-3">
                        {topScoringApplications.slice(0, 5).map((app, i) => (
                            <div key={app._id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface-700/50 transition-colors">
                                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-surface-700 text-slate-300 flex-shrink-0">
                                    #{i + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{app.student?.firstName} {app.student?.lastName}</p>
                                    <p className="text-xs text-slate-400 truncate">{app.internship?.title}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <span className={`font-bold text-sm ${app.aiScore?.overall >= 80 ? 'text-emerald-400' : app.aiScore?.overall >= 60 ? 'text-blue-400' : 'text-amber-400'}`}>
                                        {app.aiScore?.overall}
                                    </span>
                                    <p className="text-xs text-slate-500">/100</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
