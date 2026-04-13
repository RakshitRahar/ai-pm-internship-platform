import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

// Pages
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';

// Student pages
import StudentDashboard from '@/pages/student/StudentDashboard';
import StudentProfile from '@/pages/student/StudentProfile';
import StudentApplications from '@/pages/student/StudentApplications';
import InternshipsPage from '@/pages/student/InternshipsPage';
import CVBuilderPage from '@/pages/student/CVBuilderPage';

// Admin pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminInternships from '@/pages/admin/AdminInternships';
import AdminCandidates from '@/pages/admin/AdminCandidates';
import AdminAllocation from '@/pages/admin/AdminAllocation';
import AdminUsers from '@/pages/admin/AdminUsers';

// Layout
import StudentLayout from '@/components/layout/StudentLayout';
import AdminLayout from '@/components/layout/AdminLayout';

// Route guards
const ProtectedRoute = ({ children, role }) => {
    const { user, token } = useAuthStore();
    if (!token || !user) return <Navigate to="/login" replace />;
    if (role && user.role !== role) {
        return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
    }
    return children;
};

const PublicRoute = ({ children }) => {
    const { user, token } = useAuthStore();
    if (token && user) {
        return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
    }
    return children;
};

export default function App() {
    return (
        <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

            {/* Student Routes */}
            <Route path="/dashboard" element={
                <ProtectedRoute role="student">
                    <StudentLayout />
                </ProtectedRoute>
            }>
                <Route index element={<StudentDashboard />} />
                <Route path="profile" element={<StudentProfile />} />
                <Route path="applications" element={<StudentApplications />} />
                <Route path="internships" element={<InternshipsPage />} />
                <Route path="cv-builder" element={<CVBuilderPage />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={
                <ProtectedRoute role="admin">
                    <AdminLayout />
                </ProtectedRoute>
            }>
                <Route index element={<AdminDashboard />} />
                <Route path="internships" element={<AdminInternships />} />
                <Route path="candidates" element={<AdminCandidates />} />
                <Route path="allocation" element={<AdminAllocation />} />
                <Route path="users" element={<AdminUsers />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
