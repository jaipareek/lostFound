import { useState, useEffect } from 'react'
import api from '../../lib/axios'
import toast from 'react-hot-toast'
import StatusBadge from '../../components/StatusBadge'
import SearchBar from '../../components/SearchBar'
import ConfirmDialog from '../../components/ConfirmDialog'
import EmptyState from '../../components/EmptyState'
import { TableRowSkeleton } from '../../components/LoadingSkeleton'
import {
    Trash2,
    ExternalLink,
    User,
    Calendar,
    AlertTriangle,
    RefreshCcw,
    Search,
    Filter
} from 'lucide-react'

export default function ModerateReports() {
    const [reports, setReports] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('')

    // Delete State
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [reportToDelete, setReportToDelete] = useState(null)
    const [deleting, setDeleting] = useState(false)

    const fetchReports = async () => {
        setLoading(true)
        try {
            const { data } = await api.get('/lost-reports', {
                params: {
                    search,
                    status: statusFilter
                }
            })
            setReports(data.reports || [])
        } catch (err) {
            toast.error('Failed to load reports')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const timer = setTimeout(fetchReports, 400)
        return () => clearTimeout(timer)
    }, [search, statusFilter])

    const handleDelete = async () => {
        if (!reportToDelete) return
        setDeleting(true)
        try {
            await api.delete(`/lost-reports/${reportToDelete.id}`)
            toast.success('Report deleted successfully')
            setShowDeleteConfirm(false)
            fetchReports()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete report')
        } finally {
            setDeleting(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">🛡️ Moderate Reports</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Manage and remove system reports</p>
                </div>
                <button
                    onClick={fetchReports}
                    className="btn bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                >
                    <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} /> Refresh
                </button>
            </div>

            <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex gap-3 text-orange-800 mb-6">
                <AlertTriangle className="shrink-0" size={20} />
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider">Danger Zone</p>
                    <p className="text-xs font-medium leading-relaxed mt-0.5">
                        Deleting a report is permanent and will also remove any associated images from storage. Only delete reports that are spam, duplicates, or explicitly requested by the user.
                    </p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                    <SearchBar
                        value={search}
                        onChange={setSearch}
                        placeholder="Search report name or details..."
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter size={16} className="text-gray-400" />
                    {['', 'REPORTED', 'CLOSED', 'REJECTED'].map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${statusFilter === s
                                ? 'bg-primary-600 text-white border-primary-600'
                                : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'
                                }`}
                        >
                            {s || 'All'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto hidden md:block">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Report Detail</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Reporter</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={4} />)
                            ) : reports.length === 0 ? (
                                <tr>
                                    <td colSpan="4">
                                        <div className="py-20 flex flex-col items-center opacity-40">
                                            <Search size={48} className="text-gray-300 mb-4" />
                                            <p className="text-xs font-black uppercase tracking-widest">No matching reports</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                reports.map((report) => (
                                    <tr key={report.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-gray-50 text-2xl flex items-center justify-center border border-gray-100 group-hover:scale-110 transition-transform shadow-sm">
                                                    {report.category?.icon || '📝'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{report.item_name}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Calendar size={12} className="text-gray-300" />
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(report.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex justify-center">
                                                <StatusBadge status={report.status} />
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 font-bold text-xs shrink-0">
                                                    {report.reporter?.full_name?.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-gray-900 truncate">{report.reporter?.full_name}</p>
                                                    <p className="text-[10px] text-gray-400 font-medium truncate">{report.reporter?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button
                                                onClick={() => { setReportToDelete(report); setShowDeleteConfirm(true) }}
                                                className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all inline-flex border border-transparent hover:border-red-100"
                                                title="Delete Permanently"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-gray-50">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="p-6 animate-pulse space-y-3">
                                <div className="h-4 bg-gray-100 rounded-full w-2/3"></div>
                                <div className="h-3 bg-gray-50 rounded-full w-1/2"></div>
                            </div>
                        ))
                    ) : reports.length === 0 ? (
                        <div className="py-16 flex flex-col items-center opacity-40">
                            <Search size={40} className="text-gray-300 mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-widest">No reports found</p>
                        </div>
                    ) : (
                        reports.map((report) => (
                            <div key={report.id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gray-50 text-2xl flex items-center justify-center border border-gray-100 shadow-sm shrink-0">
                                            {report.category?.icon || '📝'}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-sm font-bold text-gray-900 truncate">{report.item_name}</h3>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{report.category?.name || 'Item'}</p>
                                        </div>
                                    </div>
                                    <StatusBadge status={report.status} />
                                </div>

                                <div className="mt-6 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 font-bold text-xs">
                                            {report.reporter?.full_name?.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-black text-gray-900 truncate">{report.reporter?.full_name}</p>
                                            <p className="text-[9px] text-gray-400 font-medium truncate">{new Date(report.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => { setReportToDelete(report); setShowDeleteConfirm(true) }}
                                        className="p-2.5 bg-red-50 text-red-600 rounded-xl border border-red-100 shadow-sm"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <ConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDelete}
                title="Permanently Delete Report?"
                message={`This action will delete the report for "${reportToDelete?.item_name}" and remove its photo from storage. This cannot be undone.`}
                confirmLabel="Confirm Deletion"
                danger
                loading={deleting}
            />
        </div>
    )
}
