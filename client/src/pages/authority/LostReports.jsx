import { useState, useEffect, useCallback } from 'react'
import api from '../../lib/axios'
import toast from 'react-hot-toast'
import StatusBadge from '../../components/StatusBadge'
import SearchBar from '../../components/SearchBar'
import ConfirmDialog from '../../components/ConfirmDialog'
import EmptyState from '../../components/EmptyState'
import { TableRowSkeleton } from '../../components/LoadingSkeleton'
import { MapPin, Calendar, User, ChevronDown, ChevronUp, X, CheckCircle } from 'lucide-react'

const STATUS_TABS = ['ALL', 'REPORTED', 'CLOSED', 'REJECTED']

function ReportRow({ report, onAction }) {
    const [expanded, setExpanded] = useState(false)

    return (
        <>
            {/* Desktop Table Row */}
            <tr
                className="hidden md:table-row hover:bg-gray-50/50 cursor-pointer transition-colors group"
                onClick={() => setExpanded(e => !e)}
            >
                <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-xl border border-gray-100 transition-transform group-hover:scale-110">
                            {report.category?.icon || '📄'}
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 leading-tight">{report.item_name}</p>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">{report.category?.name}</p>
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center text-[10px] font-black border border-primary-100">
                            {report.reporter?.full_name?.charAt(0) || 'U'}
                        </div>
                        <span className="text-xs font-bold text-gray-700">{report.reporter?.full_name || 'Unknown'}</span>
                    </div>
                </td>
                <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                        <MapPin size={14} className="text-primary-400" />
                        <span className="truncate max-w-[150px]">{report.lost_location}</span>
                    </div>
                </td>
                <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold uppercase tracking-wider">
                        <Calendar size={14} />
                        {new Date(report.lost_datetime).toLocaleDateString()}
                    </div>
                </td>
                <td className="px-6 py-4">
                    <StatusBadge status={report.status} />
                </td>
                <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                    {report.status === 'REPORTED' ? (
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => onAction(report.id, 'CLOSED')}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-xl transition-all"
                                title="Close Report"
                            >
                                <CheckCircle size={18} />
                            </button>
                            <button
                                onClick={() => onAction(report.id, 'REJECTED')}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                title="Reject Report"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    ) : (
                        <button className="p-2 text-gray-300 hover:text-gray-500 rounded-xl transition-all">
                            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                    )}
                </td>
            </tr>

            {/* Mobile Card Row */}
            <tr className="md:hidden">
                <td colSpan={6} className="px-4 py-3">
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100/50 space-y-4">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-2xl border border-gray-100">
                                    {report.category?.icon || '📄'}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 leading-tight">{report.item_name}</p>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                                        {report.reporter?.full_name || 'Anonymous'}
                                    </p>
                                </div>
                            </div>
                            <StatusBadge status={report.status} />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100/50">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Lost at</p>
                                <p className="text-xs font-bold text-gray-700 truncate">{report.lost_location}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100/50">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Lost on</p>
                                <p className="text-xs font-bold text-gray-700">{new Date(report.lost_datetime).toLocaleDateString()}</p>
                            </div>
                        </div>

                        {report.description && (
                            <p className="text-xs text-gray-500 font-medium leading-relaxed bg-gray-50/50 p-3 rounded-2xl border border-gray-100/50 italic">
                                "{report.description}"
                            </p>
                        )}

                        {report.status === 'REPORTED' && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => onAction(report.id, 'CLOSED')}
                                    className="flex-1 py-3 bg-green-50 text-green-700 rounded-2xl text-xs font-black uppercase tracking-widest active:bg-green-100 transition-colors flex items-center justify-center gap-2"
                                >
                                    <CheckCircle size={14} /> Close
                                </button>
                                <button
                                    onClick={() => onAction(report.id, 'REJECTED')}
                                    className="flex-1 py-3 bg-red-50 text-red-600 rounded-2xl text-xs font-black uppercase tracking-widest active:bg-red-100 transition-colors flex items-center justify-center gap-2"
                                >
                                    <X size={14} /> Reject
                                </button>
                            </div>
                        )}

                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="w-full text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] py-1 flex items-center justify-center gap-1"
                        >
                            {expanded ? 'Hide Details' : 'Show Details'} {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>
                    </div>
                </td>
            </tr>

            {/* Expanded Content (Shared) */}
            {expanded && (
                <tr className="bg-primary-50/10">
                    <td colSpan={6} className="px-4 md:px-8 py-6">
                        <div className="flex flex-col md:flex-row gap-6">
                            {report.image_url && (
                                <div className="shrink-0">
                                    <img
                                        src={report.image_url}
                                        alt={report.item_name}
                                        className="h-48 w-48 object-cover rounded-[2rem] border-2 border-white shadow-xl"
                                    />
                                </div>
                            )}
                            <div className="flex-1 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-1.5">Description</p>
                                        <p className="text-sm text-gray-700 font-medium leading-relaxed">{report.description || 'No description provided'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-1.5">System Audit</p>
                                        <p className="text-xs text-gray-500 font-medium">
                                            Report ID: <span className="font-mono">{report.id}</span>
                                        </p>
                                        <p className="text-xs text-gray-500 font-medium mt-1">
                                            Recorded At: {new Date(report.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    )
}

export default function LostReports() {
    const [reports, setReports] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusTab, setStatusTab] = useState('ALL')

    // Confirm dialog state
    const [confirm, setConfirm] = useState({ open: false, id: null, action: null })
    const [actionLoading, setActionLoading] = useState(false)

    const fetchReports = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (search) params.set('search', search)
            if (statusTab !== 'ALL') params.set('status', statusTab)
            const { data } = await api.get(`/lost-reports?${params}`)
            setReports(data.reports || [])
        } catch {
            toast.error('Failed to load lost reports')
        } finally {
            setLoading(false)
        }
    }, [search, statusTab])

    useEffect(() => {
        const t = setTimeout(fetchReports, 300)
        return () => clearTimeout(t)
    }, [fetchReports])

    const askAction = (id, action) => setConfirm({ open: true, id, action })

    const handleAction = async () => {
        setActionLoading(true)
        try {
            await api.patch(`/lost-reports/${confirm.id}/status`, { status: confirm.action })
            toast.success(`Report ${confirm.action === 'CLOSED' ? 'closed' : 'rejected'} successfully`)
            setConfirm({ open: false, id: null, action: null })
            fetchReports()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Action failed')
        } finally {
            setActionLoading(false)
        }
    }

    const reportedCount = reports.filter(r => r.status === 'REPORTED').length

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">📄 Lost Reports</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        {loading ? 'Loading...' : `${reports.length} report${reports.length !== 1 ? 's' : ''}`}
                        {reportedCount > 0 && !loading && (
                            <span className="ml-2 bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                {reportedCount} open
                            </span>
                        )}
                    </p>
                </div>
            </div>

            {/* Search + Status tabs */}
            <div className="flex flex-col sm:flex-row gap-3">
                <SearchBar
                    value={search}
                    onChange={setSearch}
                    placeholder="Search by item name or location..."
                    className="flex-1 max-w-sm"
                />
                <div className="flex rounded-lg border border-gray-200 overflow-hidden h-10 shrink-0">
                    {STATUS_TABS.map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatusTab(s)}
                            className={`px-3 py-1.5 text-xs font-medium transition-colors ${statusTab === s
                                ? 'bg-primary-600 text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {s.charAt(0) + s.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="card p-0 overflow-hidden border-none shadow-sm bg-transparent">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="hidden md:table-header-group bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-gray-600 font-medium">Item</th>
                                <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-gray-600 font-medium">Reported By</th>
                                <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-gray-600 font-medium">Location</th>
                                <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-gray-600 font-medium">Date Lost</th>
                                <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-gray-600 font-medium">Status</th>
                                <th className="text-right px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-gray-600 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading
                                ? Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={6} />)
                                : reports.length === 0
                                    ? (
                                        <tr>
                                            <td colSpan={6} className="bg-white rounded-[2rem] p-8 border border-gray-100/50">
                                                <EmptyState
                                                    icon="📄"
                                                    title="No reports found"
                                                    description={search ? 'Try a different search term.' : 'No lost reports have been submitted yet.'}
                                                />
                                            </td>
                                        </tr>
                                    )
                                    : reports.map((r) => (
                                        <ReportRow key={r.id} report={r} onAction={askAction} />
                                    ))
                            }
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Confirm dialog */}
            <ConfirmDialog
                isOpen={confirm.open}
                onClose={() => setConfirm({ open: false, id: null, action: null })}
                onConfirm={handleAction}
                loading={actionLoading}
                title={confirm.action === 'CLOSED' ? 'Close this report?' : 'Reject this report?'}
                message={
                    confirm.action === 'CLOSED'
                        ? 'Mark this lost report as Closed — the student will be notified.'
                        : 'Reject this report — it will be marked as invalid.'
                }
                confirmLabel={confirm.action === 'CLOSED' ? 'Yes, Close' : 'Yes, Reject'}
                variant={confirm.action === 'REJECTED' ? 'danger' : 'primary'}
            />
        </div>
    )
}
