import { useEffect, useState } from 'react';
import { internshipAPI } from '@/services/api';
import {
    PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon,
    MapPinIcon, XMarkIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
    title: '', company: '', department: '', location: '', isRemote: false,
    description: '', duration: { value: 3, unit: 'months' },
    stipend: { amount: 0, currency: 'INR', isPaid: false },
    requiredSkills: '', preferredSkills: '', keywords: '',
    educationRequirements: { minDegree: 'Any', minCgpa: 0 },
    totalSeats: 1,
    applicationDeadline: '', startDate: '',
    status: 'open',
};

// ─── F moved OUTSIDE InternshipModal ─────────────────────────────────────────
// Defining it inside caused React to remount inputs on every keystroke (focus lost).
function F({ label, required, children }) {
    return (
        <div>
            <label className="label">
                {label}
                {required && <span className="text-red-400 ml-1">*</span>}
            </label>
            {children}
        </div>
    );
}

function InternshipModal({ internship, onClose, onSave }) {
    const [form, setForm] = useState(internship ? {
        ...internship,
        requiredSkills: internship.requiredSkills?.join(', ') || '',
        preferredSkills: internship.preferredSkills?.join(', ') || '',
        keywords: internship.keywords?.join(', ') || '',
        applicationDeadline: internship.applicationDeadline?.slice(0, 10) || '',
        startDate: internship.startDate?.slice(0, 10) || '',
    } : { ...EMPTY_FORM });
    const [saving, setSaving] = useState(false);

    const upd = (path, value) => {
        const keys = path.split('.');
        setForm((f) => {
            const updated = { ...f };
            if (keys.length === 2) {
                updated[keys[0]] = { ...updated[keys[0]], [keys[1]]: value };
            } else {
                updated[keys[0]] = value;
            }
            return updated;
        });
    };

    const handleSave = async () => {
        if (!form.title || !form.company || !form.location || !form.description) {
            toast.error('Please fill all required fields');
            return;
        }
        setSaving(true);
        try {
            const payload = {
                ...form,
                requiredSkills: form.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
                preferredSkills: form.preferredSkills.split(',').map(s => s.trim()).filter(Boolean),
                keywords: form.keywords.split(',').map(s => s.trim()).filter(Boolean),
            };
            let result;
            if (internship?._id) {
                result = await internshipAPI.update(internship._id, payload);
            } else {
                result = await internshipAPI.create(payload);
            }
            toast.success(`Internship ${internship ? 'updated' : 'created'} successfully`);
            onSave(result.data.internship);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-2xl bg-surface-800 rounded-2xl border border-surface-600 my-4 animate-slide-up">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-surface-700">
                    <h2 className="font-display font-bold text-white text-xl">
                        {internship ? 'Edit Internship' : 'Create Internship'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto no-scrollbar">
                    <div className="grid grid-cols-2 gap-4">
                        <F label="Job Title" required>
                            <input
                                className="input" value={form.title}
                                onChange={e => upd('title', e.target.value)}
                                placeholder="PM Intern"
                            />
                        </F>
                        <F label="Company" required>
                            <input
                                className="input" value={form.company}
                                onChange={e => upd('company', e.target.value)}
                                placeholder="Acme Corp"
                            />
                        </F>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <F label="Location" required>
                            <input
                                className="input" value={form.location}
                                onChange={e => upd('location', e.target.value)}
                                placeholder="Mumbai, India"
                            />
                        </F>
                        <F label="Department">
                            <input
                                className="input" value={form.department}
                                onChange={e => upd('department', e.target.value)}
                                placeholder="Product Management"
                            />
                        </F>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox" checked={form.isRemote}
                            onChange={e => upd('isRemote', e.target.checked)}
                            className="w-4 h-4 accent-primary-500"
                        />
                        <span className="text-slate-300 text-sm">Remote Position</span>
                    </label>

                    <F label="Description" required>
                        <textarea
                            className="input" rows={4} value={form.description}
                            onChange={e => upd('description', e.target.value)}
                            placeholder="Describe the role, responsibilities..."
                        />
                    </F>

                    <div className="grid grid-cols-2 gap-4">
                        <F label="Duration Value">
                            <input
                                type="number" className="input" value={form.duration.value} min={1}
                                onChange={e => upd('duration.value', parseInt(e.target.value))}
                            />
                        </F>
                        <F label="Duration Unit">
                            <select className="input" value={form.duration.unit} onChange={e => upd('duration.unit', e.target.value)}>
                                <option value="weeks">Weeks</option>
                                <option value="months">Months</option>
                            </select>
                        </F>
                    </div>

                    <div className="grid grid-cols-3 gap-4 items-end">
                        <label className="flex items-center gap-2 cursor-pointer pb-1">
                            <input
                                type="checkbox" checked={form.stipend.isPaid}
                                onChange={e => upd('stipend.isPaid', e.target.checked)}
                                className="accent-primary-500"
                            />
                            <span className="text-slate-300 text-sm">Paid Internship</span>
                        </label>
                        {form.stipend.isPaid && (
                            <div className="col-span-2">
                                <F label="Stipend / month (₹)">
                                    <input
                                        type="number" className="input" value={form.stipend.amount}
                                        onChange={e => upd('stipend.amount', parseInt(e.target.value))}
                                    />
                                </F>
                            </div>
                        )}
                    </div>

                    <F label="Required Skills (comma separated)" required>
                        <input
                            className="input" value={form.requiredSkills}
                            onChange={e => upd('requiredSkills', e.target.value)}
                            placeholder="Python, SQL, Agile, Jira"
                        />
                    </F>
                    <F label="Preferred Skills (comma separated)">
                        <input
                            className="input" value={form.preferredSkills}
                            onChange={e => upd('preferredSkills', e.target.value)}
                            placeholder="React, Tableau, Figma"
                        />
                    </F>
                    <F label="Keywords (comma separated)">
                        <input
                            className="input" value={form.keywords}
                            onChange={e => upd('keywords', e.target.value)}
                            placeholder="product management, roadmap, sprint"
                        />
                    </F>

                    <div className="grid grid-cols-2 gap-4">
                        <F label="Total Seats">
                            <input
                                type="number" className="input" min={1} value={form.totalSeats}
                                onChange={e => upd('totalSeats', parseInt(e.target.value))}
                            />
                        </F>
                        <F label="Status">
                            <select className="input" value={form.status} onChange={e => upd('status', e.target.value)}>
                                <option value="draft">Draft</option>
                                <option value="open">Open</option>
                                <option value="closed">Closed</option>
                            </select>
                        </F>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <F label="Application Deadline" required>
                            <input
                                type="date" className="input" value={form.applicationDeadline}
                                onChange={e => upd('applicationDeadline', e.target.value)}
                            />
                        </F>
                        <F label="Start Date" required>
                            <input
                                type="date" className="input" value={form.startDate}
                                onChange={e => upd('startDate', e.target.value)}
                            />
                        </F>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 px-6 py-4 border-t border-surface-700">
                    <button onClick={onClose} className="btn btn-ghost flex-1">Cancel</button>
                    <button onClick={handleSave} disabled={saving} className="btn btn-primary flex-1">
                        {saving ? 'Saving...' : internship ? 'Update Internship' : 'Create Internship'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function AdminInternships() {
    const [internships, setInternships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState(null);

    useEffect(() => {
        internshipAPI.getAll({}).then(({ data }) => setInternships(data.internships)).finally(() => setLoading(false));
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this internship and all its applications?')) return;
        try {
            await internshipAPI.delete(id);
            setInternships((prev) => prev.filter(i => i._id !== id));
            toast.success('Internship deleted');
        } catch {
            toast.error('Failed to delete');
        }
    };

    const handleSave = (internship) => {
        setInternships((prev) => {
            const exists = prev.find(i => i._id === internship._id);
            return exists ? prev.map(i => i._id === internship._id ? internship : i) : [internship, ...prev];
        });
        setModal(null);
    };

    const filtered = internships.filter(i =>
        i.title.toLowerCase().includes(search.toLowerCase()) ||
        i.company.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="section-title">Manage Internships</h1>
                    <p className="section-subtitle">Create and manage internship listings</p>
                </div>
                <button onClick={() => setModal('create')} className="btn btn-primary" id="create-internship">
                    <PlusIcon className="w-4 h-4" /> Create Internship
                </button>
            </div>

            <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="input pl-10 max-w-sm"
                    placeholder="Search by title or company..."
                />
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                {['Title', 'Company', 'Location', 'Seats', 'Deadline', 'Status', 'Actions'].map(h => (
                                    <th key={h} className="th">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-700">
                            {filtered.map((internship) => (
                                <tr key={internship._id} className="tr-hover">
                                    <td className="td">
                                        <p className="font-medium text-white">{internship.title}</p>
                                        <p className="text-xs text-slate-500">{internship.department}</p>
                                    </td>
                                    <td className="td">{internship.company}</td>
                                    <td className="td">
                                        <span className="flex items-center gap-1">
                                            <MapPinIcon className="w-3 h-3 text-slate-500" />
                                            {internship.location}
                                            {internship.isRemote && <span className="badge badge-blue ml-1 text-xs">Remote</span>}
                                        </span>
                                    </td>
                                    <td className="td">
                                        <span>{internship.filledSeats}/{internship.totalSeats}</span>
                                        <div className="w-16 score-bar mt-1">
                                            <div
                                                className="score-bar-fill bg-primary-500"
                                                style={{ width: `${(internship.filledSeats / internship.totalSeats) * 100}%` }}
                                            />
                                        </div>
                                    </td>
                                    <td className="td">{new Date(internship.applicationDeadline).toLocaleDateString()}</td>
                                    <td className="td">
                                        <span className={`badge ${internship.status === 'open' ? 'badge-green' :
                                                internship.status === 'draft' ? 'badge-yellow' : 'badge-gray'
                                            }`}>{internship.status}</span>
                                    </td>
                                    <td className="td">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setModal(internship)}
                                                className="text-slate-400 hover:text-white transition-colors"
                                                title="Edit"
                                            >
                                                <PencilIcon className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(internship._id)}
                                                className="text-slate-400 hover:text-red-400 transition-colors"
                                                title="Delete"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length === 0 && (
                        <div className="text-center py-12 text-slate-400">No internships found</div>
                    )}
                </div>
            )}

            {modal && (
                <InternshipModal
                    internship={modal === 'create' ? null : modal}
                    onClose={() => setModal(null)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
}
