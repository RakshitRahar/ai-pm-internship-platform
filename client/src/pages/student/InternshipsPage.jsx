import { useEffect, useState } from 'react';
import { internshipAPI, applicationAPI } from '@/services/api';
import {
    MagnifyingGlassIcon, MapPinIcon, CalendarIcon,
    CurrencyRupeeIcon, ClockIcon, BriefcaseIcon,
    SparklesIcon, XMarkIcon, CheckCircleIcon,
    AcademicCapIcon, StarIcon, BuildingOfficeIcon,
    ChevronRightIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

// ─── Detail Modal ──────────────────────────────────────────────────────────────
function InternshipDetailModal({ internship, matchScore, onClose, onApply }) {
    const [applying, setApplying] = useState(false);
    const [applied, setApplied] = useState(false);

    if (!internship) return null;

    const handleApply = async () => {
        setApplying(true);
        try {
            await applicationAPI.submit({ internshipId: internship._id });
            toast.success('Application submitted successfully! 🎉');
            setApplied(true);
            if (onApply) onApply(internship._id);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to apply');
        } finally {
            setApplying(false);
        }
    };

    const seatsLeft = internship.availableSeats ?? (internship.totalSeats - internship.filledSeats);
    const seatsPercent = Math.round((internship.filledSeats / internship.totalSeats) * 100);

    return (
        /* Backdrop */
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
        >
            {/* Modal Panel */}
            <div
                className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-surface-600 shadow-2xl"
                style={{ background: 'var(--color-surface-800, #1e293b)' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-start justify-between p-6 border-b border-surface-700"
                    style={{ background: 'var(--color-surface-800, #1e293b)' }}>
                    <div className="flex-1 pr-4">
                        {matchScore !== undefined && (
                            <div className={`
                                inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mb-2 border
                                ${matchScore >= 70 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                                    matchScore >= 50 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                                        'bg-slate-500/20 text-slate-400 border-slate-500/30'}
                            `}>
                                <SparklesIcon className="w-3 h-3" />
                                {matchScore}% AI Match
                            </div>
                        )}
                        <h2 className="text-xl font-bold text-white leading-tight">{internship.title}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <BuildingOfficeIcon className="w-4 h-4 text-primary-400" />
                            <span className="text-primary-400 font-semibold">{internship.company}</span>
                            {internship.department && (
                                <span className="text-slate-500 text-sm">• {internship.department}</span>
                            )}
                        </div>
                    </div>
                    <button
                        id="close-detail-modal"
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-surface-700 text-slate-400 hover:text-white transition-colors flex-shrink-0"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">

                    {/* Quick Stats Row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="rounded-xl p-3 border border-surface-600 text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                            <MapPinIcon className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                            <p className="text-xs text-slate-400">Location</p>
                            <p className="text-sm font-semibold text-white truncate">{internship.location}</p>
                            {internship.isRemote && <span className="text-xs text-emerald-400">(Remote)</span>}
                        </div>
                        <div className="rounded-xl p-3 border border-surface-600 text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                            <ClockIcon className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                            <p className="text-xs text-slate-400">Duration</p>
                            <p className="text-sm font-semibold text-white">{internship.duration?.value} {internship.duration?.unit}</p>
                        </div>
                        <div className="rounded-xl p-3 border border-surface-600 text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                            <CurrencyRupeeIcon className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                            <p className="text-xs text-slate-400">Stipend</p>
                            <p className="text-sm font-semibold text-emerald-400">
                                {internship.stipend?.isPaid
                                    ? `₹${internship.stipend.amount.toLocaleString()}/mo`
                                    : 'Unpaid'}
                            </p>
                        </div>
                        <div className="rounded-xl p-3 border border-surface-600 text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                            <CalendarIcon className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                            <p className="text-xs text-slate-400">Deadline</p>
                            <p className="text-sm font-semibold text-white">
                                {new Date(internship.applicationDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                        </div>
                    </div>

                    {/* Seats Progress */}
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-400 flex items-center gap-1">
                                <BriefcaseIcon className="w-3.5 h-3.5" />
                                Seats Available
                            </span>
                            <span className={`font-semibold ${seatsLeft <= 5 ? 'text-red-400' : 'text-emerald-400'}`}>
                                {seatsLeft} / {internship.totalSeats} left
                            </span>
                        </div>
                        <div className="h-2 rounded-full bg-surface-700 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-400 transition-all"
                                style={{ width: `${seatsPercent}%` }}
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <h3 className="text-sm font-semibold text-white mb-2 uppercase tracking-wider">About this Internship</h3>
                        <p className="text-slate-300 text-sm leading-relaxed">{internship.description}</p>
                    </div>

                    {/* Responsibilities */}
                    {internship.responsibilities?.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-white mb-2 uppercase tracking-wider">What You'll Do</h3>
                            <ul className="space-y-2">
                                {internship.responsibilities.map((r, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                                        <ChevronRightIcon className="w-4 h-4 text-primary-400 mt-0.5 flex-shrink-0" />
                                        {r}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Required Skills */}
                    {internship.requiredSkills?.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-white mb-2 uppercase tracking-wider">Required Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {internship.requiredSkills.map((skill) => (
                                    <span key={skill} className="badge badge-blue">{skill}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Preferred Skills */}
                    {internship.preferredSkills?.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-white mb-2 uppercase tracking-wider">Preferred Skills <span className="text-slate-500 normal-case font-normal">(Good to have)</span></h3>
                            <div className="flex flex-wrap gap-2">
                                {internship.preferredSkills.map((skill) => (
                                    <span key={skill} className="badge badge-gray">{skill}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Education Requirements */}
                    {internship.educationRequirements && (
                        <div>
                            <h3 className="text-sm font-semibold text-white mb-2 uppercase tracking-wider">Education Requirements</h3>
                            <div className="rounded-xl p-4 border border-surface-600 space-y-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400 flex items-center gap-1.5">
                                        <AcademicCapIcon className="w-4 h-4" />
                                        Minimum Degree
                                    </span>
                                    <span className="text-white font-medium">{internship.educationRequirements.minDegree}</span>
                                </div>
                                {internship.educationRequirements.minCgpa > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400 flex items-center gap-1.5">
                                            <StarIcon className="w-4 h-4" />
                                            Minimum CGPA
                                        </span>
                                        <span className="text-white font-medium">{internship.educationRequirements.minCgpa} / 10</span>
                                    </div>
                                )}
                                {internship.educationRequirements.preferredMajors?.length > 0 && (
                                    <div className="text-sm">
                                        <span className="text-slate-400">Preferred Majors:</span>
                                        <p className="text-white mt-1">{internship.educationRequirements.preferredMajors.join(' • ')}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tags */}
                    {internship.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {internship.tags.map((tag) => (
                                <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-surface-700 text-slate-400 border border-surface-600">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer — Apply Button */}
                <div className="sticky bottom-0 p-5 border-t border-surface-700 flex gap-3"
                    style={{ background: 'var(--color-surface-800, #1e293b)' }}>
                    <button
                        onClick={onClose}
                        className="btn btn-ghost flex-1"
                    >
                        Close
                    </button>
                    <button
                        id={`modal-apply-${internship._id}`}
                        onClick={handleApply}
                        disabled={applying || applied}
                        className={`flex-1 flex items-center justify-center gap-2 ${applied ? 'btn btn-ghost' : 'btn btn-primary'}`}
                    >
                        {applied
                            ? <><CheckCircleIcon className="w-4 h-4 text-emerald-400" /> Applied!</>
                            : applying
                                ? 'Submitting...'
                                : '🚀 Apply Now'
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Internship Card ───────────────────────────────────────────────────────────
function InternshipCard({ internship, matchScore, onApply, onViewDetails }) {
    const [applying, setApplying] = useState(false);
    const [applied, setApplied] = useState(false);

    const handleApply = async (e) => {
        e.stopPropagation();
        setApplying(true);
        try {
            await applicationAPI.submit({ internshipId: internship._id });
            toast.success('Application submitted successfully! 🎉');
            setApplied(true);
            if (onApply) onApply(internship._id);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to apply');
        } finally {
            setApplying(false);
        }
    };

    return (
        <div
            className="card p-5 hover:border-primary-500/40 transition-all duration-300 group cursor-pointer flex flex-col"
            onClick={() => onViewDetails(internship, matchScore)}
        >
            {matchScore !== undefined && (
                <div className={`
                    inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mb-3 border w-fit
                    ${matchScore >= 70 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                        matchScore >= 50 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                            'bg-slate-500/20 text-slate-400 border-slate-500/30'}
                `}>
                    <SparklesIcon className="w-3 h-3" />
                    {matchScore}% match
                </div>
            )}

            <h3 className="font-display font-semibold text-white text-base group-hover:text-primary-400 transition-colors leading-tight">
                {internship.title}
            </h3>
            <p className="text-slate-400 font-medium mt-0.5 text-sm">{internship.company}</p>

            <div className="flex flex-wrap gap-2 mt-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                    <MapPinIcon className="w-3.5 h-3.5" />
                    {internship.location} {internship.isRemote && '(Remote)'}
                </span>
                <span className="flex items-center gap-1">
                    <ClockIcon className="w-3.5 h-3.5" />
                    {internship.duration?.value} {internship.duration?.unit}
                </span>
                {internship.stipend?.isPaid && (
                    <span className="flex items-center gap-1 text-emerald-400">
                        <CurrencyRupeeIcon className="w-3.5 h-3.5" />
                        {internship.stipend.amount.toLocaleString()}/month
                    </span>
                )}
            </div>

            <p className="text-slate-400 text-xs mt-2 line-clamp-2 flex-1">{internship.description}</p>

            {internship.requiredSkills?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                    {internship.requiredSkills.slice(0, 4).map((skill) => (
                        <span key={skill} className="badge badge-blue text-xs">{skill}</span>
                    ))}
                    {internship.requiredSkills.length > 4 && (
                        <span className="badge badge-gray text-xs">+{internship.requiredSkills.length - 4} more</span>
                    )}
                </div>
            )}

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-surface-700">
                <div className="flex items-center gap-1 text-xs text-slate-500">
                    <BriefcaseIcon className="w-3.5 h-3.5" />
                    {internship.availableSeats ?? internship.totalSeats - internship.filledSeats} seats left
                </div>
                <div className="flex gap-2">
                    {/* View Details button */}
                    <button
                        id={`view-${internship._id}`}
                        onClick={(e) => { e.stopPropagation(); onViewDetails(internship, matchScore); }}
                        className="btn btn-ghost btn-sm text-xs"
                    >
                        View Details
                    </button>
                    {/* Quick Apply button */}
                    <button
                        id={`apply-${internship._id}`}
                        onClick={handleApply}
                        disabled={applying || applied}
                        className={applied ? 'btn btn-ghost btn-sm text-xs' : 'btn btn-primary btn-sm text-xs'}
                    >
                        {applying ? '...' : applied ? '✓ Applied' : 'Apply'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function InternshipsPage() {
    const { user } = useAuthStore();
    const [internships, setInternships] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({ isRemote: '', skills: '' });
    const [tab, setTab] = useState('all'); // 'all' | 'recommended'

    // Detail modal state
    const [selectedInternship, setSelectedInternship] = useState(null);
    const [selectedMatchScore, setSelectedMatchScore] = useState(undefined);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [intRes, recoRes] = await Promise.allSettled([
                    internshipAPI.getAll({ status: 'open', search: search || undefined, isRemote: filters.isRemote || undefined }),
                    applicationAPI.getRecommendations(),
                ]);
                if (intRes.status === 'fulfilled') setInternships(intRes.value.data.internships);
                if (recoRes.status === 'fulfilled') setRecommendations(recoRes.value.data.recommendations || []);
            } finally {
                setLoading(false);
            }
        };
        const debounce = setTimeout(fetchData, 400);
        return () => clearTimeout(debounce);
    }, [search, filters]);

    const displayList = tab === 'recommended'
        ? recommendations
        : internships.map((i) => ({ internship: i }));

    const handleViewDetails = (internship, matchScore) => {
        setSelectedInternship(internship);
        setSelectedMatchScore(matchScore);
    };

    const handleCloseModal = () => {
        setSelectedInternship(null);
        setSelectedMatchScore(undefined);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="section-title">Browse Internships</h1>
                <p className="section-subtitle">Find and apply to PM internship opportunities matching your skills</p>
            </div>

            {/* Search & Filter bar */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by title, company, or skill..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input pl-10"
                        id="internship-search"
                    />
                </div>
                <select
                    value={filters.isRemote}
                    onChange={(e) => setFilters({ ...filters, isRemote: e.target.value })}
                    className="input w-auto"
                >
                    <option value="">All Locations</option>
                    <option value="true">Remote Only</option>
                    <option value="false">On-Site Only</option>
                </select>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                {[
                    { key: 'all', label: `All (${internships.length})` },
                    { key: 'recommended', label: `⚡ Recommended (${recommendations.length})` },
                ].map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => setTab(key)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all
                            ${tab === key ? 'bg-primary-600 text-white' : 'bg-surface-700 text-slate-400 hover:text-white'}`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="card p-5 animate-pulse">
                            <div className="h-5 bg-surface-700 rounded w-3/4 mb-3" />
                            <div className="h-4 bg-surface-700 rounded w-1/2 mb-4" />
                            <div className="h-3 bg-surface-700 rounded w-full mb-2" />
                            <div className="h-3 bg-surface-700 rounded w-2/3" />
                        </div>
                    ))}
                </div>
            ) : displayList.length === 0 ? (
                <div className="card p-12 text-center">
                    <BriefcaseIcon className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <p className="text-xl font-medium text-white mb-2">No internships found</p>
                    <p className="text-slate-400">Try adjusting your search filters</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {displayList.map(({ internship, matchScore }) => (
                        <InternshipCard
                            key={internship._id}
                            internship={internship}
                            matchScore={matchScore}
                            onViewDetails={handleViewDetails}
                        />
                    ))}
                </div>
            )}

            {/* Detail Modal */}
            {selectedInternship && (
                <InternshipDetailModal
                    internship={selectedInternship}
                    matchScore={selectedMatchScore}
                    onClose={handleCloseModal}
                    onApply={() => { }}
                />
            )}
        </div>
    );
}
