import { useState, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
// eslint-disable-next-line import/no-extraneous-dependencies
import html2pdf from 'html2pdf.js';
import {
    UserIcon, AcademicCapIcon, BriefcaseIcon, CodeBracketIcon,
    DocumentTextIcon, TrophyIcon, CheckCircleIcon, ArrowLeftIcon,
    ArrowRightIcon, SparklesIcon, CreditCardIcon, LockClosedIcon,
    PlusIcon, TrashIcon, ArrowDownTrayIcon, EyeIcon, XMarkIcon,
} from '@heroicons/react/24/outline';

// ─── Step Config ──────────────────────────────────────────────────────────────
const STEPS = [
    { id: 1, label: 'Personal Info', icon: UserIcon, subtitle: 'Your contact & identity details' },
    { id: 2, label: 'Education', icon: AcademicCapIcon, subtitle: 'Degrees & academic history' },
    { id: 3, label: 'Experience', icon: BriefcaseIcon, subtitle: 'Work & internship experience' },
    { id: 4, label: 'Projects', icon: CodeBracketIcon, subtitle: 'Side projects & portfolio work' },
    { id: 5, label: 'Skills & More', icon: TrophyIcon, subtitle: 'Skills, certifications & languages' },
    { id: 6, label: 'Payment & Get CV', icon: CreditCardIcon, subtitle: 'Pay ₹19 or ₹29 & download' },
];

const PLANS = [
    {
        id: 'basic',
        price: 19,
        label: '₹19 Basic',
        color: 'from-blue-500 to-cyan-500',
        border: 'border-blue-500/40',
        badge: null,
        features: ['Professional CV PDF', 'Clean Modern Template', 'Instant Download', 'AI Skill Detection'],
    },
    {
        id: 'premium',
        price: 29,
        label: '₹29 Premium',
        color: 'from-violet-500 to-pink-500',
        border: 'border-violet-500/40',
        badge: 'Most Popular',
        features: ['Everything in Basic', 'Premium Design Template', 'Color Accent Themes', 'LinkedIn Summary Section', 'Priority AI Analysis'],
    },
];

// ─── Empty state factories ─────────────────────────────────────────────────────
const emptyEdu = () => ({ institution: '', degree: '', field: '', cgpa: '', startYear: '', endYear: '', achievements: '' });
const emptyExp = () => ({ company: '', position: '', duration: '', startDate: '', endDate: '', isInternship: false, description: '' });
const emptyProj = () => ({ name: '', description: '', technologies: '', link: '', impact: '' });
const emptyCert = () => ({ name: '', issuer: '', year: '' });

// ─── Input Components ─────────────────────────────────────────────────────────
const Field = ({ label, required, children }) => (
    <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-300">
            {label}{required && <span className="text-red-400 ml-1">*</span>}
        </label>
        {children}
    </div>
);

const Input = ({ className = '', ...props }) => (
    <input
        className={`w-full px-3 py-2.5 bg-surface-700 border border-surface-600 rounded-xl text-white text-sm placeholder-slate-500
      focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all ${className}`}
        {...props}
    />
);

const Textarea = ({ className = '', ...props }) => (
    <textarea
        rows={3}
        className={`w-full px-3 py-2.5 bg-surface-700 border border-surface-600 rounded-xl text-white text-sm placeholder-slate-500
      focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all resize-none ${className}`}
        {...props}
    />
);

// ─── STEP 1: Personal Info ────────────────────────────────────────────────────
function Step1({ data, setData }) {
    const u = data;
    const set = (k, v) => setData(d => ({ ...d, [k]: v }));
    return (
        <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="First Name" required>
                    <Input value={u.firstName} onChange={e => set('firstName', e.target.value)} placeholder="Rahul" />
                </Field>
                <Field label="Last Name" required>
                    <Input value={u.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Sharma" />
                </Field>
            </div>
            <Field label="Professional Headline" required>
                <Input value={u.headline} onChange={e => set('headline', e.target.value)} placeholder="e.g. Computer Science Student | Aspiring Product Manager" />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Email Address" required>
                    <Input type="email" value={u.email} onChange={e => set('email', e.target.value)} placeholder="rahul@gmail.com" />
                </Field>
                <Field label="Phone Number" required>
                    <Input value={u.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 9876543210" />
                </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="City / Location">
                    <Input value={u.location} onChange={e => set('location', e.target.value)} placeholder="New Delhi, India" />
                </Field>
                <Field label="LinkedIn Profile URL">
                    <Input value={u.linkedin} onChange={e => set('linkedin', e.target.value)} placeholder="linkedin.com/in/rahulsharma" />
                </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="GitHub Profile URL">
                    <Input value={u.github} onChange={e => set('github', e.target.value)} placeholder="github.com/rahulsharma" />
                </Field>
                <Field label="Portfolio / Website">
                    <Input value={u.portfolio} onChange={e => set('portfolio', e.target.value)} placeholder="rahulsharma.dev" />
                </Field>
            </div>
            <Field label="Career Objective / Summary">
                <Textarea value={u.summary} onChange={e => set('summary', e.target.value)}
                    rows={4}
                    placeholder="Write 2-3 sentences about yourself, your goals, and what makes you a strong candidate for PM internships..." />
            </Field>
        </div>
    );
}

// ─── STEP 2: Education ────────────────────────────────────────────────────────
function Step2({ data, setData }) {
    const addEdu = () => setData(d => ({ ...d, education: [...d.education, emptyEdu()] }));
    const removeEdu = i => setData(d => ({ ...d, education: d.education.filter((_, idx) => idx !== i) }));
    const setEdu = (i, k, v) => setData(d => {
        const edu = [...d.education];
        edu[i] = { ...edu[i], [k]: v };
        return { ...d, education: edu };
    });
    return (
        <div className="space-y-6">
            {data.education.map((edu, i) => (
                <div key={i} className="card p-5 space-y-4 border-surface-600">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                            <AcademicCapIcon className="w-4 h-4 text-primary-400" />
                            Education #{i + 1}
                        </h4>
                        {i > 0 && (
                            <button onClick={() => removeEdu(i)} className="text-red-400 hover:text-red-300 transition-colors">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <Field label="Institution / University" required>
                        <Input value={edu.institution} onChange={e => setEdu(i, 'institution', e.target.value)} placeholder="Delhi Technological University" />
                    </Field>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Degree" required>
                            <Input value={edu.degree} onChange={e => setEdu(i, 'degree', e.target.value)} placeholder="B.Tech / B.Sc / MBA..." />
                        </Field>
                        <Field label="Field of Study">
                            <Input value={edu.field} onChange={e => setEdu(i, 'field', e.target.value)} placeholder="Computer Science" />
                        </Field>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <Field label="Start Year">
                            <Input type="number" value={edu.startYear} onChange={e => setEdu(i, 'startYear', e.target.value)} placeholder="2020" min="1990" max="2030" />
                        </Field>
                        <Field label="End Year">
                            <Input type="number" value={edu.endYear} onChange={e => setEdu(i, 'endYear', e.target.value)} placeholder="2024" min="1990" max="2030" />
                        </Field>
                        <Field label="CGPA / %">
                            <Input value={edu.cgpa} onChange={e => setEdu(i, 'cgpa', e.target.value)} placeholder="8.5 / 85%" />
                        </Field>
                    </div>
                    <Field label="Key Achievements / Activities">
                        <Textarea value={edu.achievements} onChange={e => setEdu(i, 'achievements', e.target.value)}
                            placeholder="Dean's list, club head, hackathon winner..." />
                    </Field>
                </div>
            ))}
            <button onClick={addEdu} className="btn btn-ghost w-full border-dashed border-surface-600">
                <PlusIcon className="w-4 h-4" /> Add Another Education
            </button>
        </div>
    );
}

// ─── STEP 3: Experience ───────────────────────────────────────────────────────
function Step3({ data, setData }) {
    const addExp = () => setData(d => ({ ...d, experience: [...d.experience, emptyExp()] }));
    const removeExp = i => setData(d => ({ ...d, experience: d.experience.filter((_, idx) => idx !== i) }));
    const setExp = (i, k, v) => setData(d => {
        const exp = [...d.experience];
        exp[i] = { ...exp[i], [k]: v };
        return { ...d, experience: exp };
    });
    return (
        <div className="space-y-6">
            {data.experience.length === 0 && (
                <div className="card p-6 text-center text-slate-400 text-sm border-dashed border-surface-600">
                    No experience yet? That's okay! Click "Add Experience" to add internships, part-time jobs, or volunteer work.
                </div>
            )}
            {data.experience.map((exp, i) => (
                <div key={i} className="card p-5 space-y-4 border-surface-600">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                            <BriefcaseIcon className="w-4 h-4 text-accent-400" />
                            Experience #{i + 1}
                        </h4>
                        <div className="flex items-center gap-3">
                            <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                                <input type="checkbox" checked={exp.isInternship}
                                    onChange={e => setExp(i, 'isInternship', e.target.checked)}
                                    className="rounded" />
                                Internship
                            </label>
                            <button onClick={() => removeExp(i)} className="text-red-400 hover:text-red-300 transition-colors">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Company / Organization" required>
                            <Input value={exp.company} onChange={e => setExp(i, 'company', e.target.value)} placeholder="Google, TCS, Startup Name..." />
                        </Field>
                        <Field label="Job Title / Role" required>
                            <Input value={exp.position} onChange={e => setExp(i, 'position', e.target.value)} placeholder="Product Management Intern" />
                        </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Start Month & Year">
                            <Input value={exp.startDate} onChange={e => setExp(i, 'startDate', e.target.value)} placeholder="June 2023" />
                        </Field>
                        <Field label="End Month & Year">
                            <Input value={exp.endDate} onChange={e => setExp(i, 'endDate', e.target.value)} placeholder="Aug 2023 / Present" />
                        </Field>
                    </div>
                    <Field label="Key Responsibilities & Achievements" required>
                        <Textarea rows={4} value={exp.description} onChange={e => setExp(i, 'description', e.target.value)}
                            placeholder="• Led product discovery for 3 features that increased DAU by 15%&#10;• Collaborated with 5-person design team using Figma..." />
                    </Field>
                </div>
            ))}
            <button onClick={addExp} className="btn btn-ghost w-full border-dashed border-surface-600">
                <PlusIcon className="w-4 h-4" /> Add Experience / Internship
            </button>
        </div>
    );
}

// ─── STEP 4: Projects ─────────────────────────────────────────────────────────
function Step4({ data, setData }) {
    const addProj = () => setData(d => ({ ...d, projects: [...d.projects, emptyProj()] }));
    const removeProj = i => setData(d => ({ ...d, projects: d.projects.filter((_, idx) => idx !== i) }));
    const setProj = (i, k, v) => setData(d => {
        const projects = [...d.projects];
        projects[i] = { ...projects[i], [k]: v };
        return { ...d, projects };
    });
    return (
        <div className="space-y-6">
            {data.projects.map((proj, i) => (
                <div key={i} className="card p-5 space-y-4 border-surface-600">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                            <CodeBracketIcon className="w-4 h-4 text-emerald-400" />
                            Project #{i + 1}
                        </h4>
                        {i > 0 && (
                            <button onClick={() => removeProj(i)} className="text-red-400 hover:text-red-300 transition-colors">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <Field label="Project Name" required>
                        <Input value={proj.name} onChange={e => setProj(i, 'name', e.target.value)} placeholder="E-commerce Platform, AI Chatbot..." />
                    </Field>
                    <Field label="Description" required>
                        <Textarea value={proj.description} onChange={e => setProj(i, 'description', e.target.value)}
                            placeholder="What does this project do? What problem does it solve?" />
                    </Field>
                    <Field label="Technologies Used">
                        <Input value={proj.technologies} onChange={e => setProj(i, 'technologies', e.target.value)} placeholder="React, Node.js, MongoDB, Python..." />
                    </Field>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Impact / Result">
                            <Input value={proj.impact} onChange={e => setProj(i, 'impact', e.target.value)} placeholder="500+ users, 4.8★ rating..." />
                        </Field>
                        <Field label="GitHub / Live Link">
                            <Input value={proj.link} onChange={e => setProj(i, 'link', e.target.value)} placeholder="github.com/user/project" />
                        </Field>
                    </div>
                </div>
            ))}
            <button onClick={addProj} className="btn btn-ghost w-full border-dashed border-surface-600">
                <PlusIcon className="w-4 h-4" /> Add Another Project
            </button>
        </div>
    );
}

// ─── STEP 5: Skills & More ────────────────────────────────────────────────────
function Step5({ data, setData }) {
    const set = (k, v) => setData(d => ({ ...d, [k]: v }));
    const addCert = () => setData(d => ({ ...d, certifications: [...d.certifications, emptyCert()] }));
    const removeCert = i => setData(d => ({ ...d, certifications: d.certifications.filter((_, idx) => idx !== i) }));
    const setCert = (i, k, v) => setData(d => {
        const certifications = [...d.certifications];
        certifications[i] = { ...certifications[i], [k]: v };
        return { ...d, certifications };
    });
    return (
        <div className="space-y-6">
            <Field label="Technical Skills" required>
                <Textarea value={data.technicalSkills}
                    onChange={e => set('technicalSkills', e.target.value)}
                    placeholder="Python, JavaScript, React, Node.js, SQL, MongoDB, Java, C++, Machine Learning, Docker..." />
                <p className="text-xs text-slate-500 mt-1">Separate skills with commas</p>
            </Field>
            <Field label="Soft Skills">
                <Textarea value={data.softSkills}
                    onChange={e => set('softSkills', e.target.value)}
                    rows={2}
                    placeholder="Leadership, Communication, Problem Solving, Teamwork, Time Management..." />
            </Field>
            <Field label="Tools & Platforms">
                <Input value={data.tools} onChange={e => set('tools', e.target.value)}
                    placeholder="Figma, Jira, Power BI, Tableau, Git, VS Code, Postman..." />
            </Field>
            <Field label="Languages Known">
                <Input value={data.languages} onChange={e => set('languages', e.target.value)}
                    placeholder="English (Fluent), Hindi (Native), French (Basic)..." />
            </Field>

            {/* Certifications */}
            <div className="space-y-4">
                <h4 className="text-sm font-semibold text-white">Certifications</h4>
                {data.certifications.map((cert, i) => (
                    <div key={i} className="card p-4 space-y-3 border-surface-600">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-400">Certification #{i + 1}</span>
                            <button onClick={() => removeCert(i)} className="text-red-400 hover:text-red-300">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="sm:col-span-2">
                                <Input value={cert.name} onChange={e => setCert(i, 'name', e.target.value)} placeholder="AWS Cloud Practitioner" />
                            </div>
                            <Input value={cert.year} onChange={e => setCert(i, 'year', e.target.value)} placeholder="2023" />
                        </div>
                        <Input value={cert.issuer} onChange={e => setCert(i, 'issuer', e.target.value)} placeholder="Issuer: Amazon, Google, Coursera..." />
                    </div>
                ))}
                <button onClick={addCert} className="btn btn-ghost w-full border-dashed border-surface-600 text-sm">
                    <PlusIcon className="w-4 h-4" /> Add Certification
                </button>
            </div>

            <Field label="Awards & Achievements">
                <Textarea value={data.awards}
                    onChange={e => set('awards', e.target.value)}
                    rows={2}
                    placeholder="Hackathon winner, Dean's List, National Merit Scholar..." />
            </Field>
            <Field label="Extra-Curricular Activities">
                <Textarea value={data.extracurricular}
                    onChange={e => set('extracurricular', e.target.value)}
                    rows={2}
                    placeholder="Student council president, Cricket team, NSS volunteer, Coding club lead..." />
            </Field>
        </div>
    );
}

// ─── STEP 6: Payment ─────────────────────────────────────────────────────────
function Step6({ selectedPlan, setSelectedPlan, onPay, paying }) {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-white font-semibold mb-4 text-center">Choose your plan</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {PLANS.map(plan => (
                        <button
                            key={plan.id}
                            onClick={() => setSelectedPlan(plan.id)}
                            className={`relative card p-5 text-left transition-all duration-200 hover:scale-[1.02]
                ${selectedPlan === plan.id
                                    ? `border-2 ${plan.border} ring-2 ring-violet-500/20 bg-surface-700/50`
                                    : 'border-surface-600 hover:border-surface-500'}`}
                        >
                            {plan.badge && (
                                <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-500 to-pink-500 text-white text-xs font-bold px-3 py-0.5 rounded-full">
                                    {plan.badge}
                                </span>
                            )}
                            <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${plan.color} bg-clip-text text-transparent font-display font-bold text-2xl mb-3`}>
                                {plan.label}
                            </div>
                            <ul className="space-y-2">
                                {plan.features.map(f => (
                                    <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                                        <CheckCircleIcon className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            {selectedPlan === plan.id && (
                                <div className="mt-3 text-xs text-primary-400 font-medium flex items-center gap-1">
                                    <CheckCircleIcon className="w-4 h-4" /> Selected
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Order Summary */}
            <div className="card p-4 bg-surface-700/50 border-surface-600">
                <h4 className="text-sm font-semibold text-white mb-3">Order Summary</h4>
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">CV Builder ({selectedPlan === 'premium' ? 'Premium' : 'Basic'} Plan)</span>
                    <span className="text-white">₹{selectedPlan === 'premium' ? 29 : 19}</span>
                </div>
                <div className="flex justify-between text-sm mb-3 pb-3 border-b border-surface-600">
                    <span className="text-slate-400">GST (18%)</span>
                    <span className="text-white">₹{selectedPlan === 'premium' ? Math.round(29 * 0.18) : Math.round(19 * 0.18)}</span>
                </div>
                <div className="flex justify-between font-bold">
                    <span className="text-white">Total</span>
                    <span className="text-emerald-400">₹{selectedPlan === 'premium' ? Math.round(29 * 1.18) : Math.round(19 * 1.18)}</span>
                </div>
            </div>

            {/* Security note */}
            <div className="flex items-center gap-2 text-xs text-slate-500 justify-center">
                <LockClosedIcon className="w-3.5 h-3.5 text-emerald-400" />
                Secure Payment via Razorpay • 256-bit SSL Encrypted
            </div>

            {/* Pay Button */}
            <button
                onClick={onPay}
                disabled={paying}
                className="btn btn-primary w-full text-base py-3 gap-2 relative overflow-hidden"
            >
                {paying ? (
                    <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing Payment...
                    </>
                ) : (
                    <>
                        <CreditCardIcon className="w-5 h-5" />
                        Pay ₹{selectedPlan === 'premium' ? Math.round(29 * 1.18) : Math.round(19 * 1.18)} & Generate My CV
                    </>
                )}
            </button>
        </div>
    );
}

// ─── CV PDF Generator ─────────────────────────────────────────────────────────
function generateCVHTML(data, plan) {
    const accentColor = plan === 'premium' ? '#8b5cf6' : '#3b82f6';
    const techSkills = (data.technicalSkills || '').split(',').map(s => s.trim()).filter(Boolean);
    const softSkills = (data.softSkills || '').split(',').map(s => s.trim()).filter(Boolean);
    const tools = (data.tools || '').split(',').map(s => s.trim()).filter(Boolean);

    const sectionTitle = (t) => `
        <div style="border-left: 3px solid ${accentColor}; padding-left: 10px; margin: 20px 0 10px 0;">
            <h2 style="font-size: 14px; font-weight: 700; color: #1e293b; text-transform: uppercase; letter-spacing: 1px; margin: 0;">${t}</h2>
        </div>`;

    const eduHTML = (data.education || []).map(e => e.institution ? `
        <div style="margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                    <p style="font-size: 13px; font-weight: 700; color: #1e293b; margin: 0;">${e.institution}</p>
                    <p style="font-size: 12px; color: #475569; margin: 2px 0;">${e.degree}${e.field ? ` in ${e.field}` : ''}${e.cgpa ? ` • CGPA/Marks: ${e.cgpa}` : ''}</p>
                    ${e.achievements ? `<p style="font-size: 11px; color: #64748b; margin: 3px 0;">${e.achievements}</p>` : ''}
                </div>
                <p style="font-size: 11px; color: #64748b; white-space: nowrap; margin: 0;">${e.startYear || ''}${e.startYear && e.endYear ? ' – ' : ''}${e.endYear || ''}</p>
            </div>
        </div>` : '').join('');

    const expHTML = (data.experience || []).map(e => e.company ? `
        <div style="margin-bottom: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                    <p style="font-size: 13px; font-weight: 700; color: #1e293b; margin: 0;">${e.position}${e.isInternship ? ' <span style="background:#ede9fe;color:#7c3aed;padding:1px 6px;border-radius:4px;font-size:10px;font-weight:600;">Internship</span>' : ''}</p>
                    <p style="font-size: 12px; color: ${accentColor}; font-weight: 600; margin: 2px 0;">${e.company}</p>
                </div>
                <p style="font-size: 11px; color: #64748b; white-space: nowrap; margin: 0;">${e.startDate || ''}${e.startDate && e.endDate ? ' – ' : ''}${e.endDate || ''}</p>
            </div>
            ${e.description ? `<div style="margin-top: 5px; font-size: 12px; color: #475569; line-height: 1.6;">${e.description.split('\n').map(l => l.trim() ? `<p style="margin: 3px 0;">${l}</p>` : '').join('')}</div>` : ''}
        </div>` : '').join('');

    const projHTML = (data.projects || []).map(p => p.name ? `
        <div style="margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <p style="font-size: 13px; font-weight: 700; color: #1e293b; margin: 0;">${p.name}${p.link ? ` <span style="font-size:11px; color:${accentColor}; font-weight:400;">• ${p.link}</span>` : ''}</p>
                ${p.impact ? `<span style="font-size:11px; color: #059669; font-weight: 600; white-space: nowrap;">${p.impact}</span>` : ''}
            </div>
            ${p.technologies ? `<p style="font-size: 11px; color: ${accentColor}; margin: 2px 0; font-weight: 600;">Tech: ${p.technologies}</p>` : ''}
            ${p.description ? `<p style="font-size: 12px; color: #475569; margin: 3px 0; line-height: 1.5;">${p.description}</p>` : ''}
        </div>` : '').join('');

    const certHTML = (data.certifications || []).filter(c => c.name).map(c => `
        <li style="font-size: 12px; color: #475569; margin: 3px 0;">
            <strong style="color: #1e293b;">${c.name}</strong>${c.issuer ? ` — ${c.issuer}` : ''}${c.year ? ` (${c.year})` : ''}
        </li>`).join('');

    const skillBadge = (skill, color = accentColor) =>
        `<span style="display:inline-block; background:${color}15; color:${color}; border:1px solid ${color}30; padding:2px 10px; border-radius:20px; font-size:11px; font-weight:500; margin:2px;">${skill}</span>`;

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<style>
  * { box-sizing: border-box; }
  body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; background: white; color: #334155; }
  @media print { body { margin: 0; } .no-print { display: none !important; } }
</style>
</head>
<body>
<div style="max-width: 800px; margin: 0 auto; padding: 36px 40px; background: white; min-height: 100vh;">

  <!-- Header -->
  <div style="border-bottom: 2px solid ${accentColor}; padding-bottom: 16px; margin-bottom: 4px;">
    <h1 style="font-size: 26px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0; letter-spacing: -0.5px;">
      ${data.firstName || ''} ${data.lastName || ''}
    </h1>
    ${data.headline ? `<p style="font-size: 13px; color: ${accentColor}; font-weight: 600; margin: 0 0 10px 0;">${data.headline}</p>` : ''}
    <div style="display: flex; flex-wrap: wrap; gap: 12px; font-size: 11.5px; color: #475569;">
      ${data.email ? `<span>✉ ${data.email}</span>` : ''}
      ${data.phone ? `<span>📞 ${data.phone}</span>` : ''}
      ${data.location ? `<span>📍 ${data.location}</span>` : ''}
      ${data.linkedin ? `<span>🔗 ${data.linkedin}</span>` : ''}
      ${data.github ? `<span>⬤ ${data.github}</span>` : ''}
      ${data.portfolio ? `<span>🌐 ${data.portfolio}</span>` : ''}
    </div>
  </div>

  ${data.summary ? `
  ${sectionTitle('Professional Summary')}
  <p style="font-size: 12.5px; color: #475569; line-height: 1.7; margin: 0;">${data.summary}</p>
  ` : ''}

  ${eduHTML ? `${sectionTitle('Education')}${eduHTML}` : ''}
  ${expHTML ? `${sectionTitle('Work Experience')}${expHTML}` : ''}
  ${projHTML ? `${sectionTitle('Projects')}${projHTML}` : ''}

  ${techSkills.length > 0 || softSkills.length > 0 || tools.length > 0 ? `
  ${sectionTitle('Skills')}
  ${techSkills.length > 0 ? `
    <p style="font-size: 11px; font-weight: 700; color: #1e293b; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 0.5px;">Technical Skills</p>
    <div style="margin-bottom: 8px;">${techSkills.map(s => skillBadge(s, accentColor)).join('')}</div>
  ` : ''}
  ${softSkills.length > 0 ? `
    <p style="font-size: 11px; font-weight: 700; color: #1e293b; margin: 8px 0 5px 0; text-transform: uppercase; letter-spacing: 0.5px;">Soft Skills</p>
    <div style="margin-bottom: 8px;">${softSkills.map(s => skillBadge(s, '#059669')).join('')}</div>
  ` : ''}
  ${tools.length > 0 ? `
    <p style="font-size: 11px; font-weight: 700; color: #1e293b; margin: 8px 0 5px 0; text-transform: uppercase; letter-spacing: 0.5px;">Tools & Platforms</p>
    <div>${tools.map(s => skillBadge(s, '#d97706')).join('')}</div>
  ` : ''}
  ` : ''}

  ${data.languages ? `
  ${sectionTitle('Languages')}
  <p style="font-size: 12.5px; color: #475569; margin: 0;">${data.languages}</p>
  ` : ''}

  ${certHTML ? `
  ${sectionTitle('Certifications')}
  <ul style="margin: 0; padding-left: 16px;">${certHTML}</ul>
  ` : ''}

  ${data.awards ? `
  ${sectionTitle('Awards & Achievements')}
  <p style="font-size: 12.5px; color: #475569; line-height: 1.7; margin: 0;">${data.awards}</p>
  ` : ''}

  ${data.extracurricular ? `
  ${sectionTitle('Extra-Curricular Activities')}
  <p style="font-size: 12.5px; color: #475569; line-height: 1.7; margin: 0;">${data.extracurricular}</p>
  ` : ''}

  <!-- Footer watermark -->
  <div style="margin-top: 30px; padding-top: 12px; border-top: 1px solid #e2e8f0; text-align: center;">
    <p style="font-size: 10px; color: #94a3b8; margin: 0;">Generated by PM Internship AI Platform • ${plan === 'premium' ? 'Premium' : 'Basic'} Plan</p>
  </div>
</div>
</body>
</html>`;
}

// ─── Main CV Builder Page ──────────────────────────────────────────────────────
export default function CVBuilderPage() {
    const { user } = useAuthStore();
    const [step, setStep] = useState(1);
    const [selectedPlan, setSelectedPlan] = useState('basic');
    const [paying, setPaying] = useState(false);
    const [paid, setPaid] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const iframeRef = useRef(null);

    // Form state
    const [formData, setFormData] = useState({
        // Step 1: Personal
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        headline: '',
        email: user?.email || '',
        phone: user?.phone || '',
        location: '',
        linkedin: '',
        github: '',
        portfolio: '',
        summary: '',
        // Step 2: Education
        education: [emptyEdu()],
        // Step 3: Experience
        experience: [],
        // Step 4: Projects
        projects: [emptyProj()],
        // Step 5: Skills
        technicalSkills: '',
        softSkills: '',
        tools: '',
        languages: '',
        certifications: [],
        awards: '',
        extracurricular: '',
    });

    const canNext = () => {
        if (step === 1) return formData.firstName && formData.lastName && formData.email;
        if (step === 2) return formData.education[0]?.institution;
        return true;
    };

    const handlePay = async () => {
        setPaying(true);
        // Simulate payment processing (replace with Razorpay in production)
        await new Promise(r => setTimeout(r, 2000));
        setPaying(false);
        setPaid(true);
        toast.success('Payment successful! 🎉 Generating your CV...');
        // Auto-download after a brief delay
        setTimeout(() => handleDownload(), 800);
    };

    const handleDownload = async () => {
        if (downloading) return;
        setDownloading(true);
        toast.loading('Generating your PDF...', { id: 'pdf-gen' });
        try {
            const html = generateCVHTML(formData, selectedPlan);
            // Create a hidden container to render the CV HTML
            const container = document.createElement('div');
            container.innerHTML = html;
            container.style.position = 'fixed';
            container.style.top = '-9999px';
            container.style.left = '-9999px';
            container.style.width = '794px'; // A4 width in px at 96dpi
            document.body.appendChild(container);

            const cvRoot = container.querySelector('div') || container;
            const fileName = `${formData.firstName || 'My'}_${formData.lastName || 'CV'}_CV.pdf`;

            await html2pdf()
                .set({
                    margin: [10, 10, 10, 10],
                    filename: fileName,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: {
                        scale: 2,
                        useCORS: true,
                        letterRendering: true,
                        backgroundColor: '#ffffff',
                    },
                    jsPDF: {
                        unit: 'mm',
                        format: 'a4',
                        orientation: 'portrait',
                    },
                    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
                })
                .from(cvRoot)
                .save();

            document.body.removeChild(container);
            toast.success('CV downloaded successfully! ✅', { id: 'pdf-gen' });
        } catch (err) {
            toast.error('Download failed. Please try again.', { id: 'pdf-gen' });
            console.error('PDF generation error:', err);
        } finally {
            setDownloading(false);
        }
    };

    const handlePreview = () => setShowPreview(true);

    const nextStep = () => {
        if (!canNext()) {
            toast.error('Please fill in the required fields marked with *');
            return;
        }
        setStep(s => Math.min(s + 1, 6));
        window.scrollTo(0, 0);
    };
    const prevStep = () => {
        setStep(s => Math.max(s - 1, 1));
        window.scrollTo(0, 0);
    };

    const previewHTML = generateCVHTML(formData, selectedPlan);

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent-500/10 border border-accent-500/20 rounded-full text-accent-400 text-sm font-medium mb-2">
                    <SparklesIcon className="w-4 h-4" />
                    AI-Powered CV Builder
                </div>
                <h1 className="font-display text-3xl font-bold text-white">Build Your Professional CV</h1>
                <p className="text-slate-400">Fill in your details, pay ₹19 or ₹29, and get a stunning downloadable CV</p>
            </div>

            {/* Progress Steps */}
            <div className="card p-4">
                <div className="flex items-center justify-between relative">
                    <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-surface-600 -translate-y-1/2 mx-8" />
                    <div
                        className="absolute left-0 top-1/2 h-0.5 bg-gradient-to-r from-primary-500 to-accent-500 -translate-y-1/2 mx-8 transition-all duration-500"
                        style={{ width: `${((step - 1) / (STEPS.length - 1)) * (100 - 0)}%`, maxWidth: 'calc(100% - 4rem)' }}
                    />
                    {STEPS.map(s => {
                        const Icon = s.icon;
                        const done = step > s.id;
                        const active = step === s.id;
                        return (
                            <div key={s.id} className="relative flex flex-col items-center gap-1 z-10">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300
                  ${done ? 'bg-emerald-500 border-emerald-500' : active ? 'bg-primary-600 border-primary-500 ring-4 ring-primary-500/20' : 'bg-surface-700 border-surface-600'}`}>
                                    {done ? (
                                        <CheckCircleIcon className="w-5 h-5 text-white" />
                                    ) : (
                                        <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-500'}`} />
                                    )}
                                </div>
                                <span className={`text-xs font-medium hidden sm:block text-center max-w-[60px] leading-tight
                  ${active ? 'text-white' : done ? 'text-emerald-400' : 'text-slate-500'}`}>
                                    {s.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Step Content */}
            <div className="card p-6">
                <div className="mb-6">
                    <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
                        {(() => { const Icon = STEPS[step - 1].icon; return <Icon className="w-5 h-5 text-primary-400" />; })()}
                        {STEPS[step - 1].label}
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">{STEPS[step - 1].subtitle}</p>
                </div>

                {step === 1 && <Step1 data={formData} setData={setFormData} />}
                {step === 2 && <Step2 data={formData} setData={setFormData} />}
                {step === 3 && <Step3 data={formData} setData={setFormData} />}
                {step === 4 && <Step4 data={formData} setData={setFormData} />}
                {step === 5 && <Step5 data={formData} setData={setFormData} />}
                {step === 6 && !paid && <Step6 selectedPlan={selectedPlan} setSelectedPlan={setSelectedPlan} onPay={handlePay} paying={paying} />}

                {/* Post-payment success */}
                {step === 6 && paid && (
                    <div className="text-center space-y-6 py-4">
                        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto">
                            <CheckCircleIcon className="w-10 h-10 text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">Payment Successful! 🎉</h3>
                            <p className="text-slate-400">Your professional CV is ready. Click below to download it.</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button onClick={handlePreview} className="btn btn-ghost gap-2">
                                <EyeIcon className="w-4 h-4" /> Preview CV
                            </button>
                            <button
                                onClick={handleDownload}
                                disabled={downloading}
                                className="btn btn-primary gap-2"
                            >
                                {downloading ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Generating PDF...
                                    </>
                                ) : (
                                    <>
                                        <ArrowDownTrayIcon className="w-4 h-4" /> Download CV (PDF)
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                {!(step === 6 && paid) && (
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-surface-700">
                        {step > 1 ? (
                            <button onClick={prevStep} className="btn btn-ghost gap-2">
                                <ArrowLeftIcon className="w-4 h-4" /> Back
                            </button>
                        ) : <div />}

                        {step < 6 && (
                            <div className="flex items-center gap-3">
                                {step >= 3 && (
                                    <button onClick={handlePreview} className="btn btn-ghost gap-2 text-sm">
                                        <EyeIcon className="w-4 h-4" /> Preview
                                    </button>
                                )}
                                <button onClick={nextStep} className="btn btn-primary gap-2">
                                    {step === 5 ? 'Go to Payment' : 'Next Step'}
                                    <ArrowRightIcon className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Preview Modal */}
            {showPreview && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden shadow-2xl">
                        <div className="flex items-center justify-between px-4 py-3 bg-surface-800 border-b border-surface-700 rounded-t-2xl">
                            <p className="text-white font-medium text-sm">CV Preview</p>
                            <div className="flex items-center gap-2">
                                {paid && (
                                    <button
                                        onClick={handleDownload}
                                        disabled={downloading}
                                        className="btn btn-primary btn-sm gap-1"
                                    >
                                        {downloading ? (
                                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                                        )}
                                        {downloading ? 'Generating...' : 'Download'}
                                    </button>
                                )}
                                <button onClick={() => setShowPreview(false)} className="text-slate-400 hover:text-white transition-colors">
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <iframe
                            ref={iframeRef}
                            srcDoc={previewHTML}
                            className="flex-1 w-full"
                            title="CV Preview"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
