import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { userAPI } from '@/services/api';
import CVUpload from '@/components/student/CVUpload';
import ScoreCard from '@/components/ui/ScoreCard';
import { ScoreBreakdown } from '@/components/ui/ScoreCard';
import { PencilIcon, CheckIcon, XMarkIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function StudentProfile() {
    const { user, updateUser } = useAuthStore();
    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({});
    const [showCVUpload, setShowCVUpload] = useState(false);

    useEffect(() => {
        userAPI.getProfile().then(({ data }) => {
            setAiAnalysis(data.aiAnalysis);
            setForm({
                firstName: data.user.firstName,
                lastName: data.user.lastName,
                phone: data.user.phone || '',
                bio: data.user.bio || '',
                university: data.user.university || '',
                degree: data.user.degree || '',
                major: data.user.major || '',
                graduationYear: data.user.graduationYear || '',
                cgpa: data.user.cgpa || '',
            });
        }).finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const { data } = await userAPI.updateProfile(form);
            updateUser(data.user);
            setEditing(false);
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-64">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const allSkills = [
        ...(aiAnalysis?.extractedData?.technicalSkills || []),
        ...(aiAnalysis?.extractedData?.softSkills || []),
        ...(aiAnalysis?.extractedData?.tools || []),
    ];

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="section-title">My Profile</h1>
                    <p className="section-subtitle">Manage your personal and academic information</p>
                </div>
                {!editing ? (
                    <button onClick={() => setEditing(true)} className="btn btn-ghost">
                        <PencilIcon className="w-4 h-4" /> Edit
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button onClick={() => setEditing(false)} className="btn btn-ghost">
                            <XMarkIcon className="w-4 h-4" /> Cancel
                        </button>
                        <button onClick={handleSave} disabled={saving} className="btn btn-primary">
                            <CheckIcon className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="card p-6">
                        <h2 className="font-semibold text-white mb-5">Personal Information</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'First Name', key: 'firstName' },
                                { label: 'Last Name', key: 'lastName' },
                            ].map(({ label, key }) => (
                                <div key={key}>
                                    <label className="label">{label}</label>
                                    {editing ? (
                                        <input className="input" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
                                    ) : (
                                        <p className="text-white font-medium">{form[key] || '—'}</p>
                                    )}
                                </div>
                            ))}
                            <div className="col-span-2">
                                <label className="label">Email</label>
                                <p className="text-slate-400">{user?.email} <span className="badge badge-blue ml-2">Verified</span></p>
                            </div>
                            <div>
                                <label className="label">Phone</label>
                                {editing ? (
                                    <input className="input" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                                ) : (
                                    <p className="text-white">{form.phone || '—'}</p>
                                )}
                            </div>
                        </div>
                        {editing && (
                            <div className="mt-4">
                                <label className="label">Bio</label>
                                <textarea
                                    className="input"
                                    rows={3}
                                    placeholder="Write a short bio about yourself..."
                                    value={form.bio}
                                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                                />
                            </div>
                        )}
                        {!editing && form.bio && (
                            <div className="mt-4">
                                <label className="label">Bio</label>
                                <p className="text-slate-300 text-sm leading-relaxed">{form.bio}</p>
                            </div>
                        )}
                    </div>

                    <div className="card p-6">
                        <h2 className="font-semibold text-white mb-5">Academic Information</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'University', key: 'university', span: 'col-span-2', placeholder: 'e.g. IIT Bombay' },
                                { label: 'Degree', key: 'degree', placeholder: 'B.Tech / MBA' },
                                { label: 'Major', key: 'major', placeholder: 'Computer Science' },
                                { label: 'Graduation Year', key: 'graduationYear', type: 'number', placeholder: '2025' },
                                { label: 'CGPA', key: 'cgpa', type: 'number', placeholder: '8.5' },
                            ].map(({ label, key, span, type, placeholder }) => (
                                <div key={key} className={span || ''}>
                                    <label className="label">{label}</label>
                                    {editing ? (
                                        <input type={type || 'text'} className="input" placeholder={placeholder} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
                                    ) : (
                                        <p className="text-white">{form[key] || '—'}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CV Upload Section */}
                    <div className="card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-white">Resume / CV</h2>
                            {user?.cv?.filename && (
                                <span className="badge badge-green">Uploaded ✓</span>
                            )}
                        </div>
                        {user?.cv?.filename && !showCVUpload && (
                            <div className="flex items-center justify-between p-3 bg-surface-700 rounded-xl border border-surface-600">
                                <div>
                                    <p className="text-white text-sm font-medium">{user.cv.originalName}</p>
                                    <p className="text-slate-400 text-xs">Uploaded {new Date(user.cv.uploadedAt).toLocaleDateString()}</p>
                                </div>
                                <button
                                    onClick={() => setShowCVUpload(true)}
                                    className="btn btn-ghost btn-sm"
                                >
                                    <DocumentArrowUpIcon className="w-4 h-4" />
                                    Replace
                                </button>
                            </div>
                        )}
                        {(!user?.cv?.filename || showCVUpload) && (
                            <CVUpload onSuccess={(data) => {
                                setAiAnalysis(data.aiAnalysis);
                                setShowCVUpload(false);
                                updateUser({ cv: data.user?.cv });
                            }} />
                        )}
                    </div>
                </div>

                {/* AI Analysis Sidebar */}
                <div className="space-y-4">
                    {aiAnalysis ? (
                        <>
                            {/* CV Quality */}
                            <div className="card p-4">
                                <h3 className="font-medium text-white text-sm mb-3">CV Quality</h3>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-slate-400 text-xs">Overall Score</span>
                                    <span className={`font-bold text-sm ${aiAnalysis.cvQualityScore >= 70 ? 'text-emerald-400' : aiAnalysis.cvQualityScore >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
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

                            {/* Career Level & Experience */}
                            <div className="card p-4 space-y-3">
                                <h3 className="font-medium text-white text-sm">Professional Profile</h3>
                                <div className="flex justify-between"><span className="text-slate-400 text-xs">Career Level</span><span className="text-white text-xs font-medium">{aiAnalysis.extractedData?.careerLevel || '—'}</span></div>
                                <div className="flex justify-between"><span className="text-slate-400 text-xs">Experience</span><span className="text-white text-xs font-medium">{aiAnalysis.extractedData?.totalExperienceYears || 0} years</span></div>
                                <div className="flex justify-between"><span className="text-slate-400 text-xs">Projects</span><span className="text-white text-xs font-medium">{aiAnalysis.extractedData?.projects?.length || 0}</span></div>
                                <div className="flex justify-between"><span className="text-slate-400 text-xs">Certifications</span><span className="text-white text-xs font-medium">{aiAnalysis.extractedData?.certifications?.length || 0}</span></div>
                            </div>

                            {/* All Skills */}
                            {allSkills.length > 0 && (
                                <div className="card p-4">
                                    <h3 className="font-medium text-white text-sm mb-3">All Skills ({allSkills.length})</h3>
                                    <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto no-scrollbar">
                                        {allSkills.map((skill) => (
                                            <span key={skill} className="badge badge-blue text-xs">{skill}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Improvement Tips */}
                            {aiAnalysis.cvFeedback?.length > 0 && (
                                <div className="card p-4">
                                    <h3 className="font-medium text-white text-sm mb-3">💡 Tips to Improve</h3>
                                    <ul className="space-y-2">
                                        {aiAnalysis.cvFeedback.map((tip, i) => (
                                            <li key={i} className="text-xs text-slate-400 flex gap-2">
                                                <span className="text-amber-400">•</span>{tip}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="card p-6 text-center">
                            <p className="text-slate-400 text-sm">Upload your CV to see AI analysis here</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
