import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../lib/axios'
import toast from 'react-hot-toast'
import StatusBadge from '../../components/StatusBadge'
import { FileText, Package, AlertTriangle, CheckCircle, Clock, TrendingUp, MapPin } from 'lucide-react'

function StatCard({ icon: Icon, label, value, color, sub, onClick }) {
    return (
        <div
            onClick={onClick}
            className={`bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100/50 flex items-center gap-5 transition-all duration-300 group ${onClick ? 'cursor-pointer hover:shadow-xl hover:-translate-y-1' : ''}`}
        >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform ${color}`}>
                <Icon size={26} className="text-white" />
            </div>
            <div>
                <p className="text-3xl font-black text-gray-900 tracking-tight leading-none">{value ?? '—'}</p>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-2">{label}</p>
                {sub && <p className="text-[10px] font-bold text-primary-400 mt-1">{sub}</p>}
            </div>
        </div>
    )
}

export default function AuthorityDashboard() {
    const navigate = useNavigate()
    const [stats, setStats] = useState(null)
    const [recent, setRecent] = useState([])
    const [disputes, setDisputes] = useState([])
    const [loading, setLoading] = useState(true)

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

                // Compute stats
                setStats({
                    totalLost: lostReports.length,
                    openReports: lostReports.filter(r => r.status === 'REPORTED').length,
                    totalFound: foundItems.length,
                    available: foundItems.filter(i => i.status === 'AVAILABLE').length,
                    disputes: allDisputes.filter(d => d.status === 'OPEN').length,
                    closed: foundItems.filter(i => i.status === 'CLOSED').length,
                })

                // Recent 5 lost reports
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
            <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-32 bg-white rounded-[2rem] animate-pulse border border-gray-100" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                        <span className="gradient-text">Authority Control</span>
                    </h1>
                    <p className="text-sm text-gray-500 mt-1 font-medium">
                        {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl border border-gray-100 shadow-sm self-start sm:self-center">
                    <Clock size={18} className="text-primary-500" />
                    <span className="text-xs font-black uppercase tracking-widest text-gray-500">Live Traffic</span>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard
                    icon={FileText}
                    label="Lost Reports"
                    value={stats?.totalLost}
                    color="bg-primary-500"
                    sub={`${stats?.openReports} active requests`}
                    onClick={() => navigate('/authority/lost')}
                />
                <StatCard
                    icon={Package}
                    label="Found Vault"
                    value={stats?.totalFound}
                    color="bg-secondary-500"
                    sub={`${stats?.available} items in storage`}
                    onClick={() => navigate('/authority/inventory')}
                />
                <StatCard
                    icon={AlertTriangle}
                    label="Open Disputes"
                    value={stats?.disputes}
                    color={stats?.disputes > 0 ? "bg-orange-500" : "bg-gray-400"}
                    sub={stats?.disputes > 0 ? "High priority" : "All cases resolved"}
                    onClick={() => navigate('/authority/disputes')}
                />
                <StatCard
                    icon={CheckCircle}
                    label="Return Rate"
                    value={stats?.totalFound > 0
                        ? `${Math.round((stats.closed / stats.totalFound) * 100)}%`
                        : '0%'}
                    color="bg-green-500"
                    sub={`${stats?.closed} items returned`}
                />
                <StatCard
                    icon={Clock}
                    label="Claim Queue"
                    value={stats?.openReports} // Assuming open reports need review
                    color="bg-amber-500"
                    sub="Awaiting verification"
                    onClick={() => navigate('/authority/claims')}
                />
                <StatCard
                    icon={TrendingUp}
                    label="Success Meter"
                    value="94"
                    color="bg-purple-500"
                    sub="Campus satisfaction"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Lost Reports */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between px-8 py-6 border-b border-gray-50 bg-gray-50/30">
                        <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                            Recent Reports
                        </h2>
                        <button
                            onClick={() => navigate('/authority/lost')}
                            className="text-[10px] font-black text-primary-600 hover:text-primary-700 uppercase tracking-widest bg-primary-50 px-3 py-1.5 rounded-xl transition-all"
                        >
                            View all
                        </button>
                    </div>
                    {recent.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 opacity-40">
                            <span className="text-4xl mb-4">📄</span>
                            <p className="text-xs font-black uppercase tracking-widest">No reports yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {recent.map((r) => (
                                <div key={r.id} className="flex items-center justify-between px-8 py-5 hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => navigate('/authority/lost')}>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-gray-900 truncate group-hover:text-primary-600 transition-colors">{r.item_name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <MapPin size={12} className="text-gray-300" />
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">{r.lost_location}</p>
                                        </div>
                                    </div>
                                    <StatusBadge status={r.status} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Open Disputes */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between px-8 py-6 border-b border-gray-50 bg-orange-50/20">
                        <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                            <AlertTriangle size={16} className="text-orange-500" /> Open Disputes
                        </h2>
                        <button
                            onClick={() => navigate('/authority/disputes')}
                            className="text-[10px] font-black text-orange-600 hover:text-orange-700 uppercase tracking-widest bg-orange-50 px-3 py-1.5 rounded-xl transition-all"
                        >
                            Manage
                        </button>
                    </div>
                    {disputes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
                                <CheckCircle size={32} className="text-green-500" />
                            </div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No active disputes</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {disputes.map((d) => (
                                <div key={d.id} className="flex items-center gap-4 px-8 py-5 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate('/authority/disputes')}>
                                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 shrink-0 font-black text-xs">
                                        {d.claims?.length || 0}C
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-bold text-gray-900 truncate">
                                            {d.found_item?.item_name || 'Unknown item'}
                                        </p>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">
                                            Vault: {d.found_item?.storage_location || 'Main Storage'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); navigate('/authority/disputes'); }}
                                        className="shrink-0 text-[10px] font-black uppercase tracking-widest bg-white border border-gray-100 text-gray-500 px-3 py-2 rounded-xl hover:bg-primary-600 hover:text-white hover:border-primary-600 transition-all shadow-sm"
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
