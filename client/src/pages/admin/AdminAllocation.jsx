import { useEffect, useState } from 'react';
import { adminAPI, internshipAPI } from '@/services/api';
import {
    CpuChipIcon, SparklesIcon, CheckCircleIcon,
    ExclamationTriangleIcon, ChartPieIcon, FunnelIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function AdminAllocation() {
    const [internships, setInternships] = useState([]);
    const [selectedInternship, setSelectedInternship] = useState('');
    const [report, setReport] = useState(null);
    const [allocating, setAllocating] = useState(false);
    const [scoring, setScoring] = useState(false);
    const [allocationResult, setAllocationResult] = useState(null);
    const [options, setOptions] = useState({ minScore: 40, forceAllocate: false });

    useEffect(() => {
        internshipAPI.getAll({}).then(({ data }) => setInternships(data.internships));
    }, []);

    const loadReport = async (internshipId) => {
        try {
            const { data } = await adminAPI.getAllocationReport(internshipId);
            setReport(data.report);
        } catch {
            setReport(null);
        }
    };

    const handleSelect = (id) => {
        setSelectedInternship(id);
        setAllocationResult(null);
        if (id) loadReport(id);
        else setReport(null);
    };

    const handleBatchScore = async () => {
        setScoring(true);
        try {
            const { data } = await adminAPI.triggerBatchScoring(selectedInternship);
            toast.success(`Scored ${data.result.scored} candidates`);
            await loadReport(selectedInternship);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Scoring failed');
        } finally {
            setScoring(false);
        }
    };

    const handleAllocate = async () => {
        if (!window.confirm(`Run smart allocation for this internship? This will allocate candidates automatically.`)) return;
        setAllocating(true);
        try {
            const { data } = await adminAPI.triggerAllocation(selectedInternship, {
                minScore: options.minScore,
                forceAllocate: options.forceAllocate,
            });
            setAllocationResult(data.result);
            await loadReport(selectedInternship);
            toast.success(`✅ Allocated ${data.result.allocated} candidates!`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Allocation failed');
        } finally {
            setAllocating(false);
        }
    };

    const selectedInternshipData = internships.find(i => i._id === selectedInternship);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="section-title flex items-center gap-2">
                    <CpuChipIcon className="w-6 h-6 text-accent-400" />
                    Smart Allocation Engine
                </h1>
                <p className="section-subtitle">Automatically rank and allocate candidates to internships using AI</p>
            </div>

            {/* Step 1: Select Internship */}
            <div className="card p-6">
                <h2 className="font-semibold text-white mb-1 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center font-bold">1</span>
                    Select Target Internship
                </h2>
                <p className="text-slate-400 text-sm mb-4">Choose which internship to run the allocation engine on</p>
                <select
                    value={selectedInternship}
                    onChange={(e) => handleSelect(e.target.value)}
                    className="input max-w-md"
                    id="allocation-internship-select"
                >
                    <option value="">Select an internship...</option>
                    {internships.map(i => (
                        <option key={i._id} value={i._id}>{i.title} — {i.company} ({i.totalSeats - i.filledSeats} seats left)</option>
                    ))}
                </select>

                {selectedInternshipData && (
                    <div className="mt-4 grid grid-cols-4 gap-3">
                        {[
                            { label: 'Total Seats', value: selectedInternshipData.totalSeats },
                            { label: 'Filled', value: selectedInternshipData.filledSeats },
                            { label: 'Available', value: selectedInternshipData.totalSeats - selectedInternshipData.filledSeats },
                            { label: 'Status', value: selectedInternshipData.status },
                        ].map(({ label, value }) => (
                            <div key={label} className="bg-surface-700 rounded-xl p-3 text-center">
                                <p className="text-lg font-bold text-white">{value}</p>
                                <p className="text-xs text-slate-400">{label}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedInternship && (
                <>
                    {/* Report */}
                    {report && (
                        <div className="card p-6">
                            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                                <ChartPieIcon className="w-5 h-5 text-accent-400" />
                                Current Status Report
                            </h2>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                {Object.entries(report.applicationStatus || {}).map(([status, count]) => (
                                    <div key={status} className={`rounded-xl p-3 text-center border ${status === 'allocated' ? 'bg-emerald-500/10 border-emerald-500/20' :
                                            status === 'ai_analyzed' ? 'bg-violet-500/10 border-violet-500/20' :
                                                status === 'pending' ? 'bg-amber-500/10 border-amber-500/20' :
                                                    'bg-surface-700 border-surface-600'
                                        }`}>
                                        <p className="text-xl font-bold text-white">{count}</p>
                                        <p className="text-xs text-slate-400 capitalize">{status.replace('_', ' ')}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-3 flex items-center justify-between text-sm">
                                <span className="text-slate-400">Allocation Rate</span>
                                <span className="font-bold text-emerald-400">{report.allocationRate}%</span>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Score */}
                    <div className="card p-6">
                        <h2 className="font-semibold text-white mb-1 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center font-bold">2</span>
                            Run AI Scoring
                        </h2>
                        <p className="text-slate-400 text-sm mb-4">
                            Analyze all pending applications using AI. This evaluates skills, experience, education, projects, and keyword relevance.
                        </p>
                        <button
                            onClick={handleBatchScore}
                            disabled={scoring}
                            className="btn btn-primary"
                            id="start-batch-scoring"
                        >
                            <SparklesIcon className="w-4 h-4" />
                            {scoring ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Running AI Analysis...
                                </span>
                            ) : 'Start AI Scoring'}
                        </button>
                    </div>

                    {/* Step 3: Allocate */}
                    <div className="card p-6">
                        <h2 className="font-semibold text-white mb-1 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-accent-500 text-white text-xs flex items-center justify-center font-bold">3</span>
                            Run Smart Allocation
                        </h2>
                        <p className="text-slate-400 text-sm mb-4">
                            Automatically allocate top-ranked candidates based on AI scores. Only scored candidates are eligible.
                        </p>

                        {/* Options */}
                        <div className="grid grid-cols-2 gap-4 mb-4 max-w-sm">
                            <div>
                                <label className="label">Minimum Score</label>
                                <select
                                    value={options.minScore}
                                    onChange={(e) => setOptions({ ...options, minScore: parseInt(e.target.value) })}
                                    className="input"
                                >
                                    <option value={0}>Any score</option>
                                    <option value={40}>40+ (Average)</option>
                                    <option value={60}>60+ (Good)</option>
                                    <option value={80}>80+ (Excellent)</option>
                                </select>
                            </div>
                            <div className="flex items-end">
                                <label className="flex items-center gap-2 cursor-pointer pb-3">
                                    <input
                                        type="checkbox"
                                        checked={options.forceAllocate}
                                        onChange={(e) => setOptions({ ...options, forceAllocate: e.target.checked })}
                                        className="accent-accent-500 w-4 h-4"
                                    />
                                    <span className="text-slate-300 text-sm">Fill all seats, regardless of score</span>
                                </label>
                            </div>
                        </div>

                        <button
                            onClick={handleAllocate}
                            disabled={allocating}
                            className="btn btn-accent"
                            id="run-allocation"
                        >
                            <CpuChipIcon className="w-4 h-4" />
                            {allocating ? 'Allocating...' : 'Run Smart Allocation'}
                        </button>

                        {/* Warning */}
                        <div className="mt-4 flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                            <ExclamationTriangleIcon className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                            <p className="text-amber-300 text-xs">
                                This action is irreversible. Allocated candidates will be notified and unselected candidates will be marked as rejected.
                            </p>
                        </div>
                    </div>

                    {/* Allocation Result */}
                    {allocationResult && (
                        <div className="card p-6 border-emerald-500/30 bg-emerald-500/5 animate-slide-up">
                            <h3 className="font-semibold text-emerald-400 mb-4 flex items-center gap-2">
                                <CheckCircleIcon className="w-5 h-5" />
                                Allocation Complete!
                            </h3>
                            <div className="grid grid-cols-3 gap-3 mb-4">
                                <div className="text-center"><p className="text-2xl font-bold text-white">{allocationResult.allocated}</p><p className="text-xs text-slate-400">Allocated</p></div>
                                <div className="text-center"><p className="text-2xl font-bold text-white">{allocationResult.remainingSeats}</p><p className="text-xs text-slate-400">Seats Left</p></div>
                                <div className="text-center"><p className="text-sm text-slate-300">{new Date(allocationResult.allocationDate).toLocaleDateString()}</p><p className="text-xs text-slate-400">Date</p></div>
                            </div>
                            {allocationResult.candidates?.length > 0 && (
                                <div className="space-y-2">
                                    {allocationResult.candidates.map((c, i) => (
                                        <div key={c.applicationId} className="flex items-center justify-between p-2.5 bg-surface-700 rounded-xl">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-slate-500">#{c.rank}</span>
                                                <span className="text-sm text-white">{c.student?.firstName} {c.student?.lastName}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`badge text-xs ${c.score >= 80 ? 'badge-green' : c.score >= 60 ? 'badge-blue' : 'badge-yellow'}`}>
                                                    {c.score}/100
                                                </span>
                                                <span className="badge badge-green text-xs">Allocated ✓</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
