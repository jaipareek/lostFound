import { useState, useEffect, useCallback } from 'react'
import api from '../../lib/axios'
import toast from 'react-hot-toast'
import StatusBadge from '../../components/StatusBadge'
import ConfirmDialog from '../../components/ConfirmDialog'
import EmptyState from '../../components/EmptyState'
import { CardSkeleton } from '../../components/LoadingSkeleton'
import { AlertTriangle, User, Calendar, MapPin, CheckCircle, HelpCircle, ShieldAlert } from 'lucide-react'

export default function Disputes() {
    const [disputes, setDisputes] = useState([])
    const [loading, setLoading] = useState(true)
    const [resolving, setResolving] = useState(false)
    const [confirm, setConfirm] = useState({ open: false, claimId: null, itemName: '' })

    const fetchDisputes = useCallback(async () => {
        setLoading(true)
        try {
            const { data } = await api.get('/claims/disputes')
            // Only show OPEN disputes by default or label them
            setDisputes(data.disputes || [])
        } catch (err) {
            toast.error('Failed to load disputes')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchDisputes()
    }, [fetchDisputes])

    const handleResolve = async () => {
        setResolving(true)
        try {
            await api.patch(`/claims/${confirm.claimId}/approve`)
            toast.success('Dispute resolved! Selected claimant won.')
            setConfirm({ open: false, claimId: null, itemName: '' })
            fetchDisputes()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Resolution failed')
        } finally {
            setResolving(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <AlertTriangle className="text-orange-500" /> Dispute Cases
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">High-priority cases where multiple students have claimed the same item</p>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 gap-8">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="h-96 bg-white rounded-[2.5rem] animate-pulse border border-gray-100" />
                    ))}
                </div>
            ) : disputes.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] p-12 border border-gray-100 shadow-sm flex flex-col items-center text-center">
                    <EmptyState
                        icon="🛡️"
                        title="No active disputes"
                        description="All claims are currently unique or resolved. Excellent inventory management!"
                    />
                </div>
            ) : (
                <div className="space-y-12">
                    {disputes.map((dispute) => (
                        <div key={dispute.id} className={`bg-white rounded-[2.5rem] overflow-hidden border ${dispute.status === 'OPEN' ? 'border-orange-200 shadow-orange-100/50' : 'border-gray-200'} shadow-xl transition-all`}>
                            {/* Dispute Header */}
                            <div className={`px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-6 ${dispute.status === 'OPEN' ? 'bg-orange-50/30' : 'bg-gray-50/50'}`}>
                                <div className="flex items-center gap-5">
                                    <div className="w-20 h-20 rounded-3xl overflow-hidden bg-white border border-gray-200 shrink-0 shadow-inner p-1">
                                        {dispute.found_item?.image_url ? (
                                            <img src={dispute.found_item.image_url} alt="" className="w-full h-full object-cover rounded-2xl" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h2 className="text-xl font-black text-gray-900 tracking-tight">{dispute.found_item?.item_name}</h2>
                                            <StatusBadge status={dispute.status} />
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4 mt-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            <span className="flex items-center gap-1.5"><MapPin size={14} className="text-primary-400" /> {dispute.found_item?.found_location}</span>
                                            <span className="hidden sm:inline text-gray-200">•</span>
                                            <span className="flex items-center gap-1.5"><Calendar size={14} className="text-primary-400" /> Flagged {new Date(dispute.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {dispute.status === 'OPEN' && (
                                    <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-orange-200 text-orange-700 shadow-sm">
                                        <div className="relative">
                                            <ShieldAlert size={20} className="relative z-10" />
                                            <div className="absolute inset-0 bg-orange-400 blur-md opacity-20 animate-pulse"></div>
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-[0.1em]">{(dispute.claims?.length || 0)} Conflicting Claims</span>
                                    </div>
                                )}
                            </div>

                            {/* Side-by-Side Comparison */}
                            <div className="p-8 bg-white">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
                                    {/* VS Divider for desktop */}
                                    <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-gray-50 border-4 border-white items-center justify-center text-[10px] font-black text-gray-400 z-10 shadow-md">
                                        VS
                                    </div>

                                    {dispute.claims?.map((claim, index) => (
                                        <div key={claim.id} className={`flex flex-col border-2 rounded-[2rem] overflow-hidden transition-all ${claim.status === 'APPROVED' ? 'border-green-200 bg-green-50/10' : 'border-gray-50 hover:border-primary-100'}`}>
                                            <div className={`px-5 py-4 border-b flex items-center justify-between ${claim.status === 'APPROVED' ? 'bg-green-50/50 border-green-100' : 'bg-gray-50/50 border-gray-100'}`}>
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${claim.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-primary-50 text-primary-600 border border-primary-100'}`}>
                                                        {claim.claimant?.full_name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 leading-tight">{claim.claimant?.full_name}</p>
                                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">ID: {claim.claimant?.student_id}</p>
                                                    </div>
                                                </div>
                                                {claim.status === 'APPROVED' && (
                                                    <div className="flex items-center gap-1.5 text-green-700 bg-green-100 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                                                        <CheckCircle size={14} /> Winner
                                                    </div>
                                                )}
                                            </div>

                                            <div className="p-6 space-y-6 flex-1">
                                                <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100/50 shadow-inner">
                                                    <label className="text-[9px] font-black text-primary-400 uppercase tracking-widest block mb-2">Claimant's Proof of Ownership</label>
                                                    <div className="italic text-sm text-gray-700 font-medium leading-relaxed">
                                                        "{claim.ownership_proof}"
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Physical Unique Marks</label>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-primary-400"></div>
                                                        <p className="text-sm text-gray-800 font-bold">
                                                            {claim.unique_marks}
                                                        </p>
                                                    </div>
                                                </div>

                                                {claim.extra_details && (
                                                    <div className="bg-blue-50/20 p-4 rounded-2xl border border-blue-50">
                                                        <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest block mb-1">Additional Context</label>
                                                        <p className="text-xs text-gray-500 font-medium italic">
                                                            {claim.extra_details}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {dispute.status === 'OPEN' && (
                                                <div className="p-6 mt-auto bg-gray-50/30 border-t border-gray-100/50">
                                                    <button
                                                        onClick={() => setConfirm({ open: true, claimId: claim.id, itemName: dispute.found_item.item_name })}
                                                        className="w-full bg-white text-gray-900 border border-gray-200 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary-600 hover:text-white hover:border-primary-600 hover:shadow-lg shadow-primary-200 transition-all active:scale-[0.98]"
                                                    >
                                                        <CheckCircle size={16} /> Resolve Case
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {dispute.status === 'OPEN' && (
                                <div className="px-8 py-5 bg-primary-600 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 text-xs font-bold">
                                        <HelpCircle size={16} className="text-primary-200" />
                                        <span>Compare physical signs to identify the true owner. Resolution is permanent.</span>
                                    </div>
                                    <ShieldAlert size={20} className="text-white opacity-20 hidden sm:block" />
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
                    onConfirm={handleResolve}
                    title="Resolve Dispute"
                    message={`Are you sure you want to resolve this dispute in favor of this claimant? All other claims for "${confirm.itemName}" will be automatically rejected.`}
                    confirmLabel="Confirm Resolution"
                    loading={resolving}
                />
            )}
        </div>
    )
}
