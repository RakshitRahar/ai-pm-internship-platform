import { Link } from 'react-router-dom';
import {
    SparklesIcon, BriefcaseIcon, UserGroupIcon,
    ChartBarIcon, ArrowRightIcon, CheckIcon,
} from '@heroicons/react/24/outline';

const features = [
    {
        icon: SparklesIcon,
        title: 'AI-Powered CV Analysis',
        description: 'Upload your CV and get instant AI analysis. Skills, experience, and projects extracted automatically.',
        color: 'from-purple-500 to-violet-500',
    },
    {
        icon: BriefcaseIcon,
        title: 'Smart Internship Matching',
        description: 'Our algorithm scores your profile against role requirements using a weighted matching engine.',
        color: 'from-pink-500 to-rose-500',
    },
    {
        icon: ChartBarIcon,
        title: 'Transparent Scoring',
        description: 'See exactly how you scored across skills, experience, education, projects, and keywords.',
        color: 'from-fuchsia-500 to-purple-600',
    },
    {
        icon: UserGroupIcon,
        title: 'Auto Allocation Engine',
        description: 'Admins can run smart allocation in one click — rank candidates and fill roles automatically.',
        color: 'from-violet-500 to-pink-500',
    },
];

const stats = [
    { value: '10,000+', label: 'Applications processed' },
    { value: '95%', label: 'Matching accuracy' },
    { value: '500+', label: 'Internships available' },
    { value: '3x', label: 'Faster allocation' },
];

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-hero-gradient text-white overflow-x-hidden">
            {/* Navigation */}
            <nav className="relative z-10 flex items-center justify-between px-6 lg:px-16 py-5 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
                        {/* AI Brain / Neural Network Logo */}
                        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                            {/* Brain outline */}
                            <path d="M9.5 2C7.5 2 6 3.5 6 5.5c0 .4.1.8.2 1.1C4.9 7.1 4 8.4 4 10c0 1.2.5 2.3 1.3 3-.8.7-1.3 1.8-1.3 3 0 2.2 1.8 4 4 4h8c2.2 0 4-1.8 4-4 0-1.2-.5-2.3-1.3-3 .8-.7 1.3-1.8 1.3-3 0-1.6-.9-2.9-2.2-3.4.1-.3.2-.7.2-1.1C18 3.5 16.5 2 14.5 2c-.9 0-1.7.3-2.5.8C11.2 2.3 10.4 2 9.5 2z" />
                            {/* Neural nodes */}
                            <circle cx="9" cy="9" r="1" fill="currentColor" stroke="none" />
                            <circle cx="15" cy="9" r="1" fill="currentColor" stroke="none" />
                            <circle cx="12" cy="13" r="1" fill="currentColor" stroke="none" />
                            {/* Connections */}
                            <line x1="9" y1="9" x2="12" y2="13" strokeWidth="1.2" />
                            <line x1="15" y1="9" x2="12" y2="13" strokeWidth="1.2" />
                            <line x1="9" y1="9" x2="15" y2="9" strokeWidth="1.2" />
                        </svg>
                    </div>
                    <span className="font-display font-bold text-white text-lg">PM Internship AI</span>
                </div>
                <div className="flex items-center gap-3">
                    <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
                    <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
                </div>
            </nav>

            {/* Hero */}
            <section className="relative px-6 lg:px-16 pt-24 pb-32 text-center">
                {/* Background glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-20 left-1/4 w-64 h-64 bg-pink-500/8 rounded-full blur-3xl pointer-events-none" />

                <div className="relative">
                    <h1 className="font-display font-bold text-5xl lg:text-7xl text-white leading-tight mb-6">
                        The Smartest Way to
                        <br />
                        <span className="gradient-text">Match PM Talent</span>
                    </h1>

                    <p className="text-slate-400 text-lg lg:text-xl max-w-2xl mx-auto mb-10">
                        Upload your CV, get AI-powered analysis, and be automatically matched to the most
                        suitable PM internships — transparently and fairly.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/register" className="btn btn-primary btn-lg gap-2 w-full sm:w-auto">
                            Apply Now
                            <ArrowRightIcon className="w-5 h-5" />
                        </Link>
                        <Link to="/login" className="btn btn-ghost btn-lg w-full sm:w-auto">
                            Admin Login
                        </Link>
                    </div>

                    {/* Trust indicators */}
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
                        {['No bias', 'Transparent scores', 'Instant analysis', 'Secure uploads'].map((item) => (
                            <div key={item} className="flex items-center gap-2 text-slate-400 text-sm">
                                <CheckIcon className="w-4 h-4 text-emerald-400" />
                                {item}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="px-6 lg:px-16 py-16 bg-surface-900/60 border-y border-surface-700">
                <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {stats.map(({ value, label }) => (
                        <div key={label} className="text-center">
                            <div className="font-display font-bold text-4xl gradient-text mb-2">{value}</div>
                            <div className="text-slate-400 text-sm">{label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section className="px-6 lg:px-16 py-24 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="font-display font-bold text-4xl text-white mb-4">How It Works</h2>
                    <p className="text-slate-400 text-lg">AI-driven hiring in four simple steps</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {features.map(({ icon: Icon, title, description, color }, i) => (
                        <div key={title} className="card-glass p-6 hover:border-white/20 transition-all duration-300 group animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} p-2.5 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                <Icon className="w-full h-full text-white" />
                            </div>
                            <h3 className="font-display font-bold text-xl text-white mb-2">{title}</h3>
                            <p className="text-slate-400 leading-relaxed">{description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="px-6 lg:px-16 py-24 text-center">
                <div className="max-w-2xl mx-auto card-glass p-12 rounded-3xl border border-primary-500/20">
                    <h2 className="font-display font-bold text-4xl text-white mb-4">Ready to get started?</h2>
                    <p className="text-slate-400 mb-8">Create your account, upload your CV, and let AI do the rest.</p>
                    <Link to="/register" className="btn btn-primary btn-lg">
                        Create Free Account
                        <ArrowRightIcon className="w-5 h-5" />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="px-6 py-8 border-t border-surface-700 text-center text-slate-500 text-sm">
                © 2026 PM Internship AI Platform. All rights reserved.
            </footer>
        </div>
    );
}
