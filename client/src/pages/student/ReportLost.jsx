import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../lib/axios'
import toast from 'react-hot-toast'
import ImageUpload from '../../components/ImageUpload'
import { FileText, MapPin, Calendar, Info, Send, X, Package, AlertTriangle, Sparkles, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'

export default function ReportLost({ variant = 'page', onClose, onSuccess }) {
    const navigate = useNavigate()
    const isModal = variant === 'modal'
    const [categories, setCategories] = useState([])
    const [locations, setLocations] = useState([])
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
        itemName: '',
        categoryId: '',
        description: '',
        locationId: '',
        specificLocation: '',
        lostDatetime: '',
        imageUrl: '',
    })

    // Smart Match state
    const [matches, setMatches] = useState({ similarReports: [], inventoryMatches: [] })
    const [matchLoading, setMatchLoading] = useState(false)
    const [matchesDismissed, setMatchesDismissed] = useState(false)
    const [showReports, setShowReports] = useState(true)
    const [showInventory, setShowInventory] = useState(true)
    const debounceRef = useRef(null)

    useEffect(() => {
        api.get('/categories').then(({ data }) => setCategories(data.categories || []))
        api.get('/locations').then(({ data }) => setLocations(data.locations || []))
    }, [])

    // Debounced match checking
    const checkForMatches = useCallback(async (itemName, categoryId) => {
        if (!itemName || itemName.trim().length < 3) {
            setMatches({ similarReports: [], inventoryMatches: [] })
            return
        }

        setMatchLoading(true)
        try {
            const { data } = await api.post('/lost-reports/check-matches', {
                itemName: itemName.trim(),
                categoryId: categoryId || null,
            })
            setMatches(data)
            setMatchesDismissed(false)
        } catch {
            // Silently fail — this is a nice-to-have feature
        } finally {
            setMatchLoading(false)
        }
    }, [])

    // Trigger match check when itemName or categoryId changes
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => {
            checkForMatches(form.itemName, form.categoryId)
        }, 600)
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
    }, [form.itemName, form.categoryId, checkForMatches])

    const update = (field) => (e) =>
        setForm((f) => ({ ...f, [field]: e.target.value }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.itemName || !form.locationId || !form.lostDatetime) {
            toast.error('Please fill in all required fields')
            return
        }

        // Build lostLocation string: "Location Name — specific details"
        const selectedLoc = locations.find(l => l.id === form.locationId)
        const locationText = selectedLoc
            ? (form.specificLocation ? `${selectedLoc.name} — ${form.specificLocation}` : selectedLoc.name)
            : form.specificLocation || 'Unknown'

        setLoading(true)
        try {
            await api.post('/lost-reports', {
                itemName: form.itemName,
                categoryId: form.categoryId || null,
                description: form.description,
                lostLocation: locationText,
                locationId: form.locationId || null,
                lostDatetime: form.lostDatetime,
                imageUrl: form.imageUrl || null,
            })

            toast.success('Lost report submitted successfully!')
            if (isModal && onSuccess) onSuccess()
            else navigate('/student/my-reports')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit report')
        } finally {
            setLoading(false)
        }
    }

    const handleInventoryClick = () => {
        if (isModal && onClose) {
            onClose()
            navigate('/student/inventory')
        } else {
            navigate('/student/inventory')
        }
    }

    const handleCancel = () => {
        if (isModal && onClose) onClose()
        else navigate(-1)
    }

    const hasMatches = matches.similarReports.length > 0 || matches.inventoryMatches.length > 0

    return (
        <div className={isModal ? 'space-y-5' : 'max-w-3xl mx-auto space-y-8'}>
            {/* Header — page mode only */}
            {!isModal && (
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-widest mb-4 border border-indigo-500/20">
                            <FileText size={14} /> Report Form
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight">
                            Report <span className="text-indigo-400">Lost Item</span>
                        </h1>
                        <p className="text-slate-400 mt-2 font-medium text-sm">Record the details of your missing item.</p>
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex gap-3 max-w-xs">
                        <Info className="shrink-0 text-amber-400" size={18} />
                        <p className="text-[11px] font-semibold leading-tight text-amber-300">
                            Check the <button type="button" onClick={() => navigate('/student/inventory')} className="underline text-amber-400 hover:text-amber-300">Inventory</button> first. Your item might already be found!
                        </p>
                    </div>
                </div>
            )}

            {/* Amber tip — modal mode (compact) */}
            {isModal && (
                <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex gap-3">
                    <Info className="shrink-0 text-amber-400" size={16} />
                    <p className="text-[11px] font-semibold leading-tight text-amber-300">
                        Check the <button type="button" onClick={handleInventoryClick} className="underline text-amber-400 hover:text-amber-300">Inventory</button> first. Your item might already be found!
                    </p>
                </div>
            )}

            {/* ═══════════ SMART MATCH SUGGESTIONS ═══════════ */}
            {hasMatches && !matchesDismissed && (
                <div className="space-y-4 animate-fade-in-up">
                    {/* Smart Match Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Sparkles size={16} className="text-amber-400" />
                                <div className="absolute inset-0 bg-amber-400 blur-md opacity-30 animate-pulse" />
                            </div>
                            <span className="text-xs font-black text-amber-400 uppercase tracking-widest">Smart Match</span>
                            {matchLoading && (
                                <div className="w-3 h-3 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
                            )}
                        </div>
                        <button
                            onClick={() => setMatchesDismissed(true)}
                            className="text-[10px] font-bold text-slate-500 uppercase tracking-wider hover:text-slate-300 transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
                        >
                            Dismiss
                        </button>
                    </div>

                    {/* Similar Reports */}
                    {matches.similarReports.length > 0 && (
                        <div className="bg-amber-500/5 border border-amber-500/15 rounded-2xl overflow-hidden">
                            <button
                                onClick={() => setShowReports(!showReports)}
                                className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-amber-500/5 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <AlertTriangle size={16} className="text-amber-400" />
                                    <span className="text-xs font-bold text-amber-300">
                                        {matches.similarReports.length} Similar Report{matches.similarReports.length > 1 ? 's' : ''} Found
                                    </span>
                                </div>
                                {showReports ? <ChevronUp size={16} className="text-amber-400" /> : <ChevronDown size={16} className="text-amber-400" />}
                            </button>
                            {showReports && (
                                <div className="px-5 pb-4 space-y-2">
                                    <p className="text-[10px] text-slate-500 font-semibold mb-3">
                                        Someone else may have already reported a similar item. You can still continue.
                                    </p>
                                    {matches.similarReports.map(r => (
                                        <div key={r.id} className="flex items-center gap-4 bg-slate-800/60 p-3.5 rounded-xl border border-white/5">
                                            <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-lg border border-amber-500/20 shrink-0">
                                                {r.category?.icon || '📦'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-white truncate">{r.item_name}</p>
                                                <div className="flex items-center gap-3 mt-0.5">
                                                    <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                                                        <MapPin size={10} /> {r.lost_location}
                                                    </span>
                                                    <span className="text-[10px] text-slate-600 font-semibold">
                                                        {new Date(r.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Inventory Matches */}
                    {matches.inventoryMatches.length > 0 && (
                        <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-2xl overflow-hidden">
                            <button
                                onClick={() => setShowInventory(!showInventory)}
                                className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-emerald-500/5 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <Sparkles size={16} className="text-emerald-400" />
                                    <span className="text-xs font-bold text-emerald-300">
                                        🎉 {matches.inventoryMatches.length} Potential Match{matches.inventoryMatches.length > 1 ? 'es' : ''} in Inventory!
                                    </span>
                                </div>
                                {showInventory ? <ChevronUp size={16} className="text-emerald-400" /> : <ChevronDown size={16} className="text-emerald-400" />}
                            </button>
                            {showInventory && (
                                <div className="px-5 pb-4 space-y-2">
                                    <p className="text-[10px] text-slate-500 font-semibold mb-3">
                                        Your item might already be found! Check these matches before submitting.
                                    </p>
                                    {matches.inventoryMatches.map(item => (
                                        <div
                                            key={item.id}
                                            onClick={() => navigate('/student/inventory')}
                                            className="flex items-center gap-4 bg-slate-800/60 p-3.5 rounded-xl border border-emerald-500/10 cursor-pointer hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all group"
                                        >
                                            <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-700/50 border border-white/10 shrink-0 flex items-center justify-center">
                                                {item.image_url ? (
                                                    <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-lg">{item.category?.icon || '📦'}</span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-white truncate">{item.item_name}</p>
                                                <div className="flex items-center gap-3 mt-0.5">
                                                    <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                                                        <MapPin size={10} /> {item.found_location}
                                                    </span>
                                                    <span className="text-[10px] text-slate-600 font-semibold">
                                                        Found {new Date(item.date_found).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="shrink-0 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ExternalLink size={16} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Form */}
            <div className="bg-slate-800/60 rounded-2xl p-8 sm:p-10 border border-white/8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Primary Info */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 block">Item Name <span className="text-red-400">*</span></label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-600 group-focus-within:text-indigo-400 transition-colors">
                                        <Package size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={form.itemName}
                                        onChange={update('itemName')}
                                        placeholder="e.g. MacBook Air M2 Space Grey"
                                        className="w-full bg-slate-900/60 border border-white/10 rounded-xl pl-12 pr-5 py-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 transition-all font-semibold"
                                    />
                                    {matchLoading && (
                                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                                            <div className="w-4 h-4 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 block">Category</label>
                                <select
                                    value={form.categoryId}
                                    onChange={update('categoryId')}
                                    className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-5 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 transition-all font-semibold appearance-none cursor-pointer"
                                >
                                    <option value="">Uncategorized</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 block">Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={update('description')}
                                    rows={4}
                                    placeholder="Add specific marks, stickers, or contents that help identify the item..."
                                    className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-5 py-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 transition-all font-medium resize-none"
                                />
                            </div>
                        </div>

                        {/* Location & Time */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 block">Location Area <span className="text-red-400">*</span></label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-600 group-focus-within:text-indigo-400 transition-colors">
                                        <MapPin size={18} />
                                    </div>
                                    <select
                                        required
                                        value={form.locationId}
                                        onChange={update('locationId')}
                                        className="w-full bg-slate-900/60 border border-white/10 rounded-xl pl-12 pr-5 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 transition-all font-semibold appearance-none cursor-pointer"
                                    >
                                        <option value="">Select area...</option>
                                        {locations.map((l) => (
                                            <option key={l.id} value={l.id}>{l.icon} {l.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 block">Specific Location <span className="text-slate-600">(Optional)</span></label>
                                <input
                                    type="text"
                                    value={form.specificLocation}
                                    onChange={update('specificLocation')}
                                    placeholder="e.g. 3rd Floor, near water cooler"
                                    className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-5 py-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 transition-all font-semibold"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 block">When did you lose it? <span className="text-red-400">*</span></label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-600 group-focus-within:text-indigo-400 transition-colors">
                                        <Calendar size={18} />
                                    </div>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={form.lostDatetime}
                                        onChange={update('lostDatetime')}
                                        max={new Date().toISOString().slice(0, 16)}
                                        className="w-full bg-slate-900/60 border border-white/10 rounded-xl pl-12 pr-5 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 transition-all font-semibold cursor-pointer"
                                        style={{ colorScheme: 'dark' }}
                                    />
                                </div>
                            </div>

                            {/* Image Upload */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 block">Photo <span className="text-slate-600">(Optional)</span></label>
                                <div className="bg-slate-700/30 border border-dashed border-white/10 rounded-xl p-3">
                                    <ImageUpload
                                        value={form.imageUrl}
                                        onChange={(url) => setForm((f) => ({ ...f, imageUrl: url || '' }))}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-white/5">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="flex-1 flex items-center justify-center gap-2 px-8 py-3.5 bg-slate-700/40 text-slate-400 rounded-xl font-bold text-xs uppercase tracking-wider border border-white/5 hover:bg-slate-700/60 hover:text-slate-300 transition-all"
                        >
                            <X size={16} /> Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 transition-all disabled:opacity-50 active:scale-[0.98]"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Submitting...
                                </span>
                            ) : (
                                <>
                                    <Send size={16} /> Submit Report
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
