import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { SparklesIcon, EyeIcon, EyeSlashIcon, ShieldCheckIcon, KeyIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const [form, setForm] = useState({ email: '', password: '', adminKey: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [showAdminKey, setShowAdminKey] = useState(false);
    const [isAdminMode, setIsAdminMode] = useState(false);
    const [errors, setErrors] = useState({});
    const { login, isLoading } = useAuthStore();
    const navigate = useNavigate();

    const validate = () => {
        const errs = {};
        if (!form.email) errs.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Please enter a valid email';
        if (!form.password) errs.password = 'Password is required';
        if (isAdminMode && !form.adminKey) errs.adminKey = 'Admin key is required';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            const payload = { email: form.email, password: form.password };
            if (isAdminMode) payload.adminKey = form.adminKey;

            const data = await login(payload.email, payload.password, payload.adminKey);
            toast.success(`Welcome back, ${data.user.firstName}! 👋`);
            navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
        } catch (error) {
            const msg = error.response?.data?.message || 'Login failed. Please try again.';
            toast.error(msg);
        }
    };

    const update = (field) => (e) => {
        setForm((f) => ({ ...f, [field]: e.target.value }));
        setErrors((err) => ({ ...err, [field]: '' }));
    };

    return (
        <div className="min-h-screen bg-hero-gradient flex items-center justify-center px-4">
            {/* Background glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative w-full max-w-md animate-slide-up">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4 shadow-glow-primary transition-all duration-300 ${isAdminMode
                        ? 'bg-gradient-to-br from-amber-500 to-orange-500'
                        : 'bg-gradient-to-br from-primary-500 to-accent-500'
                        }`}>
                        {isAdminMode
                            ? <ShieldCheckIcon className="w-6 h-6 text-white" />
                            : <SparklesIcon className="w-6 h-6 text-white" />
                        }
                    </div>
                    <h1 className="font-display font-bold text-3xl text-white">
                        {isAdminMode ? 'Admin Portal' : 'Welcome back'}
                    </h1>
                    <p className="text-slate-400 mt-2">
                        {isAdminMode
                            ? 'Enter your credentials + admin key'
                            : 'Sign in to your PM Internship account'
                        }
                    </p>
                </div>

                {/* Card */}
                <div className={`card-glass p-8 rounded-2xl border transition-all duration-300 ${isAdminMode ? 'border-amber-500/20' : 'border-white/10'
                    }`}>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="label">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                value={form.email}
                                onChange={update('email')}
                                className={`input ${errors.email ? 'input-error' : ''}`}
                                placeholder="you@example.com"
                                autoComplete="email"
                            />
                            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="label">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    value={form.password}
                                    onChange={update('password')}
                                    className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                        </div>

                        {/* Admin Key — only shown in admin mode */}
                        {isAdminMode && (
                            <div
                                style={{
                                    background: 'rgba(245,158,11,0.07)',
                                    border: '1px solid rgba(245,158,11,0.25)',
                                    borderRadius: '0.75rem',
                                    padding: '1rem',
                                }}
                            >
                                <label className="label" style={{ color: '#fbbf24' }}>
                                    <KeyIcon style={{ display: 'inline', width: '0.875rem', height: '0.875rem', marginRight: '0.375rem', verticalAlign: 'middle' }} />
                                    Admin Access Key
                                </label>
                                <div className="relative">
                                    <input
                                        type={showAdminKey ? 'text' : 'password'}
                                        id="adminKey"
                                        value={form.adminKey}
                                        onChange={update('adminKey')}
                                        className={`input ${errors.adminKey ? 'input-error' : ''}`}
                                        placeholder="Enter admin key..."
                                        autoComplete="off"
                                        style={{ borderColor: errors.adminKey ? '' : 'rgba(245,158,11,0.4)' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowAdminKey(!showAdminKey)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-400 transition-colors"
                                    >
                                        {showAdminKey ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errors.adminKey && <p className="text-red-400 text-xs mt-1">{errors.adminKey}</p>}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            id="login-submit"
                            className={`btn w-full ${isAdminMode ? '' : 'btn-primary'}`}
                            style={isAdminMode ? { background: 'linear-gradient(135deg, #d97706, #ea580c)', color: '#fff' } : {}}
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Signing in...
                                </span>
                            ) : isAdminMode ? '🔐 Admin Sign In' : 'Sign In'}
                        </button>
                    </form>

                    <div className="divider" />

                    <p className="text-center text-slate-400 text-sm">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
                            Create one free
                        </Link>
                    </p>
                </div>

                {/* Admin mode toggle — discreet link at bottom */}
                <div className="text-center mt-4 flex flex-col gap-1">
                    <Link to="/" className="text-slate-500 hover:text-slate-300 text-xs transition-colors">← Back to home</Link>
                    <button
                        type="button"
                        onClick={() => {
                            setIsAdminMode((m) => !m);
                            setForm((f) => ({ ...f, adminKey: '' }));
                            setErrors({});
                        }}
                        className="text-xs transition-colors mt-1"
                        style={{ color: isAdminMode ? '#f59e0b' : '#475569' }}
                    >
                        {isAdminMode ? '← Switch to student login' : 'Admin? Click here'}
                    </button>
                </div>
            </div>
        </div>
    );
}
