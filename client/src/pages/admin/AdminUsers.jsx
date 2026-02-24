import { useEffect, useState } from 'react';
import { adminAPI } from '@/services/api';
import {
    MagnifyingGlassIcon, UserCircleIcon,
    ShieldCheckIcon, ShieldExclamationIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [pagination, setPagination] = useState({});

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data } = await adminAPI.getUsers({ role: roleFilter || undefined, search: search || undefined });
            setUsers(data.users);
            setPagination(data.pagination);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const t = setTimeout(fetchUsers, 400);
        return () => clearTimeout(t);
    }, [search, roleFilter]);

    const handleToggleActive = async (userId, currentStatus) => {
        try {
            await adminAPI.toggleUserActive(userId);
            setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, isActive: !currentStatus } : u));
            toast.success(`User ${currentStatus ? 'deactivated' : 'activated'}`);
        } catch {
            toast.error('Failed to update user status');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="section-title">User Management</h1>
                <p className="section-subtitle">View and manage all registered users</p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 max-w-sm">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input pl-10"
                        placeholder="Search by name or email..."
                    />
                </div>
                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="input w-auto">
                    <option value="">All Roles</option>
                    <option value="student">Students</option>
                    <option value="admin">Admins</option>
                </select>
            </div>

            {/* Stats */}
            <div className="flex gap-4 text-sm text-slate-400">
                <span>Total: <strong className="text-white">{pagination.total || 0}</strong></span>
                <span>Showing: <strong className="text-white">{users.length}</strong></span>
            </div>

            {loading ? (
                <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" /></div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                {['User', 'Role', 'University', 'CV', 'Joined', 'Status', 'Actions'].map((h) => (
                                    <th key={h} className="th">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-700">
                            {users.map((user) => (
                                <tr key={user._id} className="tr-hover">
                                    <td className="td">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                                                <span className="text-xs font-bold text-white">{user.firstName?.[0]}{user.lastName?.[0]}</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-white">{user.firstName} {user.lastName}</p>
                                                <p className="text-xs text-slate-400">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="td">
                                        <span className={`badge ${user.role === 'admin' ? 'badge-purple' : 'badge-blue'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="td text-slate-300 text-sm">{user.university || '—'}</td>
                                    <td className="td">
                                        {user.cv?.filename ? (
                                            <span className="badge badge-green text-xs">Uploaded</span>
                                        ) : (
                                            <span className="badge badge-gray text-xs">None</span>
                                        )}
                                    </td>
                                    <td className="td text-slate-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td className="td">
                                        <span className={`badge text-xs ${user.isActive ? 'badge-green' : 'badge-red'}`}>
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="td">
                                        <button
                                            onClick={() => handleToggleActive(user._id, user.isActive)}
                                            className={`text-slate-400 hover:${user.isActive ? 'text-red-400' : 'text-emerald-400'} transition-colors`}
                                            title={user.isActive ? 'Deactivate user' : 'Activate user'}
                                        >
                                            {user.isActive ? <ShieldExclamationIcon className="w-4 h-4" /> : <ShieldCheckIcon className="w-4 h-4" />}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {users.length === 0 && (
                        <div className="text-center py-12 text-slate-400">No users found</div>
                    )}
                </div>
            )}
        </div>
    );
}
