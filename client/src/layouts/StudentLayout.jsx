import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import {
    Search, FileText, ClipboardList, LogOut, Menu, X
} from 'lucide-react'
import { useState } from 'react'

const NAV_ITEMS = [
    { to: '/student/inventory', icon: Search, label: 'Found Items' },
    { to: '/student/report-lost', icon: FileText, label: 'Report Lost' },
    { to: '/student/my-reports', icon: ClipboardList, label: 'My Reports' },
]

export default function StudentLayout({ children }) {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const handleLogout = () => {
        logout()
        toast.success('Logged out')
        navigate('/login')
    }

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-900/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100
                flex flex-col transition-all duration-300 ease-in-out shadow-2xl lg:shadow-none
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Brand */}
                <div className="flex items-center gap-3 px-8 py-8">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-primary-200">
                        <Search size={22} strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="font-black text-gray-900 text-lg leading-none tracking-tight">CampusFlow</p>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-primary-600 font-bold mt-1">Student Portal</p>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-4 py-4 space-y-1.5">
                    {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${isActive
                                    ? 'bg-primary-50 text-primary-700 shadow-sm border border-primary-100/50'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                                    {label}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* User info + logout */}
                <div className="p-6">
                    <div className="bg-gray-50 rounded-2xl p-4 mb-4 border border-gray-100/50">
                        <p className="text-sm font-bold text-gray-900 truncate">{user?.fullName}</p>
                        <p className="text-[10px] text-gray-400 font-medium truncate mt-0.5">{user?.email}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-bold text-red-500 rounded-xl hover:bg-red-50 transition-all duration-200 border border-transparent hover:border-red-100"
                    >
                        <LogOut size={16} strokeWidth={2.5} />
                        Sign out
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Topbar (mobile) */}
                <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-600"
                    >
                        <Menu size={20} />
                    </button>
                    <span className="font-black text-gray-900 tracking-tight">CampusFlow</span>
                    <div className="w-10" />
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-10 lg:p-12 scroll-smooth">
                    <div className="max-w-7xl mx-auto animate-fade-in">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
