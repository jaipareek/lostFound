import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import LandingPage from './pages/LandingPage'

// Layouts
import StudentLayout from './layouts/StudentLayout'
import AuthorityLayout from './layouts/AuthorityLayout'
import AdminLayout from './layouts/AdminLayout'

// Auth
import LoginPage from './pages/LoginPage'

// Student pages (stubs — built in Week 3)
import StudentInventory from './pages/student/StudentInventory'
import ReportLost from './pages/student/ReportLost'
import MyReports from './pages/student/MyReports'

// Authority pages (stubs — built in Week 3)
import AuthDashboard from './pages/authority/AuthorityDashboard'
import LostReports from './pages/authority/LostReports'
import FoundInventory from './pages/authority/FoundInventory'
import ClaimRequests from './pages/authority/ClaimRequests'
import Disputes from './pages/authority/Disputes'

// Admin pages (stubs — built in Week 4)
import UserManagement from './pages/admin/UserManagement'
import Categories from './pages/admin/Categories'
import Locations from './pages/admin/Locations'
import ActivityLogs from './pages/admin/ActivityLogs'
import ModerateReports from './pages/admin/ModerateReports'

// Protected Route
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user } = useAuth()
    if (!user) return <Navigate to="/login" replace />
    if (allowedRoles && !allowedRoles.includes(user.role))
        return <Navigate to="/login" replace />
    return children
}

// Role redirect on "/"
const RoleRedirect = () => {
    const { user } = useAuth()
    if (!user) return <Navigate to="/login" replace />
    if (user.role === 'student') return <Navigate to="/student/inventory" replace />
    if (user.role === 'authority') return <Navigate to="/authority/dashboard" replace />
    if (user.role === 'admin') return <Navigate to="/admin/users" replace />
    return <Navigate to="/login" replace />
}

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* ── Student ── */}
            <Route
                path="/student/*"
                element={
                    <ProtectedRoute allowedRoles={['student']}>
                        <StudentLayout>
                            <Routes>
                                <Route index element={<Navigate to="inventory" replace />} />
                                <Route path="inventory" element={<StudentInventory />} />
                                <Route path="report-lost" element={<ReportLost />} />
                                <Route path="my-reports" element={<MyReports />} />
                            </Routes>
                        </StudentLayout>
                    </ProtectedRoute>
                }
            />

            {/* ── Authority ── */}
            <Route
                path="/authority/*"
                element={
                    <ProtectedRoute allowedRoles={['authority']}>
                        <AuthorityLayout>
                            <Routes>
                                <Route index element={<Navigate to="dashboard" replace />} />
                                <Route path="dashboard" element={<AuthDashboard />} />
                                <Route path="lost" element={<LostReports />} />
                                <Route path="inventory" element={<FoundInventory />} />
                                <Route path="claims" element={<ClaimRequests />} />
                                <Route path="disputes" element={<Disputes />} />
                            </Routes>
                        </AuthorityLayout>
                    </ProtectedRoute>
                }
            />

            {/* ── Admin ── */}
            <Route
                path="/admin/*"
                element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <AdminLayout>
                            <Routes>
                                <Route index element={<Navigate to="users" replace />} />
                                <Route path="users" element={<UserManagement />} />
                                <Route path="categories" element={<Categories />} />
                                <Route path="locations" element={<Locations />} />
                                <Route path="logs" element={<ActivityLogs />} />
                                <Route path="reports" element={<ModerateReports />} />
                            </Routes>
                        </AdminLayout>
                    </ProtectedRoute>
                }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <AppRoutes />
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: '#1f2937',
                            color: '#f9fafb',
                            borderRadius: '8px',
                            fontSize: '14px',
                        },
                        success: { iconTheme: { primary: '#10b981', secondary: '#f9fafb' } },
                        error: { iconTheme: { primary: '#ef4444', secondary: '#f9fafb' } },
                    }}
                />
            </BrowserRouter>
        </AuthProvider>
    )
}
