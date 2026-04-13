import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import {
    HomeIcon, BriefcaseIcon, DocumentTextIcon,
    UserCircleIcon, ChevronDownIcon, ArrowRightOnRectangleIcon,
    Bars3Icon, XMarkIcon, SparklesIcon, DocumentArrowUpIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import AIChatWidget from '@/components/student/AIChatWidget';

const navItems = [
    { to: '/dashboard', icon: HomeIcon, label: 'Dashboard', end: true },
    { to: '/dashboard/internships', icon: BriefcaseIcon, label: 'Internships' },
    { to: '/dashboard/applications', icon: DocumentTextIcon, label: 'My Applications' },
    { to: '/dashboard/profile', icon: UserCircleIcon, label: 'Profile' },
    { to: '/dashboard/cv-builder', icon: DocumentArrowUpIcon, label: 'CV Builder', badge: '₹19' },
];


export default function StudentLayout() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-surface-900 overflow-hidden">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-64 bg-surface-800 border-r border-surface-700
        flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                {/* Logo */}
                <div className="flex items-center gap-3 px-6 py-5 border-b border-surface-700">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                        <SparklesIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="font-display font-bold text-white text-sm">PM Internship</p>
                        <p className="text-xs text-slate-400">AI Platform</p>
                    </div>
                    <button
                        className="ml-auto lg:hidden text-slate-400 hover:text-white"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {navItems.map(({ to, icon: Icon, label, end, badge }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={end}
                            className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200 group
                ${isActive
                                    ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30'
                                    : 'text-slate-400 hover:bg-surface-700 hover:text-white'
                                }
              `}
                        >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            <span className="flex-1">{label}</span>
                            {badge && (
                                <span className="bg-gradient-to-r from-violet-500 to-pink-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-tight">
                                    {badge}
                                </span>
                            )}
                        </NavLink>
                    ))}
                </nav>


                {/* User Profile */}
                <div className="p-3 border-t border-surface-700">
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface-700/50">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-white">
                                {user?.firstName?.[0]}{user?.lastName?.[0]}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user?.fullName || `${user?.firstName} ${user?.lastName}`}</p>
                            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="text-slate-400 hover:text-red-400 transition-colors"
                            title="Logout"
                        >
                            <ArrowRightOnRectangleIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar */}
                <header className="h-16 bg-surface-800 border-b border-surface-700 flex items-center px-4 lg:px-6 gap-4">
                    <button
                        className="lg:hidden text-slate-400 hover:text-white transition-colors"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Bars3Icon className="w-6 h-6" />
                    </button>

                    {/* Marquee Ticker */}
                    <div className="flex-1 overflow-hidden mx-3 hidden sm:block">
                        <div style={{
                            display: 'flex',
                            overflow: 'hidden',
                            maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
                            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
                        }}>
                            <div style={{
                                display: 'flex',
                                gap: '0',
                                animation: 'marquee-scroll 30s linear infinite',
                                whiteSpace: 'nowrap',
                            }}>
                                {[
                                    '🎯 Apply now for PM Internship Scheme 2025',
                                    '🏢 500+ seats across India\'s top companies',
                                    '🤖 AI-powered candidate matching & ranking',
                                    '💰 ₹5,000/month stipend for selected interns',
                                    '📅 Application deadline approaching — don\'t miss out!',
                                    '🌟 Partner companies: Infosys · Tata Motors · Reliance · HDFC Bank · Wipro',
                                    '🚀 Upload your CV to get AI recommendations instantly',
                                ].concat([
                                    '🎯 Apply now for PM Internship Scheme 2025',
                                    '🏢 500+ seats across India\'s top companies',
                                    '🤖 AI-powered candidate matching & ranking',
                                ]).map((msg, i) => (
                                    <span key={i} style={{
                                        color: '#94a3b8',
                                        fontSize: '0.75rem',
                                        fontWeight: 500,
                                        paddingRight: '3rem',
                                    }}>
                                        {msg}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* AI Chat Button */}
                    <button
                        onClick={() => setChatOpen(!chatOpen)}
                        className="btn btn-accent btn-sm gap-1.5"
                    >
                        <SparklesIcon className="w-4 h-4" />
                        AI Assistant
                    </button>

                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                        <span className="text-sm font-bold text-white">
                            {user?.firstName?.[0]}
                        </span>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    <div className="max-w-7xl mx-auto animate-fade-in">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* AI Chat Widget */}
            {chatOpen && <AIChatWidget onClose={() => setChatOpen(false)} />}
        </div>
    );
}
