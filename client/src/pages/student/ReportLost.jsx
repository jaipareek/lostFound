import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../lib/axios'
import toast from 'react-hot-toast'
import ImageUpload from '../../components/ImageUpload'
import { FileText, MapPin, Calendar, Info, Send, X, Package } from 'lucide-react'

export default function ReportLost() {
    const navigate = useNavigate()
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
        itemName: '',
        categoryId: '',
        description: '',
        lostLocation: '',
        lostDatetime: '',
        imageUrl: '',
    })

    useEffect(() => {
        api.get('/categories').then(({ data }) => setCategories(data.categories || []))
    }, [])

    const update = (field) => (e) =>
        setForm((f) => ({ ...f, [field]: e.target.value }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.itemName || !form.lostLocation || !form.lostDatetime) {
            toast.error('Please fill in all required fields')
            return
        }

        setLoading(true)
        try {
            const { data } = await api.post('/lost-reports', {
                itemName: form.itemName,
                categoryId: form.categoryId || null,
                description: form.description,
                lostLocation: form.lostLocation,
                lostDatetime: form.lostDatetime,
                imageUrl: form.imageUrl || null,
            })

            toast.success('Lost report submitted successfully!')
            navigate('/student/my-reports')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit report')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto space-y-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-600 text-[10px] font-black uppercase tracking-widest mb-4">
                        <FileText size={14} /> Official Documentation
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                        Report <span className="gradient-text">Lost Asset</span>
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium">Record the disappearance of your item in the campus ledger.</p>
                </div>
                <div className="bg-white/50 backdrop-blur-sm border border-orange-100 p-4 rounded-2xl flex gap-3 text-orange-800 shadow-sm max-w-xs">
                    <Info className="shrink-0 text-orange-500" size={18} />
                    <p className="text-[10px] font-bold leading-tight">
                        Double check the <button onClick={() => navigate('/student/inventory')} className="underline text-orange-600">Inventory</button> first. Your item might already be in the vault!
                    </p>
                </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-gray-100 shadow-gray-200/50">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Primary Info */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Item Identity <span className="text-red-500">*</span></label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors">
                                        <Package size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={form.itemName}
                                        onChange={update('itemName')}
                                        placeholder="e.g. MacBook Air M2 Space Grey"
                                        className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl pl-12 pr-5 py-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500/30 transition-all font-bold"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Classification</label>
                                <select
                                    value={form.categoryId}
                                    onChange={update('categoryId')}
                                    className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-5 py-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500/30 transition-all font-bold appearance-none cursor-pointer"
                                >
                                    <option value="">Uncategorized</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Contextual Details</label>
                                <textarea
                                    value={form.description}
                                    onChange={update('description')}
                                    rows={4}
                                    placeholder="Add specific marks, stickers, or contents that help identify the item..."
                                    className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-5 py-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500/30 transition-all font-medium resize-none"
                                />
                            </div>
                        </div>

                        {/* Location & Time */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Last Known Location <span className="text-red-500">*</span></label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors">
                                        <MapPin size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={form.lostLocation}
                                        onChange={update('lostLocation')}
                                        placeholder="e.g. Science Block, 3rd Floor"
                                        className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl pl-12 pr-5 py-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500/30 transition-all font-bold"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Incident Timestamp <span className="text-red-500">*</span></label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors">
                                        <Calendar size={18} />
                                    </div>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={form.lostDatetime}
                                        onChange={update('lostDatetime')}
                                        max={new Date().toISOString().slice(0, 16)}
                                        className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl pl-12 pr-5 py-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500/30 transition-all font-bold cursor-pointer"
                                    />
                                </div>
                            </div>

                            {/* Image Upload */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Visual Evidence <span className="text-gray-400">(Optional)</span></label>
                                <div className="bg-gray-50/30 border border-dashed border-gray-200 rounded-[2rem] p-3">
                                    <ImageUpload
                                        value={form.imageUrl}
                                        onChange={(url) => setForm((f) => ({ ...f, imageUrl: url || '' }))}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-50">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all"
                        >
                            <X size={18} /> Discard Draft
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] flex items-center justify-center gap-3 px-8 py-4 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary-700 shadow-xl shadow-primary-200 transition-all disabled:opacity-50"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Transmitting...
                                </span>
                            ) : (
                                <>
                                    <Send size={18} /> Broadcast Report
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <p className="text-center text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">
                Secure Entry #{(Math.random() * 100000).toFixed(0)} • Campus Safety Protocol
            </p>
        </div>
    )
}
