import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../lib/axios'
import toast from 'react-hot-toast'
import StatusBadge from '../../components/StatusBadge'
import { FileText, Search, Plus, ArrowRight, Bell, Sparkles, TrendingUp } from 'lucide-react'

/* Animated counter hook */
function useCountUp(target, duration = 1200) {
    const [count, setCount] = useState(0)
    const ref = useRef(null)
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

function QuickAction({ icon: Icon, title, description, to, gradient }) {
    const navigate = useNavigate()
    return (
        <button
            onClick={() => navigate(to)}
            className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-left border border-slate-100/80 hover-lift transition-all duration-300 shadow-sm hover:shadow-xl"
        >
            <div className={`absolute top-0 right-0 w-40 h-40 -mt-16 -mr-16 bg-gradient-to-br ${gradient} opacity-[0.05] rounded-full transition-transform group-hover:scale-[2.5] duration-700`} />
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br ${gradient} text-white shadow-lg relative`}>
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} blur-lg opacity-30 group-hover:opacity-50 transition-opacity`} />
                <Icon size={22} className="relative z-10" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">{title}</h3>
            <p className="text-sm text-slate-500 mb-4 leading-relaxed">{description}</p>
            <div className="flex items-center text-indigo-600 text-sm font-bold gap-1 group-hover:gap-2 transition-all">
                Get Started <ArrowRight size={15} />
            </div>
        </button>
    )
}

export default function StudentDashboard() {
    const navigate = useNavigate()
    const [stats, setStats] = useState(null)
    const [recentReports, setRecentReports] = useState([])
    const [loading, setLoading] = useState(true)

    const activeCount = useCountUp(stats?.activeReports, 800)
    const foundCount = useCountUp(stats?.recentFound, 800)

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true)
            try {
                const [reportsRes, foundRes] = await Promise.all([
                    api.get('/lost-reports/mine'),
                    api.get('/found-items?status=AVAILABLE')
                ])
                const myReports = reportsRes.data.reports || []
                const availableItems = foundRes.data.items || []
                setStats({
                    activeReports: myReports.filter(r => r.status === 'REPORTED').length,
                    totalSubmissions: myReports.length,
                    recentFound: availableItems.length
                })
                setRecentReports(myReports.slice(0, 3))
            } catch (err) {
                toast.error('Could not refresh dashboard stats')
            } finally {
                setLoading(false)
            }
        }
        fetchDashboardData()
    }, [])

    if (loading) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="h-48 bg-slate-200/40 rounded-3xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-44 bg-slate-200/40 rounded-2xl" />
                    <div className="h-44 bg-slate-200/40 rounded-2xl" />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8 pb-8">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl p-8 md:p-10 text-white shadow-xl animate-fade-in-up stagger-1">
                {/* Mesh gradient bg */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 rounded-3xl" />
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-[80px] -mr-20 -mt-20" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-300/20 rounded-full blur-[60px] -ml-10 -mb-10" />
                </div>
                <div className="absolute top-0 right-0 p-8 opacity-[0.07]">
                    <Sparkles size={140} strokeWidth={1} />
                </div>
                <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold mb-5">
                        <Sparkles size={12} /> Welcome back
                    </div>
                    <h1 className="text-2xl md:text-4xl font-black mb-3 tracking-tight leading-tight">
                        Find what you lost,<br />faster than ever.
                    </h1>
                    <p className="text-indigo-100 text-sm md:text-base font-medium mb-8 leading-relaxed opacity-90">
                        The campus-wide intelligence network for reuniting students with their belongings.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        {[
                            { val: activeCount, label: 'Active Reports' },
                            { val: foundCount, label: 'Items Found' },
                        ].map((s, i) => (
                            <div key={i} className="bg-white/[0.1] backdrop-blur-md px-5 py-3 rounded-xl border border-white/20 hover:bg-white/[0.15] transition-all">
                                <p className="text-2xl font-black leading-none">{s.val}</p>
                                <p className="text-[10px] uppercase tracking-widest font-bold opacity-70 mt-1">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in-up stagger-2">
                <QuickAction
                    icon={Plus}
                    title="Report Lost Item"
                    description="File a report with a photo and location to notify campus authorities."
                    to="/student/report-lost"
                    gradient="from-blue-500 to-indigo-600"
                />
                <QuickAction
                    icon={Search}
                    title="Browse Found Inventory"
                    description="Check the latest items recovered on campus. Yours might be here!"
                    to="/student/inventory"
                    gradient="from-violet-500 to-purple-600"
                />
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up stagger-3">
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Bell size={18} className="text-indigo-500" /> My Recent Reports
                        </h2>
                        <button
                            onClick={() => navigate('/student/my-reports')}
                            className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-1"
                        >
                            View All <ArrowRight size={14} />
                        </button>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100/80 overflow-hidden shadow-sm">
                        {recentReports.length === 0 ? (
                            <div className="px-6 py-14 text-center">
                                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl border border-slate-100">📝</div>
                                <h3 className="font-bold text-slate-800 text-sm">No reports yet</h3>
                                <p className="text-xs text-slate-400 mt-1">Once you report something, it will appear here.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {recentReports.map((report) => (
                                    <div
                                        key={report.id}
                                        className="p-4 flex items-center justify-between hover:bg-blue-50/30 transition-colors group cursor-pointer"
                                        onClick={() => navigate('/student/my-reports')}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 text-xl flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-transform shrink-0">
                                                {report.category?.icon || '📦'}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-slate-900 text-sm truncate group-hover:text-indigo-600 transition-colors">{report.item_name}</p>
                                                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{new Date(report.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <StatusBadge status={report.status} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-slate-900">How it works</h2>
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100/80 shadow-sm p-6 space-y-5">
                        {[
                            { n: '1', title: 'Report', desc: 'Provide details and photos of the item you lost.', color: 'from-blue-500 to-indigo-600' },
                            { n: '2', title: 'Review', desc: 'Authorities cross-check your report with found items.', color: 'from-violet-500 to-purple-600' },
                            { n: '3', title: 'Reunite', desc: 'Receive a notification and claim your item at the office.', color: 'from-emerald-500 to-green-600' },
                        ].map(({ n, title, desc, color }) => (
                            <div key={n} className="flex gap-3.5 group">
                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center font-black text-sm shrink-0 text-white shadow-sm group-hover:scale-110 transition-transform`}>{n}</div>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-sm">{title}</h4>
                                    <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
