import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../lib/axios'
import toast from 'react-hot-toast'
import StatusBadge from '../../components/StatusBadge'
import ConfirmDialog from '../../components/ConfirmDialog'
import EmptyState from '../../components/EmptyState'
import Modal from '../../components/Modal'
import ReportLost from './ReportLost'
import EditClaimModal from '../../components/EditClaimModal'
import { MapPin, Calendar, X, Plus, FileText, Hand } from 'lucide-react'

export default function MyReports() {
    const navigate = useNavigate()
    const [reports, setReports] = useState([])
    const [claims, setClaims] = useState([])
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState('lost')
    const [closingId, setClosingId] = useState(null)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [closeLoading, setCloseLoading] = useState(false)
    const [reportModalOpen, setReportModalOpen] = useState(false)
    const [editClaimObj, setEditClaimObj] = useState(null)

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
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <FileText className="text-indigo-400" /> My Reports
                    </h1>
                    <p className="text-sm text-slate-400 mt-0.5">Track your lost item reports and claims</p>
                </div>
                <button
                    onClick={() => setReportModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 transition-all active:scale-95"
                >
                    <Plus size={16} /> Report Lost Item
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-slate-800/50 p-1 rounded-xl border border-white/5 w-fit">
                {[
                    { key: 'lost', label: 'Lost Reports', icon: '📄', count: reports.length },
                    { key: 'claims', label: 'My Claims', icon: '✋', count: claims.length },
                ].map(({ key, label, icon, count }) => (
                    <button
                        key={key}
                        onClick={() => setTab(key)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === key
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        {icon} {label}
                        <span className={`text-xs rounded-full px-2 py-0.5 font-bold ${tab === key ? 'bg-white/20 text-white' : 'bg-slate-700/50 text-slate-500'}`}>
                            {count}
                        </span>
                    </button>
                ))}
            </div>

            {/* ── LOST REPORTS TAB ── */}
            {tab === 'lost' && (
                <div>
                    {loading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="h-20 bg-slate-800/50 rounded-xl animate-pulse border border-white/5" />
                            ))}
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="bg-slate-800/60 rounded-2xl p-12 border border-white/8 flex flex-col items-center text-center">
                            <EmptyState
                                icon="📄"
                                title="You haven't reported any lost items yet"
                                description="If you've lost something, check the inventory first, then file a report."
                                action={{ label: '+ Report Lost Item', onClick: () => setReportModalOpen(true) }}
                            />
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden md:block bg-slate-800/40 rounded-2xl border border-white/8 overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-800/60 border-b border-white/5">
                                        <tr>
                                            <th className="text-left px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Item</th>
                                            <th className="text-left px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Category</th>
                                            <th className="text-left px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Location</th>
                                            <th className="text-left px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date Reported</th>
                                            <th className="text-left px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                            <th className="text-right px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {reports.map((r) => (
                                            <tr key={r.id} className="hover:bg-white/[0.03] transition-colors">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-bold text-white">{r.item_name}</p>
                                                        {r.description && (
                                                            <p className="text-xs text-slate-500 truncate max-w-xs">{r.description}</p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-700/40 border border-white/5 text-xs font-semibold text-slate-300">
                                                        {r.category?.icon} {r.category?.name}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                                                        <MapPin size={14} className="text-indigo-400" />
                                                        <span>{r.lost_location}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
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
                                                            className="text-xs font-bold text-red-400 hover:text-red-300 uppercase tracking-wider px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-all"
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
                            <div className="md:hidden space-y-3">
                                {reports.map((r) => (
                                    <div key={r.id} className="bg-slate-800/60 rounded-2xl p-5 border border-white/8 space-y-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-11 h-11 rounded-xl bg-slate-700/50 flex items-center justify-center text-xl border border-white/5">
                                                    {r.category?.icon || '📦'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white leading-tight">{r.item_name}</p>
                                                    <p className="text-xs text-slate-500 font-semibold mt-0.5">
                                                        {new Date(r.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <StatusBadge status={r.status} />
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="bg-slate-700/30 p-3 rounded-xl border border-white/5">
                                                <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1">Location</p>
                                                <p className="text-xs font-semibold text-slate-300 truncate">{r.lost_location}</p>
                                            </div>
                                            <div className="bg-slate-700/30 p-3 rounded-xl border border-white/5">
                                                <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1">Category</p>
                                                <p className="text-xs font-semibold text-slate-300 truncate">{r.category?.name}</p>
                                            </div>
                                        </div>

                                        {r.status === 'REPORTED' && (
                                            <button
                                                onClick={() => askClose(r.id)}
                                                className="w-full py-2.5 bg-red-500/10 text-red-400 rounded-xl text-xs font-bold uppercase tracking-wider border border-red-500/20 hover:bg-red-500/20 transition-colors"
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
                <div>
                    {loading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="h-32 bg-slate-800/50 rounded-xl animate-pulse border border-white/5" />
                            ))}
                        </div>
                    ) : claims.length === 0 ? (
                        <div className="bg-slate-800/60 rounded-2xl p-12 border border-white/8 flex flex-col items-center text-center">
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
                                <div key={c.id} className="bg-slate-800/60 rounded-2xl p-6 border border-white/8 flex flex-col justify-between hover:border-indigo-500/20 transition-all">
                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-xl border border-indigo-500/20">
                                                {c.found_item?.category?.icon || '✋'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-white leading-tight">{c.found_item?.item_name}</p>
                                                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
                                                    <MapPin size={11} className="text-slate-600" /> {c.found_item?.found_location}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <StatusBadge status={c.status} />
                                            {c.info_requested && (
                                                <span className="text-[9px] font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 uppercase tracking-widest">
                                                    Info Requested
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-slate-700/30 p-4 rounded-xl border border-white/5 mb-4 flex-1">
                                        <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5">Ownership Proof</p>
                                        <p className="text-xs text-slate-300 font-semibold italic leading-relaxed">
                                            "{c.ownership_proof || 'No description provided'}"
                                        </p>
                                    </div>

                                    {/* Proof Image */}
                                    {c.proof_image_url && (
                                        <div className="bg-slate-700/30 p-4 rounded-xl border border-white/5 mb-4">
                                            <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mb-2">Proof Image</p>
                                            <a href={c.proof_image_url} target="_blank" rel="noopener noreferrer">
                                                <img
                                                    src={c.proof_image_url}
                                                    alt="Proof"
                                                    className="w-full max-h-40 object-cover rounded-lg border border-white/10 hover:opacity-90 transition-opacity cursor-pointer"
                                                />
                                            </a>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 uppercase tracking-widest px-1">
                                        <span>Submitted</span>
                                        <span>{new Date(c.created_at).toLocaleDateString()}</span>
                                    </div>
                                    {c.info_requested && c.status === 'PENDING' && (
                                        <div className="mt-4 space-y-2">
                                            <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex items-start gap-2 text-amber-500/90 text-xs">
                                                <Hand size={14} className="shrink-0 mt-0.5" />
                                                <p>The authority has requested more information or clearer proof for this claim.</p>
                                            </div>
                                            <button
                                                onClick={() => setEditClaimObj(c)}
                                                className="w-full py-2.5 bg-amber-500/10 text-amber-400 rounded-xl text-xs font-bold uppercase tracking-wider border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                                            >
                                                Edit Claim
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Edit Claim modal */}
            <EditClaimModal
                isOpen={!!editClaimObj}
                onClose={() => setEditClaimObj(null)}
                claim={editClaimObj}
                onSuccess={() => {
                    setEditClaimObj(null)
                    fetchAll()
                }}
            />

            {/* Report Lost modal */}
            <Modal
                isOpen={reportModalOpen}
                onClose={() => setReportModalOpen(false)}
                title="Report Lost Item"
                size="xl"
            >
                <ReportLost
                    variant="modal"
                    onClose={() => setReportModalOpen(false)}
                    onSuccess={() => {
                        setReportModalOpen(false)
                        fetchAll()
                    }}
                />
            </Modal>

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
