import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Users, Tag, ScrollText, Trash2, LogOut, Menu } from 'lucide-react'
import { useState } from 'react'

const NAV_ITEMS = [
    { to: '/admin/users', icon: Users, label: 'User Management' },
    { to: '/admin/categories', icon: Tag, label: 'Categories' },
    { to: '/admin/logs', icon: ScrollText, label: 'Activity Logs' },
    { to: '/admin/reports', icon: Trash2, label: 'Moderate Reports' },
]

export default function AdminLayout({ children }) {
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
                fixed lg:static inset-y-0 left-0 z-50 w-72 bg-gray-900 
                flex flex-col transition-all duration-300 ease-in-out shadow-2xl lg:shadow-none
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Brand */}
                <div className="flex items-center gap-3 px-8 py-8 border-b border-white/5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-900/20">
                        <Users size={22} strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="font-black text-white text-lg leading-none tracking-tight">CampusFlow</p>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-purple-400 font-bold mt-1">Admin Portal</p>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                    {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${isActive
                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
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
                <div className="p-6 bg-white/5 border-t border-white/5">
                    <div className="mb-4 px-2">
                        <p className="text-sm font-bold text-white truncate">{user?.fullName}</p>
                        <p className="text-[10px] text-gray-500 font-medium truncate mt-0.5">{user?.email}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-bold text-red-400 rounded-xl hover:bg-red-500/10 transition-all duration-200 border border-transparent hover:border-red-500/20"
                    >
                        <LogOut size={16} strokeWidth={2.5} />
                        Sign out
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Topbar (mobile) */}
                <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-gray-900 text-white shadow-xl">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 text-white"
                    >
                        <Menu size={20} />
                    </button>
                    <span className="font-black tracking-tight">Admin Console</span>
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
