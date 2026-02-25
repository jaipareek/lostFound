import { useState, useEffect } from 'react'
import api from '../../lib/axios'
import toast from 'react-hot-toast'
import EmptyState from '../../components/EmptyState'
import { TableRowSkeleton } from '../../components/LoadingSkeleton'
import {
    History,
    User,
    Clock,
    Shield,
    PlusCircle,
    Trash2,
    RefreshCcw,
    Bell,
    CheckCircle,
    XCircle,
    AlertTriangle
} from 'lucide-react'

export default function ActivityLogs() {
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [limit, setLimit] = useState(50)

    useEffect(() => {
        fetchLogs()
    }, [limit])

    const fetchLogs = async () => {
        setLoading(true)
        try {
            const { data } = await api.get('/logs', { params: { limit } })
            setLogs(data.logs || [])
        } catch (err) {
            toast.error('Failed to load activity logs')
        } finally {
            setLoading(false)
        }
    }

    const getActionStyles = (action) => {
        switch (action) {
            case 'USER_CREATED': return { icon: PlusCircle, color: 'text-green-600', bg: 'bg-green-50', label: 'New User' }
            case 'USER_DELETED': return { icon: Trash2, color: 'text-red-600', bg: 'bg-red-50', label: 'User Deleted' }
            case 'USER_ROLE_CHANGED': return { icon: Shield, color: 'text-purple-600', bg: 'bg-purple-50', label: 'Role Update' }
            case 'FOUND_ITEM_ADDED': return { icon: PlusCircle, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Item Added' }
            case 'CLAIM_APPROVED': return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: 'Claim approved' }
            case 'CLAIM_REJECTED': return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', label: 'Claim Rejected' }
            case 'REPORT_CLOSED': return { icon: Bell, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Report Closed' }
            default: return { icon: History, color: 'text-gray-400', bg: 'bg-gray-50', label: action.replace(/_/g, ' ') }
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <History className="text-primary-600" /> Activity Logs
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">System audit trail and platform events</p>
                </div>
                <button
                    onClick={fetchLogs}
                    className="btn bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                    disabled={loading}
                >
                    <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} /> Refresh
                </button>
            </div>

            <div className="card p-0 overflow-hidden border border-gray-100 bg-white shadow-sm">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Event</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Performer</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Details</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array.from({ length: 10 }).map((_, i) => <TableRowSkeleton key={i} cols={4} />)
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="4">
                                        <div className="py-20">
                                            <EmptyState
                                                icon="📜"
                                                title="No activity yet"
                                                description="Important system events will appear here."
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => {
                                    const styles = getActionStyles(log.action)
                                    return (
                                        <tr key={log.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg ${styles.bg} ${styles.color} flex items-center justify-center shrink-0 shadow-sm border border-black/5`}>
                                                        <styles.icon size={16} />
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-900 uppercase tracking-tight">{styles.label}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-500 uppercase">
                                                        {log.performer?.full_name?.charAt(0) || 'S'}
                                                    </div>
                                                    <p className="text-xs font-bold text-gray-700">{log.performer?.full_name || 'System'}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="max-w-xs xl:max-w-md">
                                                    <p className="text-xs text-gray-500 truncate font-medium">
                                                        {log.metadata ? JSON.stringify(log.metadata).replace(/[{}"]/g, ' ') : `Record ID: ${log.target_id?.slice(0, 8)}...`}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                                    <Clock size={12} />
                                                    {new Date(log.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-gray-50">
                    {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="p-4 space-y-3 animate-pulse">
                                <div className="h-4 bg-gray-100 rounded w-1/3" />
                                <div className="h-3 bg-gray-50 rounded w-full" />
                            </div>
                        ))
                    ) : logs.length === 0 ? (
                        <div className="py-20 px-6">
                            <EmptyState
                                icon="📜"
                                title="No activity yet"
                                description="Important system events will appear here."
                            />
                        </div>
                    ) : (
                        logs.map((log) => {
                            const styles = getActionStyles(log.action)
                            return (
                                <div key={log.id} className="p-4 space-y-3 active:bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-6 h-6 rounded-md ${styles.bg} ${styles.color} flex items-center justify-center`}>
                                                <styles.icon size={12} />
                                            </div>
                                            <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{styles.label}</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-400">{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-500 uppercase">
                                            {log.performer?.full_name?.charAt(0) || 'S'}
                                        </div>
                                        <p className="text-xs font-bold text-gray-700">{log.performer?.full_name || 'System'}</p>
                                    </div>
                                    <p className="text-xs text-gray-500 font-medium leading-relaxed bg-gray-50 p-2 rounded-lg border border-gray-100/50 italic">
                                        {log.metadata ? JSON.stringify(log.metadata).replace(/[{}"]/g, ' ') : `Record ID: ${log.target_id?.slice(0, 8)}...`}
                                    </p>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>

            {!loading && logs.length >= limit && (
                <div className="flex justify-center pt-4">
                    <button
                        onClick={() => setLimit(prev => prev + 50)}
                        className="text-sm font-bold text-primary-600 hover:text-primary-700 bg-primary-50 px-6 py-2 rounded-full transition-all"
                    >
                        Load More Activity
                    </button>
                </div>
            )}
        </div>
    )
}
