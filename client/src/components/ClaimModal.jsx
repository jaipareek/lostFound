import { useState } from 'react'
import Modal from './Modal'
import ImageUpload from './ImageUpload'
import api from '../lib/axios'
import toast from 'react-hot-toast'
import { Camera } from 'lucide-react'

export default function ClaimModal({ isOpen, onClose, item, onSuccess }) {
    const [form, setForm] = useState({
        uniqueMarks: '',
        ownershipProof: '',
        extraDetails: '',
        proofImageUrl: '',
    })
    const [loading, setLoading] = useState(false)

    const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.uniqueMarks.trim() || !form.ownershipProof.trim()) {
            toast.error('Please fill in unique marks and ownership proof')
            return
        }

        setLoading(true)
        try {
            const { data } = await api.post('/claims', {
                foundItemId: item.id,
                uniqueMarks: form.uniqueMarks,
                ownershipProof: form.ownershipProof,
                extraDetails: form.extraDetails,
                proofImageUrl: form.proofImageUrl || null,
            })

            toast.success(data.disputeFlagged
                ? '⚠️ Claim submitted — multiple claimants detected, forwarded to authority'
                : '✅ Claim submitted successfully!'
            )
            setForm({ uniqueMarks: '', ownershipProof: '', extraDetails: '', proofImageUrl: '' })
            onSuccess?.()
            onClose()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit claim')
            if (err.response?.status === 409) {
                onClose()
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Claim Item" size="md">
            {/* Item summary */}
            {item && (
                <div className="flex gap-3 p-3 bg-slate-800/60 rounded-xl mb-5 border border-white/8">
                    <div className="w-12 h-12 rounded-lg bg-slate-700/50 flex items-center justify-center text-2xl shrink-0 overflow-hidden border border-white/5">
                        {item.image_url
                            ? <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                            : item.category?.icon || '📦'}
                    </div>
                    <div>
                        <p className="font-semibold text-white text-sm">{item.item_name}</p>
                        <p className="text-xs text-slate-400">{item.found_location}</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="label">Unique Marks / Identifiers <span className="text-red-400">*</span></label>
                    <textarea
                        value={form.uniqueMarks}
                        onChange={update('uniqueMarks')}
                        rows={2}
                        placeholder="e.g. scratch on the back, sticker on side, serial number..."
                        className="input resize-none"
                    />
                </div>

                <div>
                    <label className="label">Ownership Proof <span className="text-red-400">*</span></label>
                    <textarea
                        value={form.ownershipProof}
                        onChange={update('ownershipProof')}
                        rows={2}
                        placeholder="e.g. receipt number, photos stored in item, contacts saved..."
                        className="input resize-none"
                    />
                </div>

                <div>
                    <label className="label">Additional Details <span className="text-slate-500">(optional)</span></label>
                    <textarea
                        value={form.extraDetails}
                        onChange={update('extraDetails')}
                        rows={2}
                        placeholder="Any other information that can help verify your ownership..."
                        className="input resize-none"
                    />
                </div>

                {/* Proof Image Upload */}
                <div>
                    <label className="label flex items-center gap-2">
                        <Camera size={14} className="text-indigo-400" />
                        Proof Image <span className="text-slate-500">(optional)</span>
                    </label>
                    <p className="text-[11px] text-slate-500 mb-2">Upload an image as proof of ownership (e.g. receipt, purchase screenshot, etc.)</p>
                    <ImageUpload
                        value={form.proofImageUrl}
                        onChange={(url) => setForm((f) => ({ ...f, proofImageUrl: url || '' }))}
                    />
                </div>

                <div className="flex gap-3 pt-1">
                    <button type="button" onClick={onClose} disabled={loading} className="btn-secondary flex-1">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className="btn-primary flex-1">
                        {loading ? 'Submitting...' : 'Submit Claim'}
                    </button>
                </div>
            </form>
        </Modal>
    )
}
