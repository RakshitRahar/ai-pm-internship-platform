import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import {
    HomeIcon, BriefcaseIcon, UsersIcon,
    ChartBarIcon, CpuChipIcon, ArrowRightOnRectangleIcon,
    Bars3Icon, XMarkIcon, SparklesIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const navItems = [
    { to: '/admin', icon: HomeIcon, label: 'Dashboard', end: true },
    { to: '/admin/internships', icon: BriefcaseIcon, label: 'Internships' },
    { to: '/admin/candidates', icon: UsersIcon, label: 'Candidates' },
    { to: '/admin/allocation', icon: CpuChipIcon, label: 'AI Allocation' },
    { to: '/admin/users', icon: ChartBarIcon, label: 'Users' },
];

export default function AdminLayout() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        toast.success('Logged out');
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-surface-900 overflow-hidden">
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64
        bg-surface-800 border-r border-surface-700 flex flex-col
        transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                <div className="flex items-center gap-3 px-6 py-5 border-b border-surface-700">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center">
                        <SparklesIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="font-display font-bold text-white text-sm">PM Internship</p>
                        <p className="text-xs text-accent-400 font-medium">Admin Panel</p>
                    </div>
                    <button className="ml-auto lg:hidden text-slate-400" onClick={() => setSidebarOpen(false)}>
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 px-3 py-4 space-y-1">
                    {navItems.map(({ to, icon: Icon, label, end }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={end}
                            className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200
                ${isActive
                                    ? 'bg-accent-600/20 text-accent-400 border border-accent-500/30'
                                    : 'text-slate-400 hover:bg-surface-700 hover:text-white'
                                }
              `}
                        >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-3 border-t border-surface-700">
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface-700/50">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center">
                            <span className="text-sm font-bold text-white">{user?.firstName?.[0]}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user?.firstName} {user?.lastName}</p>
                            <p className="text-xs text-accent-400 font-medium">Administrator</p>
                        </div>
                        <button onClick={handleLogout} className="text-slate-400 hover:text-red-400 transition-colors" title="Logout">
                            <ArrowRightOnRectangleIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-surface-800 border-b border-surface-700 flex items-center px-4 lg:px-6 gap-4">
                    <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(true)}>
                        <Bars3Icon className="w-6 h-6" />
                    </button>
                    <h1 className="font-display font-semibold text-white">Admin Control Panel</h1>
                    <div className="ml-auto flex items-center gap-2">
                        <span className="badge badge-purple">Admin</span>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center">
                            <span className="text-sm font-bold text-white">{user?.firstName?.[0]}</span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    <div className="max-w-7xl mx-auto animate-fade-in">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
