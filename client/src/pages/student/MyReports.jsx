import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../lib/axios'
import toast from 'react-hot-toast'
import StatusBadge from '../../components/StatusBadge'
import ConfirmDialog from '../../components/ConfirmDialog'
import EmptyState from '../../components/EmptyState'
import { TableRowSkeleton } from '../../components/LoadingSkeleton'
import { MapPin, Calendar, X } from 'lucide-react'

export default function MyReports() {
    const navigate = useNavigate()
    const [reports, setReports] = useState([])
    const [claims, setClaims] = useState([])
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState('lost')  // 'lost' | 'claims'
    const [closingId, setClosingId] = useState(null)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [closeLoading, setCloseLoading] = useState(false)

    const fetchAll = async () => {
        setLoading(true)
        try {
            const [rRes, cRes] = await Promise.all([
                api.get('/lost-reports/mine'),
                api.get('/claims/mine'),
            ])
            setReports(rRes.data.reports || [])
            setClaims(cRes.data.claims || [])
        } catch {
            toast.error('Failed to load your reports')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchAll() }, [])

    const handleCloseReport = async () => {
        setCloseLoading(true)
        try {
            await api.patch(`/lost-reports/${closingId}/close`)
            toast.success('Report closed successfully')
            setConfirmOpen(false)
            await fetchAll()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to close report')
        } finally {
            setCloseLoading(false)
            setClosingId(null)
        }
    }

    const askClose = (id) => {
        setClosingId(id)
        setConfirmOpen(true)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">📋 My Reports</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Track your lost item reports and claims</p>
                </div>
                <button
                    onClick={() => navigate('/student/report-lost')}
                    className="btn-primary text-sm"
                >
                    + Report Lost Item
                </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <div className="flex gap-0">
                    {[
                        { key: 'lost', label: '📄 Lost Reports', count: reports.length },
                        { key: 'claims', label: '✋ My Claims', count: claims.length },
                    ].map(({ key, label, count }) => (
                        <button
                            key={key}
                            onClick={() => setTab(key)}
                            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${tab === key
                                ? 'border-primary-600 text-primary-700'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {label}
                            <span className="ml-2 bg-gray-100 text-gray-600 text-xs rounded-full px-1.5 py-0.5">
                                {count}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── LOST REPORTS TAB ── */}
            {tab === 'lost' && (
                <div className="card p-0 overflow-hidden border-none shadow-sm bg-transparent">
                    {loading ? (
                        <div className="space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />
                            ))}
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="bg-white rounded-2xl p-8 border border-gray-100/50">
                            <EmptyState
                                icon="📄"
                                title="You haven't reported any lost items yet"
                                description="If you've lost something, check the inventory first, then file a report."
                                action={{ label: '+ Report Lost Item', onClick: () => navigate('/student/report-lost') }}
                            />
                        </div>
                    ) : (
                        <>
                            {/* Desktop View */}
                            <div className="hidden md:block bg-white rounded-2xl border border-gray-100 overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Item</th>
                                            <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                                            <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Location</th>
                                            <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date Reported</th>
                                            <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                            <th className="text-right px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {reports.map((r) => (
                                            <tr key={r.id} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-bold text-gray-900">{r.item_name}</p>
                                                        {r.description && (
                                                            <p className="text-xs text-gray-400 truncate max-w-xs">{r.description}</p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 border border-gray-100 text-xs font-bold text-gray-600">
                                                        {r.category?.icon} {r.category?.name}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                                                        <MapPin size={14} className="text-primary-400" />
                                                        <span>{r.lost_location}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold uppercase tracking-wider">
                                                        <Calendar size={14} />
                                                        {new Date(r.created_at).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <StatusBadge status={r.status} />
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {r.status === 'REPORTED' && (
                                                        <button
                                                            onClick={() => askClose(r.id)}
                                                            className="text-xs font-black text-red-500 hover:text-red-600 uppercase tracking-widest active:scale-95 transition-transform"
                                                        >
                                                            Close Report
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile View */}
                            <div className="md:hidden space-y-4">
                                {reports.map((r) => (
                                    <div key={r.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100/50 space-y-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-2xl border border-gray-100">
                                                    {r.category?.icon || '📦'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 leading-tight">{r.item_name}</p>
                                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                                                        {new Date(r.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <StatusBadge status={r.status} />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 pb-2">
                                            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100/50">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Location</p>
                                                <p className="text-xs font-bold text-gray-700 truncate">{r.lost_location}</p>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100/50">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Category</p>
                                                <p className="text-xs font-bold text-gray-700 truncate">{r.category?.name}</p>
                                            </div>
                                        </div>

                                        {r.status === 'REPORTED' && (
                                            <button
                                                onClick={() => askClose(r.id)}
                                                className="w-full py-3 bg-red-50 text-red-600 rounded-2xl text-xs font-black uppercase tracking-widest active:bg-red-100 transition-colors"
                                            >
                                                Close Report
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* ── CLAIMS TAB ── */}
            {tab === 'claims' && (
                <div className="space-y-4">
                    {loading ? (
                        <div className="space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />
                            ))}
                        </div>
                    ) : claims.length === 0 ? (
                        <div className="bg-white rounded-2xl p-8 border border-gray-100/50">
                            <EmptyState
                                icon="✋"
                                title="You haven't claimed any items"
                                description="Browse the inventory and click 'Claim' if you spot your lost item."
                                action={{ label: 'Browse Inventory', onClick: () => navigate('/student/inventory') }}
                            />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {claims.map((c) => (
                                <div key={c.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100/50 flex flex-col justify-between hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl border border-indigo-100">
                                                {c.found_item?.category?.icon || '✋'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 leading-tight">{c.found_item?.item_name}</p>
                                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 font-medium">
                                                    <MapPin size={11} className="text-gray-400" /> {c.found_item?.found_location}
                                                </p>
                                            </div>
                                        </div>
                                        <StatusBadge status={c.status} />
                                    </div>

                                    <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100/50 mb-4 flex-1">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Ownership Proof</p>
                                        <p className="text-xs text-gray-700 font-bold italic leading-relaxed">
                                            "{c.ownership_proof || 'No description provided'}"
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                                        <span>Submitted</span>
                                        <span>{new Date(c.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Confirm close dialog */}
            <ConfirmDialog
                isOpen={confirmOpen}
                onClose={() => { setConfirmOpen(false); setClosingId(null) }}
                onConfirm={handleCloseReport}
                title="Close this report?"
                message="Mark this report as closed — do this if you found the item yourself or no longer need it tracked."
                confirmLabel="Yes, Close It"
                loading={closeLoading}
            />
        </div>
    )
}
