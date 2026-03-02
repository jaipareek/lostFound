import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../lib/axios'
import { Shield, Users, Tag, ScrollText, Trash2, ArrowRight, Activity, Database, Zap, Server } from 'lucide-react'

/* Animated counter hook */
function useCountUp(target, duration = 1000) {
    const [count, setCount] = useState(0)
    useEffect(() => {
        if (target == null) return
        let start = 0
        const step = target / (duration / 16)
        const timer = setInterval(() => {
            start += step
            if (start >= target) { setCount(target); clearInterval(timer) }
            else setCount(Math.floor(start))
        }, 16)
        return () => clearInterval(timer)
    }, [target, duration])
    return count
}

function QuickLink({ icon: Icon, label, to, gradient, delay }) {
    const navigate = useNavigate()
    return (
        <button
            onClick={() => navigate(to)}
            className={`relative overflow-hidden bg-white/[0.03] backdrop-blur-sm rounded-2xl p-5 border border-white/[0.06] hover:border-white/10 hover-lift transition-all duration-300 group text-left animate-fade-in-up ${delay}`}
        >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradient} opacity-5 blur-2xl rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-700`} />
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br ${gradient} text-white shadow-lg group-hover:scale-110 transition-transform relative`}>
                <Icon size={20} />
            </div>
            <p className="text-sm font-bold text-white">{label}</p>
            <div className="flex items-center text-violet-400 text-xs font-bold gap-1 mt-2 group-hover:gap-2 transition-all">
                Open <ArrowRight size={12} />
            </div>
        </button>
    )
}

export default function AdminDashboard() {
    const navigate = useNavigate()
    const [stats, setStats] = useState({ users: 0, categories: 0 })
    const [loading, setLoading] = useState(true)

    const userCount = useCountUp(stats.users)
    const categoryCount = useCountUp(stats.categories)

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true)
            try {
                const [usersRes, catsRes] = await Promise.all([
                    api.get('/admin/users').catch(() => ({ data: { users: [] } })),
                    api.get('/categories').catch(() => ({ data: [] })),
                ])
                setStats({
                    users: usersRes.data.users?.length || 0,
                    categories: Array.isArray(catsRes.data) ? catsRes.data.length : 0,
                })
            } catch {
                // silently fail
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-40 bg-white/[0.03] rounded-3xl border border-white/5" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                    {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-32 bg-white/[0.03] rounded-2xl border border-white/5" />)}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8 pb-8">
            {/* Hero */}
            <div className="relative overflow-hidden rounded-3xl p-8 md:p-10 text-white animate-fade-in-up stagger-1">
                {/* Gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-purple-600/10 to-indigo-600/20 rounded-3xl" />
                <div className="absolute inset-0 border border-white/[0.08] rounded-3xl" />
                <div className="absolute top-0 right-0 w-60 h-60 bg-violet-500/10 blur-[80px] rounded-full -mr-20 -mt-20" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/10 blur-[60px] rounded-full -ml-10 -mb-10" />

                <div className="relative z-10">
                    <div className="flex items-center gap-2.5 mb-4">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-violet-300">System Online</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-2">
                        Admin <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">Command Center</span>
                    </h1>
                    <p className="text-slate-400 text-sm font-medium">
                        Manage users, categories, and system-wide configurations.
                    </p>

                    <div className="flex flex-wrap gap-3 mt-6">
                        {[
                            { val: userCount, label: 'Users' },
                            { val: categoryCount, label: 'Categories' },
                            { val: '99.9%', label: 'Uptime' },
                        ].map((s, i) => (
                            <div key={i} className="bg-white/[0.06] backdrop-blur-md px-5 py-3 rounded-xl border border-white/[0.08] hover:border-white/20 transition-all">
                                <p className="text-2xl font-black leading-none text-white">{s.val}</p>
                                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mt-1">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                <QuickLink icon={Users} label="User Management" to="/admin/users" gradient="from-indigo-500 to-indigo-700" delay="stagger-2" />
                <QuickLink icon={Tag} label="Categories" to="/admin/categories" gradient="from-purple-500 to-violet-600" delay="stagger-3" />
                <QuickLink icon={ScrollText} label="Activity Logs" to="/admin/logs" gradient="from-amber-500 to-orange-600" delay="stagger-4" />
                <QuickLink icon={Trash2} label="Moderate Reports" to="/admin/reports" gradient="from-red-500 to-rose-600" delay="stagger-5" />
            </div>

            {/* System Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in-up stagger-4">
                <div className="bg-white/[0.03] backdrop-blur-sm rounded-2xl p-6 border border-white/[0.06] hover:border-white/10 transition-all">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                            <Activity size={18} className="text-emerald-400" />
                        </div>
                        <h3 className="text-sm font-bold text-white">System Health</h3>
                    </div>
                    <div className="space-y-4">
                        {[
                            { label: 'Server Status', value: 'Operational', status: true },
                            { label: 'API Response', value: '< 200ms', status: false },
                            { label: 'Last Deploy', value: 'Today', status: false },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <span className="text-xs text-slate-500 font-medium">{item.label}</span>
                                {item.status ? (
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> {item.value}
                                    </span>
                                ) : (
                                    <span className="text-xs font-bold text-white">{item.value}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white/[0.03] backdrop-blur-sm rounded-2xl p-6 border border-white/[0.06] hover:border-white/10 transition-all">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
                            <Database size={18} className="text-violet-400" />
                        </div>
                        <h3 className="text-sm font-bold text-white">Database</h3>
                    </div>
                    <div className="space-y-4">
                        {[
                            { label: 'Provider', value: 'Supabase', status: false },
                            { label: 'Connection', value: 'Active', status: true },
                            { label: 'Region', value: 'Asia South', status: false },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <span className="text-xs text-slate-500 font-medium">{item.label}</span>
                                {item.status ? (
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> {item.value}
                                    </span>
                                ) : (
                                    <span className="text-xs font-bold text-white">{item.value}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
