import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../lib/axios'
import toast from 'react-hot-toast'
import StatusBadge from '../../components/StatusBadge'
import { FileText, Search, ClipboardList, Plus, ArrowRight, Bell, Sparkles } from 'lucide-react'

function QuickAction({ icon: Icon, title, description, to, color }) {
    const navigate = useNavigate()
    return (
        <button
            onClick={() => navigate(to)}
            className="group relative overflow-hidden card border-none bg-white p-6 text-left hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
            <div className={`absolute top-0 right-0 w-24 h-24 -mt-8 -mr-8 bg-gradient-to-br ${color} opacity-10 rounded-full transition-transform group-hover:scale-150 duration-500`} />
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br ${color} text-white shadow-lg`}>
                <Icon size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">{description}</p>
            <div className="flex items-center text-primary-600 text-sm font-bold group-hover:gap-2 transition-all">
                Get Started <ArrowRight size={16} />
            </div>
        </button>
    )
}

export default function StudentDashboard() {
    const navigate = useNavigate()
    const [stats, setStats] = useState(null)
    const [recentReports, setRecentReports] = useState([])
    const [loading, setLoading] = useState(true)

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
                <div className="h-20 bg-white rounded-2xl w-2/3" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-48 bg-white rounded-2xl" />
                    <div className="h-48 bg-white rounded-2xl" />
                </div>
                <div className="h-64 bg-white rounded-2xl" />
            </div>
        )
    }

    return (
        <div className="space-y-10 pb-10">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-primary-600 to-indigo-700 p-8 md:p-12 text-white shadow-2xl">
                <div className="absolute top-0 right-0 p-8 opacity-20 transform rotate-12">
                    <Sparkles size={120} />
                </div>
                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">
                        Find what you lost,<br /> faster than ever.
                    </h1>
                    <p className="text-primary-100 text-lg md:text-xl font-medium mb-8 leading-relaxed">
                        The campus-wide network for reuniting students with their belonging.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20">
                            <p className="text-2xl font-black">{stats?.activeReports || 0}</p>
                            <p className="text-xs uppercase tracking-widest font-bold opacity-80 text-white">Active Reports</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20">
                            <p className="text-2xl font-black">{stats?.recentFound || 0}</p>
                            <p className="text-xs uppercase tracking-widest font-bold opacity-80">New Items Found</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <QuickAction
                    icon={Plus}
                    title="Report Lost Item"
                    description="Lost something? File a report now with a photo and location to notify campus authorities."
                    to="/student/report-lost"
                    color="from-primary-500 to-primary-700"
                />
                <QuickAction
                    icon={Search}
                    title="Browse Found Inventory"
                    description="Check the latest items recovered on campus. Your missing item might already be here!"
                    to="/student/inventory"
                    color="from-indigo-500 to-purple-600"
                />
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Bell size={20} className="text-primary-600" /> My Recent Reports
                        </h2>
                        <button
                            onClick={() => navigate('/student/my-reports')}
                            className="text-sm font-bold text-primary-600 hover:text-primary-700"
                        >
                            View All →
                        </button>
                    </div>

                    <div className="card p-0 overflow-hidden border-none shadow-sm">
                        {recentReports.length === 0 ? (
                            <div className="px-6 py-12 text-center bg-white rounded-2xl">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">📝</div>
                                <h3 className="font-bold text-gray-800">No reports yet</h3>
                                <p className="text-sm text-gray-500 mt-1">Once you report something, it will appear here.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50 bg-white rounded-2xl">
                                {recentReports.map((report) => (
                                    <div
                                        key={report.id}
                                        className="p-5 flex items-center justify-between hover:bg-gray-50/80 transition-colors group cursor-pointer"
                                        onClick={() => navigate('/student/my-reports')}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gray-50 text-2xl flex items-center justify-center border border-gray-100 group-hover:scale-110 transition-transform">
                                                {report.category?.icon || '📦'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 line-clamp-1">{report.item_name}</p>
                                                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{new Date(report.created_at).toLocaleDateString()}</p>
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
                    <h2 className="text-xl font-bold text-gray-900">How it works</h2>
                    <div className="card space-y-6 bg-white border-none shadow-sm p-6 rounded-[2rem]">
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-black shrink-0">1</div>
                            <div>
                                <h4 className="font-bold text-gray-900 text-sm">Report</h4>
                                <p className="text-xs text-gray-500 leading-relaxed mt-1">Provide details and photos of the item you lost.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-black shrink-0">2</div>
                            <div>
                                <h4 className="font-bold text-gray-900 text-sm">Review</h4>
                                <p className="text-xs text-gray-500 leading-relaxed mt-1">Authorities cross-check your report with found items.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center font-black shrink-0">3</div>
                            <div>
                                <h4 className="font-bold text-gray-900 text-sm">Reunite</h4>
                                <p className="text-xs text-gray-500 leading-relaxed mt-1">Receive a notification and claim your item at the office.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
