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
    const [expandedItems, setExpandedItems] = useState({}) // item.id -> bool

    // Action states
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

    // Filter items by search
    const filteredItems = items.filter(item =>
        item.item_name.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">✅ Claim Requests</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Review and verify student claims for found items</p>
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
                <div className="card p-0 overflow-hidden border border-gray-100 bg-white">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest w-10"></th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-gray-400 uppercase tracking-wider">Item Name</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-gray-400 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-gray-400 uppercase tracking-wider">Pending Claims</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-gray-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={5} />)}
                        </tbody>
                    </table>
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="bg-white rounded-[2rem] p-12 border border-gray-100/50 shadow-sm flex flex-col items-center text-center">
                    <EmptyState
                        icon="✅"
                        title="No pending claims"
                        description={search ? "No requests match your search." : "Great job! All submitted claims have been reviewed."}
                    />
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredItems.map((item) => (
                        <div key={item.id} className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm transition-all hover:shadow-md">
                            {/* Item Header (Collapsible trigger) */}
                            <div
                                onClick={() => toggleExpand(item.id)}
                                className={`flex items-center gap-4 px-6 py-5 cursor-pointer transition-colors ${expandedItems[item.id] ? 'bg-primary-50/30' : 'hover:bg-gray-50/50'}`}
                            >
                                <div className="text-gray-400 shrink-0">
                                    {expandedItems[item.id] ? <ChevronDown size={22} /> : <ChevronRight size={22} />}
                                </div>

                                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0 flex items-center justify-center text-2xl shadow-inner">
                                    {item.image_url ? (
                                        <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        item.category?.icon || '📦'
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="font-black text-gray-900 truncate tracking-tight">{item.item_name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest bg-primary-50 px-2 py-0.5 rounded-md border border-primary-100/50">{item.category?.name}</span>
                                        <span className="text-gray-300">•</span>
                                        <span className="text-xs text-gray-500 font-medium flex items-center gap-1"><Info size={12} className="text-gray-400" /> {item.found_location}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-1.5 shrink-0">
                                    <div className="flex items-center gap-1.5 text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-100/50 shadow-sm">
                                        <AlertTriangle size={12} />
                                        <span className="text-[10px] font-black uppercase tracking-wider">{(item.claims?.length || 0)} Request{(item.claims?.length || 0) > 1 ? 's' : ''}</span>
                                    </div>
                                    <span className="hidden sm:inline text-[9px] text-gray-400 font-black uppercase tracking-widest">Verify Claims</span>
                                </div>
                            </div>

                            {/* Claims List (Expanded content) */}
                            {expandedItems[item.id] && (
                                <div className="border-t border-dashed border-gray-200">
                                    <div className="p-6 bg-gray-50/20 backdrop-blur-sm">
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                            {item.claims?.map((claim) => (
                                                <div key={claim.id} className="bg-white rounded-[2rem] border border-gray-200 shadow-sm p-6 flex flex-col group hover:border-primary-200 transition-all">
                                                    <div className="flex items-start justify-between mb-5 pb-5 border-b border-gray-100/50">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-50 to-indigo-50 flex items-center justify-center text-primary-600 font-bold border border-primary-100">
                                                                {claim.claimant?.full_name?.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-gray-900 leading-tight">{claim.claimant?.full_name}</p>
                                                                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-0.5">ID: {claim.claimant?.student_id}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-lg">
                                                            {new Date(claim.created_at).toLocaleDateString()}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4 flex-1">
                                                        <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
                                                            <label className="text-[9px] font-black text-primary-400 uppercase tracking-widest block mb-2">Ownership Proof</label>
                                                            <p className="text-xs text-gray-700 font-bold italic leading-relaxed">
                                                                "{claim.ownership_proof}"
                                                            </p>
                                                        </div>

                                                        <div className="grid grid-cols-1 gap-4">
                                                            {claim.unique_marks && (
                                                                <div>
                                                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Unique Marks</label>
                                                                    <p className="text-xs text-gray-600 font-medium">
                                                                        {claim.unique_marks}
                                                                    </p>
                                                                </div>
                                                            )}
                                                            {claim.extra_details && (
                                                                <div>
                                                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Additional Notes</label>
                                                                    <p className="text-xs text-gray-500 font-medium italic">{claim.extra_details}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2 mt-6 pt-6 border-t border-gray-100/50">
                                                        <button
                                                            onClick={() => askAction(claim.id, 'reject', item.item_name)}
                                                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black text-red-600 hover:bg-red-50 transition-all uppercase tracking-widest border border-red-100"
                                                        >
                                                            <XCircle size={14} /> Reject
                                                        </button>
                                                        <button
                                                            onClick={() => askAction(claim.id, 'approve', item.item_name)}
                                                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black text-white bg-primary-600 hover:bg-primary-700 hover:shadow-lg shadow-primary-200 transition-all uppercase tracking-widest"
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
