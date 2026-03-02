import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import {
    LayoutDashboard, FileText, Package, CheckSquare,
    AlertTriangle, LogOut, Menu, X, Warehouse
} from 'lucide-react'
import { useState, useEffect } from 'react'

const NAV_ITEMS = [
    { to: '/authority/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/authority/lost', icon: FileText, label: 'Lost Reports' },
    { to: '/authority/inventory', icon: Package, label: 'Inventory' },
    { to: '/authority/claims', icon: CheckSquare, label: 'Claims' },
    { to: '/authority/disputes', icon: AlertTriangle, label: 'Disputes' },
]

export default function AuthorityLayout({ children }) {
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
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 font-sans dark-theme">
            {/* Animated background accents */}
            <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-amber-500/[0.04] rounded-full blur-[150px] pointer-events-none animate-pulse-slow" />
            <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-orange-500/[0.03] rounded-full blur-[130px] pointer-events-none animate-breathe" />

            {/* Dark glass navbar */}
            <header className={`sticky top-0 z-50 transition-all duration-500 ${scrolled ? 'bg-slate-900/80 backdrop-blur-2xl shadow-2xl shadow-black/20 border-b border-amber-500/10' : 'bg-slate-900/60 backdrop-blur-xl border-b border-white/5'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-3 shrink-0">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-600 rounded-xl blur-md opacity-50 group-hover:opacity-80 transition-opacity" />
                                <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-white shadow-lg">
                                    <Warehouse size={17} strokeWidth={2.5} />
                                </div>
                            </div>
                            <div className="hidden sm:block">
                                <p className="font-extrabold text-white text-base leading-none tracking-tight">CampusTrace</p>
                                <p className="text-[9px] uppercase tracking-widest bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent font-bold mt-0.5">Authority</p>
                            </div>
                        </div>

                        {/* Desktop nav with underline-glow active */}
                        <nav className="hidden md:flex items-center gap-0.5">
                            {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
                                <NavLink
                                    key={to}
                                    to={to}
                                    className={({ isActive }) =>
                                        `relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${isActive
                                            ? 'text-amber-400 bg-amber-500/10'
                                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                        }`
                                    }
                                >
                                    {({ isActive }) => (
                                        <>
                                            <Icon size={15} strokeWidth={2} />
                                            {label}
                                            {isActive && (
                                                <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full" />
                                            )}
                                        </>
                                    )}
                                </NavLink>
                            ))}
                        </nav>

                        {/* User + Logout */}
                        <div className="flex items-center gap-2">
                            <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                                    {user?.fullName?.charAt(0) || 'A'}
                                </div>
                                <span className="text-sm font-semibold text-slate-300 max-w-[120px] truncate">{user?.fullName}</span>
                            </div>
                            <button onClick={handleLogout} className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200" title="Sign out">
                                <LogOut size={18} />
                            </button>
                            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-xl text-slate-400 hover:bg-white/10 transition-colors">
                                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Nav */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-white/5 bg-slate-900/95 backdrop-blur-2xl px-4 py-3 space-y-1 animate-fade-in-down">
                        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
                            <NavLink
                                key={to}
                                to={to}
                                onClick={() => setMobileMenuOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${isActive
                                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
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

            {/* Content with subtle light overlay */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter relative z-10">
                {children}
            </main>
        </div>
    )
}
