import { useState, useEffect, useCallback } from 'react'
import api from '../../lib/axios'
import toast from 'react-hot-toast'
import StatusBadge from '../../components/StatusBadge'
import SearchBar from '../../components/SearchBar'
import ConfirmDialog from '../../components/ConfirmDialog'
import Modal from '../../components/Modal'
import EmptyState from '../../components/EmptyState'
import { TableRowSkeleton } from '../../components/LoadingSkeleton'
import { ChevronDown, ChevronRight, CheckCircle, XCircle, User, Info, AlertTriangle } from 'lucide-react'

export default function ClaimRequests() {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [expandedItems, setExpandedItems] = useState({})

    const [confirm, setConfirm] = useState({ open: false, id: null, action: '', itemName: '' })
    const [processing, setProcessing] = useState(false)

    const fetchRequests = useCallback(async () => {
        setLoading(true)
        try {
            const { data } = await api.get('/claims/requests')
            setItems(data.items || [])
        } catch (err) {
            toast.error('Failed to load claim requests')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchRequests()
    }, [fetchRequests])

    const toggleExpand = (id) => {
        setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }))
    }

    const askAction = (claimId, action, itemName) => {
        setConfirm({ open: true, id: claimId, action, itemName })
    }

    const handleAction = async () => {
        setProcessing(true)
        try {
            if (confirm.action === 'approve') {
                await api.patch(`/claims/${confirm.id}/approve`)
                toast.success('Claim approved! Item closed and others rejected.')
            } else {
                await api.patch(`/claims/${confirm.id}/reject`)
                toast.success('Claim rejected')
            }
            setConfirm({ open: false, id: null, action: '', itemName: '' })
            fetchRequests()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Operation failed')
        } finally {
            setProcessing(false)
        }
    }

    const filteredItems = items.filter(item =>
        item.item_name.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <CheckCircle className="text-emerald-400" /> Claim Requests
                    </h1>
                    <p className="text-sm text-slate-400 mt-0.5">Review and verify student claims for found items</p>
                </div>
            </div>

            <div className="max-w-md">
                <SearchBar
                    value={search}
                    onChange={setSearch}
                    placeholder="Search items with claims..."
                />
            </div>

            {loading ? (
                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-24 bg-slate-800/50 rounded-2xl animate-pulse border border-white/5" />
                    ))}
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="bg-slate-800/60 rounded-[2rem] p-12 border border-white/8 flex flex-col items-center text-center">
                    <EmptyState
                        icon="✅"
                        title="No pending claims"
                        description={search ? "No requests match your search." : "Great job! All submitted claims have been reviewed."}
                    />
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredItems.map((item) => (
                        <div key={item.id} className="bg-slate-800/60 rounded-2xl overflow-hidden border border-white/8 transition-all hover:border-white/15">
                            {/* Item Header */}
                            <div
                                onClick={() => toggleExpand(item.id)}
                                className={`flex items-center gap-4 px-6 py-5 cursor-pointer transition-colors ${expandedItems[item.id] ? 'bg-amber-500/5' : 'hover:bg-white/[0.03]'}`}
                            >
                                <div className="text-slate-500 shrink-0">
                                    {expandedItems[item.id] ? <ChevronDown size={22} /> : <ChevronRight size={22} />}
                                </div>

                                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-700/50 border border-white/10 shrink-0 flex items-center justify-center text-2xl">
                                    {item.image_url ? (
                                        <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        item.category?.icon || '📦'
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="font-black text-white truncate tracking-tight">{item.item_name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">{item.category?.name}</span>
                                        <span className="text-slate-600">•</span>
                                        <span className="text-xs text-slate-400 font-medium flex items-center gap-1"><Info size={12} className="text-slate-500" /> {item.found_location}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-1.5 shrink-0">
                                    <div className="flex items-center gap-1.5 text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
                                        <AlertTriangle size={12} />
                                        <span className="text-[10px] font-black uppercase tracking-wider">{(item.claims?.length || 0)} Request{(item.claims?.length || 0) > 1 ? 's' : ''}</span>
                                    </div>
                                    <span className="hidden sm:inline text-[9px] text-slate-600 font-black uppercase tracking-widest">Verify Claims</span>
                                </div>
                            </div>

                            {/* Claims List */}
                            {expandedItems[item.id] && (
                                <div className="border-t border-white/5">
                                    <div className="p-6 bg-slate-900/40">
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                            {item.claims?.map((claim) => (
                                                <div key={claim.id} className="bg-slate-800/70 rounded-2xl border border-white/8 p-6 flex flex-col group hover:border-amber-500/20 transition-all">
                                                    <div className="flex items-start justify-between mb-5 pb-5 border-b border-white/5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 font-bold border border-amber-500/20">
                                                                {claim.claimant?.full_name?.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-white leading-tight">{claim.claimant?.full_name}</p>
                                                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-0.5">ID: {claim.claimant?.student_id}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-700/50 px-2 py-1 rounded-lg">
                                                            {new Date(claim.created_at).toLocaleDateString()}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4 flex-1">
                                                        <div className="bg-slate-700/30 p-4 rounded-2xl border border-white/5">
                                                            <label className="text-[9px] font-black text-amber-400 uppercase tracking-widest block mb-2">Ownership Proof</label>
                                                            <p className="text-xs text-slate-300 font-bold italic leading-relaxed">
                                                                "{claim.ownership_proof}"
                                                            </p>
                                                        </div>

                                                        {/* Proof Image */}
                                                        {claim.proof_image_url && (
                                                            <div className="bg-slate-700/30 p-4 rounded-2xl border border-white/5">
                                                                <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block mb-2">Proof Image</label>
                                                                <a href={claim.proof_image_url} target="_blank" rel="noopener noreferrer" className="block">
                                                                    <img
                                                                        src={claim.proof_image_url}
                                                                        alt="Proof"
                                                                        className="w-full max-h-48 object-cover rounded-xl border border-white/10 hover:opacity-90 transition-opacity cursor-pointer"
                                                                    />
                                                                </a>
                                                            </div>
                                                        )}

                                                        <div className="grid grid-cols-1 gap-4">
                                                            {claim.unique_marks && (
                                                                <div>
                                                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Unique Marks</label>
                                                                    <p className="text-xs text-slate-300 font-medium">
                                                                        {claim.unique_marks}
                                                                    </p>
                                                                </div>
                                                            )}
                                                            {claim.extra_details && (
                                                                <div>
                                                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Additional Notes</label>
                                                                    <p className="text-xs text-slate-400 font-medium italic">{claim.extra_details}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2 mt-6 pt-6 border-t border-white/5">
                                                        <button
                                                            onClick={() => askAction(claim.id, 'reject', item.item_name)}
                                                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black text-red-400 hover:bg-red-500/10 transition-all uppercase tracking-widest border border-red-500/20"
                                                        >
                                                            <XCircle size={14} /> Reject
                                                        </button>
                                                        <button
                                                            onClick={() => askAction(claim.id, 'approve', item.item_name)}
                                                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black text-white bg-emerald-600 hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/20 transition-all uppercase tracking-widest"
                                                        >
                                                            <CheckCircle size={14} /> Approve
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {confirm.open && (
                <ConfirmDialog
                    isOpen={confirm.open}
                    onClose={() => setConfirm({ ...confirm, open: false })}
                    onConfirm={handleAction}
                    title={confirm.action === 'approve' ? 'Approve Claim?' : 'Reject Claim?'}
                    message={
                        confirm.action === 'approve'
                            ? `Approving this claim for "${confirm.itemName}" will automatically REJECT all other pending claims for this item and mark the item as CLOSED. Are you sure?`
                            : `Are you sure you want to reject this claim for "${confirm.itemName}"?`
                    }
                    confirmLabel={confirm.action === 'approve' ? 'Yes, Approve' : 'Yes, Reject'}
                    danger={confirm.action === 'reject'}
                    loading={processing}
                />
            )}
        </div>
    )
}
