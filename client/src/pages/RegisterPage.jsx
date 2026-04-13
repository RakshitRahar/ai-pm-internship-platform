import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { SparklesIcon, EyeIcon, EyeSlashIcon, MagnifyingGlassIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import INDIAN_UNIVERSITIES from '@/data/indianUniversities';

// ─── Dropdown options ─────────────────────────────────────────────────────────
const DEGREE_OPTIONS = [
    { value: '', label: 'Select Highest Degree' },
    { value: '10th', label: '10th (Secondary)' },
    { value: '12th', label: '12th (Senior Secondary)' },
    { value: 'Diploma', label: 'Diploma' },
    { value: 'B.A.', label: 'B.A. (Bachelor of Arts)' },
    { value: 'B.Sc.', label: 'B.Sc. (Bachelor of Science)' },
    { value: 'B.Com.', label: 'B.Com. (Bachelor of Commerce)' },
    { value: 'BBA', label: 'BBA (Bachelor of Business Admin.)' },
    { value: 'BCA', label: 'BCA (Bachelor of Computer Applications)' },
    { value: 'B.Tech', label: 'B.Tech (Bachelor of Technology)' },
    { value: 'B.E.', label: 'B.E. (Bachelor of Engineering)' },
    { value: 'B.Arch', label: 'B.Arch (Bachelor of Architecture)' },
    { value: 'B.Pharm', label: 'B.Pharm (Bachelor of Pharmacy)' },
    { value: 'MBBS', label: 'MBBS' },
    { value: 'LLB', label: 'LLB (Bachelor of Laws)' },
    { value: 'M.A.', label: 'M.A. (Master of Arts)' },
    { value: 'M.Sc.', label: 'M.Sc. (Master of Science)' },
    { value: 'M.Com.', label: 'M.Com. (Master of Commerce)' },
    { value: 'MBA', label: 'MBA (Master of Business Admin.)' },
    { value: 'MCA', label: 'MCA (Master of Computer Applications)' },
    { value: 'M.Tech', label: 'M.Tech (Master of Technology)' },
    { value: 'M.E.', label: 'M.E. (Master of Engineering)' },
    { value: 'LLM', label: 'LLM (Master of Laws)' },
    { value: 'Ph.D.', label: 'Ph.D. (Doctorate)' },
    { value: 'Post-Doc', label: 'Post-Doctorate' },
    { value: 'Other', label: 'Other' },
];

const STREAM_OPTIONS = [
    { value: '', label: 'Select Major / Stream' },
    // Engineering & Tech
    { value: 'Computer Science', label: 'Computer Science' },
    { value: 'Information Technology', label: 'Information Technology' },
    { value: 'Data Science & AI', label: 'Data Science & AI' },
    { value: 'Electronics & Communication', label: 'Electronics & Communication' },
    { value: 'Electrical Engineering', label: 'Electrical Engineering' },
    { value: 'Mechanical Engineering', label: 'Mechanical Engineering' },
    { value: 'Civil Engineering', label: 'Civil Engineering' },
    { value: 'Chemical Engineering', label: 'Chemical Engineering' },
    { value: 'Aerospace Engineering', label: 'Aerospace Engineering' },
    { value: 'Biotechnology', label: 'Biotechnology' },
    // Business & Management
    { value: 'Business Administration', label: 'Business Administration' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Human Resources', label: 'Human Resources' },
    { value: 'Operations Management', label: 'Operations Management' },
    { value: 'Product Management', label: 'Product Management' },
    { value: 'Entrepreneurship', label: 'Entrepreneurship' },
    // Science
    { value: 'Physics', label: 'Physics' },
    { value: 'Chemistry', label: 'Chemistry' },
    { value: 'Mathematics', label: 'Mathematics' },
    { value: 'Biology', label: 'Biology' },
    { value: 'Statistics', label: 'Statistics' },
    // Arts & Humanities
    { value: 'Economics', label: 'Economics' },
    { value: 'Psychology', label: 'Psychology' },
    { value: 'Sociology', label: 'Sociology' },
    { value: 'English Literature', label: 'English Literature' },
    { value: 'Political Science', label: 'Political Science' },
    { value: 'Law', label: 'Law' },
    // Commerce
    { value: 'Commerce', label: 'Commerce' },
    { value: 'Accounting', label: 'Accounting' },
    // Design & Creative
    { value: 'Design', label: 'Design (UI/UX / Graphic)' },
    { value: 'Architecture', label: 'Architecture' },
    { value: 'Media & Communications', label: 'Media & Communications' },
    // Medical
    { value: 'Medicine', label: 'Medicine' },
    { value: 'Pharmacy', label: 'Pharmacy' },
    { value: 'Nursing', label: 'Nursing' },
    { value: 'Other', label: 'Other' },
];

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = [
    { value: '', label: 'Select Graduation Year' },
    ...Array.from({ length: 16 }, (_, i) => {
        const yr = currentYear - 5 + i; // 5 years back to 10 years ahead
        return { value: String(yr), label: String(yr) };
    }),
];

// ─── Field component moved OUTSIDE RegisterPage ────────────────────────────────
// Defining it inside the parent causes React to treat it as a new component on
// every render, which unmounts/remounts the input and loses focus after each keystroke.
function Field({ label, id, type = 'text', value, onChange, placeholder, error, children }) {
    return (
        <div>
            <label htmlFor={id} className="label">{label}</label>
            {children || (
                <input
                    type={type}
                    id={id}
                    value={value}
                    onChange={onChange}
                    className={`input ${error ? 'input-error' : ''}`}
                    placeholder={placeholder}
                    autoComplete="off"
                />
            )}
            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        </div>
    );
}

// ─── SelectField component ────────────────────────────────────────────────────
function SelectField({ label, id, value, onChange, options, error }) {
    return (
        <div>
            <label htmlFor={id} className="label">{label}</label>
            <select
                id={id}
                value={value}
                onChange={onChange}
                className={`input ${error ? 'input-error' : ''}`}
                style={{ cursor: 'pointer' }}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value} disabled={opt.value === ''}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        </div>
    );
}

// ─── University Searchable Combobox ───────────────────────────────────────────
function UniversityCombobox({ value, onChange, error }) {
    const [query, setQuery] = useState(value || '');
    const [open, setOpen] = useState(false);
    const [highlighted, setHighlighted] = useState(0);
    const containerRef = useRef(null);

    // Keep local query in sync if parent resets
    useEffect(() => { setQuery(value || ''); }, [value]);

    // Close on click outside
    useEffect(() => {
        const handler = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const filtered = query.trim().length === 0
        ? []
        : INDIAN_UNIVERSITIES.filter((u) =>
            u.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 8);

    const select = (university) => {
        setQuery(university);
        onChange({ target: { value: university } });
        setOpen(false);
    };

    const handleKeyDown = (e) => {
        if (!open || filtered.length === 0) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlighted((h) => Math.max(h - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            select(filtered[highlighted]);
        } else if (e.key === 'Escape') {
            setOpen(false);
        }
    };

    return (
        <div ref={containerRef} style={{ position: 'relative' }}>
            <label htmlFor="university" className="label">University / Affiliation</label>
            <div style={{ position: 'relative' }}>
                <MagnifyingGlassIcon
                    style={{
                        position: 'absolute', left: '0.75rem', top: '50%',
                        transform: 'translateY(-50%)', width: '1rem', height: '1rem',
                        color: '#94a3b8', pointerEvents: 'none',
                    }}
                />
                <input
                    id="university"
                    type="text"
                    value={query}
                    placeholder="Search university or college..."
                    autoComplete="off"
                    className={`input ${error ? 'input-error' : ''}`}
                    style={{ paddingLeft: '2.25rem', paddingRight: '2rem' }}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        onChange({ target: { value: e.target.value } });
                        setHighlighted(0);
                        setOpen(true);
                    }}
                    onFocus={() => { if (query.trim()) setOpen(true); }}
                    onKeyDown={handleKeyDown}
                />
                <ChevronDownIcon
                    style={{
                        position: 'absolute', right: '0.75rem', top: '50%',
                        transform: `translateY(-50%) rotate(${open ? 180 : 0}deg)`,
                        width: '1rem', height: '1rem', color: '#94a3b8',
                        transition: 'transform 0.2s', pointerEvents: 'none',
                    }}
                />
            </div>

            {open && filtered.length > 0 && (
                <ul
                    style={{
                        position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                        background: '#1e1b4b', border: '1px solid rgba(139,92,246,0.35)',
                        borderRadius: '0.75rem', zIndex: 9999, maxHeight: '14rem',
                        overflowY: 'auto', listStyle: 'none', margin: 0, padding: '0.25rem',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                    }}
                >
                    {filtered.map((u, i) => (
                        <li
                            key={u}
                            onMouseDown={() => select(u)}
                            onMouseEnter={() => setHighlighted(i)}
                            style={{
                                padding: '0.5rem 0.75rem',
                                borderRadius: '0.5rem',
                                cursor: 'pointer',
                                fontSize: '0.8125rem',
                                color: i === highlighted ? '#fff' : '#cbd5e1',
                                background: i === highlighted
                                    ? 'linear-gradient(135deg,rgba(124,58,237,0.5),rgba(139,92,246,0.3))'
                                    : 'transparent',
                                transition: 'background 0.15s',
                            }}
                        >
                            {u}
                        </li>
                    ))}
                </ul>
            )}
            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        </div>
    );
}

export default function RegisterPage() {
    const [form, setForm] = useState({
        firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
        university: '', degree: '', major: '', graduationYear: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [step, setStep] = useState(1);
    const { register, isLoading } = useAuthStore();
    const navigate = useNavigate();

    const update = (field) => (e) => {
        setForm((f) => ({ ...f, [field]: e.target.value }));
        setErrors((err) => ({ ...err, [field]: '' }));
    };

    const validateStep1 = () => {
        const errs = {};
        if (!form.firstName.trim()) errs.firstName = 'First name is required';
        if (!form.lastName.trim()) errs.lastName = 'Last name is required';
        if (!form.email.trim()) errs.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
        if (!form.password) errs.password = 'Password is required';
        else if (form.password.length < 8) errs.password = 'Minimum 8 characters';
        if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleStep1 = (e) => {
        e.preventDefault();
        if (validateStep1()) setStep(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const submitData = { ...form };
            delete submitData.confirmPassword;
            if (submitData.graduationYear) submitData.graduationYear = parseInt(submitData.graduationYear);

            const data = await register(submitData);
            toast.success(`Account created! Welcome, ${data.user.firstName}! 🎉`);
            navigate('/dashboard');
        } catch (error) {
            const msg = error.response?.data?.message || 'Registration failed.';
            toast.error(msg);
        }
    };

    return (
        <div className="min-h-screen bg-hero-gradient flex items-center justify-center px-4 py-10">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative w-full max-w-lg animate-slide-up">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 mb-4">
                        <SparklesIcon className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="font-display font-bold text-3xl text-white">Create your account</h1>
                    <p className="text-slate-400 mt-2">Join the AI-powered PM internship platform</p>

                    {/* Step indicators */}
                    <div className="flex items-center justify-center gap-3 mt-4">
                        {[1, 2].map((s) => (
                            <div
                                key={s}
                                className={`h-1.5 w-16 rounded-full transition-all duration-300 ${s <= step ? 'bg-primary-500' : 'bg-surface-600'}`}
                            />
                        ))}
                    </div>
                    <p className="text-slate-500 text-xs mt-2">
                        Step {step} of 2 — {step === 1 ? 'Account Details' : 'Academic Info'}
                    </p>
                </div>

                <div className="card-glass p-8 rounded-2xl border border-white/10">
                    {/* ── Step 1 ── */}
                    {step === 1 && (
                        <form onSubmit={handleStep1} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Field
                                    label="First Name" id="firstName"
                                    value={form.firstName} onChange={update('firstName')}
                                    placeholder="John" error={errors.firstName}
                                />
                                <Field
                                    label="Last Name" id="lastName"
                                    value={form.lastName} onChange={update('lastName')}
                                    placeholder="Doe" error={errors.lastName}
                                />
                            </div>

                            <Field
                                label="Email Address" id="reg-email" type="email"
                                value={form.email} onChange={update('email')}
                                placeholder="you@example.com" error={errors.email}
                            />

                            {/* Password with show/hide toggle */}
                            <div>
                                <label htmlFor="reg-password" className="label">Password</label>
                                <div className="relative">
                                    <input
                                        id="reg-password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={form.password}
                                        onChange={update('password')}
                                        className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
                                        placeholder="Min 8 characters"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((p) => !p)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                            </div>

                            <Field
                                label="Confirm Password" id="confirmPassword" type="password"
                                value={form.confirmPassword} onChange={update('confirmPassword')}
                                placeholder="Repeat password" error={errors.confirmPassword}
                            />

                            <button type="submit" className="btn btn-primary w-full mt-2">
                                Continue →
                            </button>
                        </form>
                    )}

                    {/* ── Step 2 ── */}
                    {step === 2 && (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <UniversityCombobox
                                value={form.university}
                                onChange={update('university')}
                                error={errors.university}
                            />
                            <SelectField
                                label="Highest Degree" id="degree"
                                value={form.degree} onChange={update('degree')}
                                options={DEGREE_OPTIONS}
                                error={errors.degree}
                            />
                            <SelectField
                                label="Major / Stream" id="major"
                                value={form.major} onChange={update('major')}
                                options={STREAM_OPTIONS}
                                error={errors.major}
                            />
                            <SelectField
                                label="Expected Graduation Year" id="graduationYear"
                                value={form.graduationYear} onChange={update('graduationYear')}
                                options={YEAR_OPTIONS}
                                error={errors.graduationYear}
                            />

                            <div className="flex gap-3 mt-2">
                                <button type="button" onClick={() => setStep(1)} className="btn btn-ghost flex-1">
                                    ← Back
                                </button>
                                <button
                                    type="submit"
                                    id="register-submit"
                                    disabled={isLoading}
                                    className="btn btn-primary flex-1"
                                >
                                    {isLoading ? 'Creating account...' : 'Create Account 🚀'}
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="divider" />
                    <p className="text-center text-slate-400 text-sm">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">
                            Sign in
                        </Link>
                    </p>
                </div>

                <p className="text-center text-slate-500 text-xs mt-6">
                    <Link to="/" className="hover:text-slate-300">← Back to home</Link>
                </p>
            </div>
        </div>
    );
}
