import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { SparklesIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const { login, isLoading } = useAuthStore();
    const navigate = useNavigate();

    const validate = () => {
        const errs = {};
        if (!form.email) errs.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Please enter a valid email';
        if (!form.password) errs.password = 'Password is required';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            const data = await login(form.email, form.password);
            toast.success(`Welcome back, ${data.user.firstName}! 👋`);
            navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
        } catch (error) {
            const msg = error.response?.data?.message || 'Login failed. Please try again.';
            toast.error(msg);
        }
    };

    return (
        <div className="min-h-screen bg-hero-gradient flex items-center justify-center px-4">
            {/* Background glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative w-full max-w-md animate-slide-up">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 mb-4 shadow-glow-primary">
                        <SparklesIcon className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="font-display font-bold text-3xl text-white">Welcome back</h1>
                    <p className="text-slate-400 mt-2">Sign in to your PM Internship account</p>
                </div>

                {/* Card */}
                <div className="card-glass p-8 rounded-2xl border border-white/10">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="label">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                value={form.email}
                                onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: '' }); }}
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
                                    onChange={(e) => { setForm({ ...form, password: e.target.value }); setErrors({ ...errors, password: '' }); }}
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

                        <button type="submit" disabled={isLoading} className="btn btn-primary w-full" id="login-submit">
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Signing in...
                                </span>
                            ) : 'Sign In'}
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

                <p className="text-center text-slate-500 text-xs mt-6">
                    <Link to="/" className="hover:text-slate-300 transition-colors">← Back to home</Link>
                </p>
            </div>
        </div>
    );
}
