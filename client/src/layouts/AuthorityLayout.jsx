import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import {
    LayoutDashboard, FileText, Package, CheckSquare,
    AlertTriangle, LogOut, Menu, Warehouse
} from 'lucide-react'
import { useState } from 'react'

const NAV_ITEMS = [
    { to: '/authority/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/authority/lost', icon: FileText, label: 'Lost Reports' },
    { to: '/authority/inventory', icon: Package, label: 'Inventory' },
    { to: '/authority/claims', icon: CheckSquare, label: 'Claims' },
    {
        to: '/authority/disputes', icon: AlertTriangle, label: 'Disputes',
        badge: true
    }, // will show count badge later
]

export default function AuthorityLayout({ children }) {
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
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-yellow-900/20">
                        <Warehouse size={22} strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="font-black text-white text-lg leading-none tracking-tight">CampusFlow</p>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-yellow-400 font-bold mt-1">Authority Hub</p>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                    {NAV_ITEMS.map(({ to, icon: Icon, label, badge }) => (
                        <NavLink
                            key={to}
                            to={to}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${isActive
                                    ? 'bg-yellow-600 text-white shadow-lg shadow-yellow-600/20'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                                    <span className="flex-1">{label}</span>
                                    {badge && (
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${isActive ? 'bg-white/20 text-white' : 'bg-orange-500/20 text-orange-400'
                                            }`}>
                                            !!
                                        </span>
                                    )}
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
                <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-600"
                    >
                        <Menu size={20} />
                    </button>
                    <span className="font-black text-gray-900 tracking-tight">Authority</span>
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
