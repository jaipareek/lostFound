import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../lib/axios'
import toast from 'react-hot-toast'
import StatusBadge from '../../components/StatusBadge'
import { FileText, Package, AlertTriangle, CheckCircle, Clock, TrendingUp, MapPin, ArrowRight, Zap } from 'lucide-react'

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

function StatCard({ icon: Icon, label, value, gradient, sub, onClick, delay }) {
    return (
        <div
            onClick={onClick}
            className={`relative overflow-hidden bg-slate-800/50 backdrop-blur-sm rounded-2xl p-5 border border-white/5 hover:border-white/10 hover-lift transition-all duration-300 group animate-fade-in-up ${delay} ${onClick ? 'cursor-pointer' : ''}`}
        >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradient} opacity-10 blur-2xl rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-700`} />
            <div className="flex items-center gap-4 relative">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform bg-gradient-to-br ${gradient} text-white`}>
                    <Icon size={22} />
                </div>
                <div>
                    <p className="text-2xl font-black text-white tracking-tight leading-none">{value ?? '—'}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{label}</p>
                </div>
            </div>
            {sub && <p className="text-[11px] font-semibold text-amber-400 mt-3 ml-16">{sub}</p>}
        </div>
    )
}

export default function AuthorityDashboard() {
    const navigate = useNavigate()
    const [stats, setStats] = useState(null)
    const [recent, setRecent] = useState([])
    const [disputes, setDisputes] = useState([])
    const [loading, setLoading] = useState(true)

    const totalLost = useCountUp(stats?.totalLost)
    const totalFound = useCountUp(stats?.totalFound)
    const disputeCount = useCountUp(stats?.disputes)
    const closedCount = useCountUp(stats?.closed)
    const openCount = useCountUp(stats?.openReports)

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true)
            try {
                const [lostRes, foundRes, disputeRes] = await Promise.all([
                    api.get('/lost-reports'),
                    api.get('/found-items'),
                    api.get('/claims/disputes'),
                ])
                const lostReports = lostRes.data.reports || []
                const foundItems = foundRes.data.items || []
                const allDisputes = disputeRes.data.disputes || []

                setStats({
                    totalLost: lostReports.length,
                    openReports: lostReports.filter(r => r.status === 'REPORTED').length,
                    totalFound: foundItems.length,
                    available: foundItems.filter(i => i.status === 'AVAILABLE').length,
                    disputes: allDisputes.filter(d => d.status === 'OPEN').length,
                    closed: foundItems.filter(i => i.status === 'CLOSED').length,
                })
                setRecent(lostReports.slice(0, 5))
                setDisputes(allDisputes.filter(d => d.status === 'OPEN').slice(0, 3))
            } catch {
                toast.error('Failed to load dashboard data')
            } finally {
                setLoading(false)
            }
        }
        fetchAll()
    }, [])

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-28 bg-slate-800/50 rounded-2xl animate-pulse border border-white/5" />
                    ))}
                </div>
            </div>
        )
    }

    const returnRate = stats?.totalFound > 0 ? Math.round((stats.closed / stats.totalFound) * 100) : 0

    return (
        <div className="space-y-8 pb-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in-up stagger-1">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">
                        <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Authority Control</span>
                    </h1>
                    <p className="text-sm text-slate-400 mt-1 font-medium">
                        {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <div className="flex items-center gap-2.5 bg-slate-800/60 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/5 self-start">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Live</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <StatCard icon={FileText} label="Lost Reports" value={totalLost} gradient="from-indigo-500 to-indigo-700" sub={`${stats?.openReports} active`} onClick={() => navigate('/authority/lost')} delay="stagger-1" />
                <StatCard icon={Package} label="Found Vault" value={totalFound} gradient="from-emerald-500 to-teal-600" sub={`${stats?.available} available`} onClick={() => navigate('/authority/inventory')} delay="stagger-2" />
                <StatCard icon={AlertTriangle} label="Disputes" value={disputeCount} gradient={stats?.disputes > 0 ? "from-orange-500 to-amber-600" : "from-gray-500 to-gray-600"} sub={stats?.disputes > 0 ? "Needs attention" : "All clear"} onClick={() => navigate('/authority/disputes')} delay="stagger-3" />
                <StatCard icon={CheckCircle} label="Return Rate" value={`${returnRate}%`} gradient="from-green-500 to-emerald-600" sub={`${closedCount} returned`} delay="stagger-4" />
                <StatCard icon={Clock} label="Claim Queue" value={openCount} gradient="from-amber-500 to-orange-600" sub="Awaiting verification" onClick={() => navigate('/authority/claims')} delay="stagger-5" />
                <StatCard icon={TrendingUp} label="Satisfaction" value="94" gradient="from-purple-500 to-violet-600" sub="Campus score" delay="stagger-6" />
            </div>

            {/* Recovery Progress */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/5 animate-fade-in-up stagger-3">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2"><Zap size={14} className="text-amber-400" /> Recovery Progress</h3>
                    <span className="text-sm font-black bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">{returnRate}%</span>
                </div>
                <div className="w-full h-3 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-1000 ease-out relative"
                        style={{ width: `${returnRate}%` }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer-sweep" />
                    </div>
                </div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">{closedCount} of {totalFound} items successfully returned</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up stagger-4">
                {/* Recent Lost Reports */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
                        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <FileText size={14} className="text-indigo-400" /> Recent Reports
                        </h2>
                        <button onClick={() => navigate('/authority/lost')} className="text-[10px] font-bold text-amber-400 hover:text-amber-300 uppercase tracking-widest flex items-center gap-1 transition-all">
                            View all <ArrowRight size={10} />
                        </button>
                    </div>
                    {recent.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-14 opacity-50">
                            <span className="text-3xl mb-3">📄</span>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No reports yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {recent.map((r) => (
                                <div key={r.id} className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors group cursor-pointer" onClick={() => navigate('/authority/lost')}>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-white truncate group-hover:text-amber-400 transition-colors">{r.item_name}</p>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <MapPin size={11} className="text-slate-600" />
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">{r.lost_location}</p>
                                        </div>
                                    </div>
                                    <StatusBadge status={r.status} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Open Disputes */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
                        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <AlertTriangle size={14} className="text-orange-400" /> Open Disputes
                        </h2>
                        <button onClick={() => navigate('/authority/disputes')} className="text-[10px] font-bold text-amber-400 hover:text-amber-300 uppercase tracking-widest flex items-center gap-1 transition-all">
                            Manage <ArrowRight size={10} />
                        </button>
                    </div>
                    {disputes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-14">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-3">
                                <CheckCircle size={28} className="text-emerald-400" />
                            </div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No active disputes</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {disputes.map((d) => (
                                <div key={d.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => navigate('/authority/disputes')}>
                                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 shrink-0 font-black text-xs border border-orange-500/20">
                                        {d.claims?.length || 0}C
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-bold text-white truncate">{d.found_item?.item_name || 'Unknown item'}</p>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                                            Vault: {d.found_item?.storage_location || 'Main Storage'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); navigate('/authority/disputes') }}
                                        className="shrink-0 text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-2 rounded-lg hover:bg-amber-500 hover:text-white transition-all"
                                    >
                                        Resolve
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
