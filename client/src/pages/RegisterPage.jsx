import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { SparklesIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

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
                            <Field
                                label="University" id="university"
                                value={form.university} onChange={update('university')}
                                placeholder="e.g. IIT Delhi"
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <Field
                                    label="Degree" id="degree"
                                    value={form.degree} onChange={update('degree')}
                                    placeholder="B.Tech / MBA"
                                />
                                <Field
                                    label="Major / Stream" id="major"
                                    value={form.major} onChange={update('major')}
                                    placeholder="Computer Science"
                                />
                            </div>
                            <Field
                                label="Expected Graduation Year" id="graduationYear" type="number"
                                value={form.graduationYear} onChange={update('graduationYear')}
                                placeholder="2026"
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
