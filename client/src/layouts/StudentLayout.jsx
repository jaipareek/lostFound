import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Search, FileText, ClipboardList, LogOut, Menu, X, Sparkles } from 'lucide-react'
import { useState, useEffect } from 'react'

const NAV_ITEMS = [
    { to: '/student/inventory', icon: Search, label: 'Found Items' },
    { to: '/student/report-lost', icon: FileText, label: 'Report Lost' },
    { to: '/student/my-reports', icon: ClipboardList, label: 'My Reports' },
]

export default function StudentLayout({ children }) {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10)
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    useEffect(() => { setMobileMenuOpen(false) }, [location.pathname])

    const handleLogout = () => {
        logout()
        toast.success('Logged out')
        navigate('/login')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 font-sans">
            {/* Decorative background orbs */}
            <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-blue-400/5 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-indigo-400/5 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3 pointer-events-none" />

            {/* Glassmorphism Navbar */}
            <header className={`sticky top-0 z-50 transition-all duration-500 ${scrolled ? 'bg-white/70 backdrop-blur-2xl shadow-lg shadow-blue-500/5 border-b border-white/60' : 'bg-white/50 backdrop-blur-xl border-b border-slate-200/50'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo with gradient */}
                        <div className="flex items-center gap-3 shrink-0">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl blur-md opacity-40 group-hover:opacity-70 transition-opacity" />
                                <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                                    <Search size={17} strokeWidth={2.5} />
                                </div>
                            </div>
                            <div className="hidden sm:block">
                                <p className="font-extrabold text-slate-900 text-base leading-none tracking-tight">CampusTrace</p>
                                <p className="text-[9px] uppercase tracking-widest bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-bold mt-0.5">Student Portal</p>
                            </div>
                        </div>

                        {/* Desktop Nav with pill indicator */}
                        <nav className="hidden md:flex items-center gap-1 bg-slate-100/60 backdrop-blur-sm rounded-xl p-1 border border-slate-200/50">
                            {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
                                <NavLink
                                    key={to}
                                    to={to}
                                    className={({ isActive }) =>
                                        `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${isActive
                                            ? 'bg-white text-blue-700 shadow-md shadow-blue-500/10'
                                            : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                                        }`
                                    }
                                >
                                    <Icon size={15} strokeWidth={2} />
                                    {label}
                                </NavLink>
                            ))}
                        </nav>

                        {/* User + Logout */}
                        <div className="flex items-center gap-2">
                            <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/60 backdrop-blur-sm border border-slate-200/50 shadow-sm">
                                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                                    {user?.fullName?.charAt(0) || 'U'}
                                </div>
                                <span className="text-sm font-semibold text-slate-700 max-w-[120px] truncate">{user?.fullName}</span>
                            </div>
                            <button onClick={handleLogout} className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50/80 transition-all duration-200" title="Sign out">
                                <LogOut size={18} />
                            </button>
                            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-white/60 transition-colors">
                                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Nav */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-slate-100/50 bg-white/80 backdrop-blur-2xl px-4 py-3 space-y-1 animate-fade-in-down">
                        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
                            <NavLink
                                key={to}
                                to={to}
                                onClick={() => setMobileMenuOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${isActive
                                        ? 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-700 border border-blue-200/50'
                                        : 'text-slate-500 hover:bg-slate-50'
                                    }`
                                }
                            >
                                <Icon size={16} />
                                {label}
                            </NavLink>
                        ))}
                    </div>
                )}
            </header>

            {/* Page Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter relative z-10">
                {children}
            </main>
        </div>
    )
}
