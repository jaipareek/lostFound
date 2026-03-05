import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../lib/axios'
import toast from 'react-hot-toast'
import StatusBadge from '../../components/StatusBadge'
import SearchBar from '../../components/SearchBar'
import CategoryFilter from '../../components/CategoryFilter'
import Modal from '../../components/Modal'
import ConfirmDialog from '../../components/ConfirmDialog'
import ImageUpload from '../../components/ImageUpload'
import EmptyState from '../../components/EmptyState'
import { CardSkeleton } from '../../components/LoadingSkeleton'
import { Plus, MapPin, Calendar, Warehouse, Edit, Trash2, Sparkles, User, ChevronDown, ChevronUp, FileText, ExternalLink } from 'lucide-react'

export default function FoundInventory() {
    const navigate = useNavigate()
    const [items, setItems] = useState([])
    const [categories, setCategories] = useState([])
    const [locations, setLocations] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [categoryId, setCategoryId] = useState('')
    const [status, setStatus] = useState('AVAILABLE')

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [formLoading, setFormLoading] = useState(false)

    // Deletion states
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [itemToDelete, setItemToDelete] = useState(null)
    const [submittingDelete, setSubmittingDelete] = useState(false)

    // Smart Match state
    const [matchingReports, setMatchingReports] = useState([])
    const [matchLoading, setMatchLoading] = useState(false)
    const [matchesDismissed, setMatchesDismissed] = useState(false)
    const [showMatches, setShowMatches] = useState(true)
    const debounceRef = useRef(null)

    // Form states
    const [formData, setFormData] = useState({
        itemName: '',
        categoryId: '',
        description: '',
        locationId: '',
        specificLocation: '',
        dateFound: new Date().toISOString().split('T')[0],
        imageUrl: '',
        status: 'AVAILABLE'
    })

    useEffect(() => {
        api.get('/categories').then(({ data }) => setCategories(data.categories || []))
        api.get('/locations').then(({ data }) => setLocations(data.locations || []))
    }, [])

    const fetchItems = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (search) params.set('search', search)
            if (categoryId) params.set('categoryId', categoryId)
            if (status) params.set('status', status)

            const { data } = await api.get(`/found-items?${params}`)
            setItems(data.items || [])
        } catch (err) {
            toast.error('Failed to load inventory')
        } finally {
            setLoading(false)
        }
    }, [search, categoryId, status])

    useEffect(() => {
        const t = setTimeout(fetchItems, 300)
        return () => clearTimeout(t)
    }, [fetchItems])

    // Debounced match checking for authority
    const checkForMatches = useCallback(async (itemName, catId) => {
        if (!itemName || itemName.trim().length < 3) {
            setMatchingReports([])
            return
        }
        setMatchLoading(true)
        try {
            const { data } = await api.post('/found-items/check-matches', {
                itemName: itemName.trim(),
                categoryId: catId || null,
            })
            setMatchingReports(data.matchingReports || [])
            setMatchesDismissed(false)
        } catch {
            // Silently fail
        } finally {
            setMatchLoading(false)
        }
    }, [])

    // Trigger match check when form item name or category changes
    useEffect(() => {
        if (!isModalOpen || editingItem) return // Only for new items
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => {
            checkForMatches(formData.itemName, formData.categoryId)
        }, 600)
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
    }, [formData.itemName, formData.categoryId, isModalOpen, editingItem, checkForMatches])

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item)
            setFormData({
                itemName: item.item_name,
                categoryId: item.category_id || '',
                description: item.description || '',
                locationId: item.location_id || '',
                specificLocation: '',
                dateFound: new Date(item.date_found).toISOString().split('T')[0],
                imageUrl: item.image_url || '',
                status: item.status
            })
        } else {
            setEditingItem(null)
            setFormData({
                itemName: '',
                categoryId: '',
                description: '',
                locationId: '',
                specificLocation: '',
                dateFound: new Date().toISOString().split('T')[0],
                imageUrl: '',
                status: 'AVAILABLE'
            })
        }
        setMatchingReports([])
        setMatchesDismissed(false)
        setShowMatches(true)
        setIsModalOpen(true)
    }

    const handleDelete = async () => {
        if (!itemToDelete) return
        setSubmittingDelete(true)
        try {
            await api.delete(`/found-items/${itemToDelete.id}`)
            toast.success('Item deleted successfully')
            setShowDeleteConfirm(false)
            fetchItems()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete item')
        } finally {
            setSubmittingDelete(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.itemName.trim() || formData.itemName.trim().length < 2) {
            return toast.error('Item name must be at least 2 characters')
        }
        if (!formData.dateFound) {
            return toast.error('Please select the date the item was found')
        }
        if (new Date(formData.dateFound) > new Date()) {
            return toast.error('Date found cannot be in the future')
        }
        if (!formData.locationId && !editingItem) {
            return toast.error('Please select a location area')
        }

        // Build foundLocation string: "Location Name — specific details"
        const selectedLoc = locations.find(l => l.id === formData.locationId)
        const locationText = selectedLoc
            ? (formData.specificLocation ? `${selectedLoc.name} — ${formData.specificLocation}` : selectedLoc.name)
            : formData.specificLocation || 'Unknown'

        setFormLoading(true)
        try {
            const payload = {
                ...formData,
                foundLocation: locationText,
                locationId: formData.locationId || null,
            }
            delete payload.specificLocation

            if (editingItem) {
                await api.patch(`/found-items/${editingItem.id}`, payload)
                toast.success('Item updated successfully')
            } else {
                await api.post('/found-items', payload)
                toast.success('Item added to inventory')
            }
            setIsModalOpen(false)
            fetchItems()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Operation failed')
        } finally {
            setFormLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                        <span className="gradient-text">Found Vault</span>
                    </h1>
                    <p className="text-sm text-gray-500 mt-1 font-medium">Manage and track items found on campus</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary-700 hover:shadow-lg shadow-primary-200 transition-all justify-center"
                >
                    <Plus size={18} /> Add Item
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
                <div className="lg:col-span-5 flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Quick Search</label>
                        <SearchBar
                            value={search}
                            onChange={setSearch}
                            placeholder="Search item name..."
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Status Filter</label>
                        <div className="flex p-1 bg-gray-100/80 backdrop-blur-sm rounded-2xl border border-gray-200/50">
                            {[
                                { id: 'AVAILABLE', label: 'In Vault' },
                                { id: 'CLOSED', label: 'Returned' }
                            ].map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => setStatus(s.id)}
                                    className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${status === s.id
                                        ? 'bg-white text-primary-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-900'
                                        }`}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-7">
                    <CategoryFilter
                        categories={categories}
                        selected={categoryId}
                        onChange={setCategoryId}
                    />
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
                </div>
            ) : items.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] p-12 border border-gray-100/50 shadow-sm flex flex-col items-center text-center">
                    <EmptyState
                        icon="📦"
                        title="No items found"
                        description={search ? 'Try adjusting your search or filters.' : 'Your inventory is currently empty.'}
                        action={search || categoryId !== '' ? { label: 'Clear Filters', onClick: () => { setSearch(''); setCategoryId(''); } } : null}
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {items.map((item) => (
                        <div key={item.id} className="bg-white rounded-[2rem] p-1.5 shadow-sm border border-gray-100/50 hover:shadow-xl transition-all duration-300 group">
                            <div className="relative h-48 bg-gray-50 rounded-[1.5rem] overflow-hidden">
                                {item.image_url ? (
                                    <img
                                        src={item.image_url}
                                        alt={item.item_name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-gray-50 to-gray-100 italic">
                                        {item.category?.icon || '📦'}
                                    </div>
                                )}
                                <div className="absolute top-3 right-3">
                                    <StatusBadge status={item.status} />
                                </div>
                                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-center gap-3">
                                    <button
                                        onClick={() => handleOpenModal(item)}
                                        className="p-3 bg-amber-500 text-white rounded-xl hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/30"
                                        title="Edit Item"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => { setItemToDelete(item); setShowDeleteConfirm(true); }}
                                        className="p-3 bg-red-500 text-white rounded-xl hover:bg-red-400 transition-colors shadow-lg shadow-red-500/30"
                                        title="Delete Item"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="p-4 pt-5">
                                <div className="flex items-start justify-between gap-2 mb-3">
                                    <div>
                                        <h3 className="font-black text-gray-900 tracking-tight line-clamp-1 group-hover:text-primary-600 transition-colors">
                                            {item.item_name}
                                        </h3>
                                        <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest mt-1">
                                            {item.category?.name || 'Uncategorized'}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-2.5 py-4 border-y border-gray-50 mb-4">
                                    <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                        <MapPin size={14} className="text-primary-400 shrink-0" />
                                        <span className="truncate">{item.found_location}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        <Calendar size={14} className="text-gray-300 shrink-0" />
                                        <span>
                                            {new Date(item.date_found).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {item.storage_location && (
                                        <div className="flex items-center gap-2 text-xs text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1.5 rounded-lg border border-amber-500/20">
                                            <Warehouse size={14} className="text-amber-500 shrink-0" />
                                            <span className="truncate">Vault: {item.storage_location}</span>
                                        </div>
                                    )}
                                </div>

                                <p className="text-[11px] text-gray-500 font-medium line-clamp-2 italic leading-relaxed px-1">
                                    "{item.description || "No additional description provided."}"
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingItem ? 'Edit Found Item' : 'Add New Found Item'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Section: Item Details */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Item Details</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Item Name <span className="text-red-400">*</span></label>
                                <div className="relative">
                                    <input
                                        required type="text" placeholder="e.g. Blue Dell Laptop"
                                        className="input" value={formData.itemName}
                                        onChange={e => setFormData({ ...formData, itemName: e.target.value })}
                                    />
                                    {matchLoading && (
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                            <div className="w-4 h-4 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category</label>
                                <select className="input" value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value })}>
                                    <option value="">Select Category</option>
                                    {categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date Found <span className="text-red-400">*</span></label>
                                <input
                                    required type="date" className="input" style={{ colorScheme: 'dark' }}
                                    max={new Date().toISOString().split('T')[0]}
                                    value={formData.dateFound}
                                    onChange={e => setFormData({ ...formData, dateFound: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* ═══════════ SMART MATCH — Lost Report Suggestions ═══════════ */}
                    {!editingItem && matchingReports.length > 0 && !matchesDismissed && (
                        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl overflow-hidden animate-fade-in-up">
                            <button
                                type="button"
                                onClick={() => setShowMatches(!showMatches)}
                                className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-amber-500/5 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <Sparkles size={16} className="text-amber-400" />
                                        <div className="absolute inset-0 bg-amber-400 blur-md opacity-30 animate-pulse" />
                                    </div>
                                    <span className="text-xs font-bold text-amber-300">
                                        ⚡ {matchingReports.length} Matching Lost Report{matchingReports.length > 1 ? 's' : ''} Found!
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setMatchesDismissed(true) }}
                                        className="text-[10px] font-bold text-slate-500 uppercase tracking-wider hover:text-slate-300 transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
                                    >
                                        Dismiss
                                    </button>
                                    {showMatches ? <ChevronUp size={16} className="text-amber-400" /> : <ChevronDown size={16} className="text-amber-400" />}
                                </div>
                            </button>
                            {showMatches && (
                                <div className="px-5 pb-4 space-y-2">
                                    <p className="text-[10px] text-slate-500 font-semibold mb-3">
                                        A student may have already reported losing a similar item. Review these reports:
                                    </p>
                                    {matchingReports.map(r => (
                                        <div key={r.id} className="flex items-center gap-4 bg-slate-800/60 p-3.5 rounded-xl border border-amber-500/10">
                                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-lg border border-amber-500/20 shrink-0">
                                                {r.category?.icon || '📄'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-white truncate">{r.item_name}</p>
                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                                    <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                                                        <User size={10} /> {r.reporter?.full_name || 'Unknown'}
                                                    </span>
                                                    <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                                                        <MapPin size={10} /> {r.lost_location}
                                                    </span>
                                                    <span className="text-[10px] text-slate-600 font-semibold flex items-center gap-1">
                                                        <Calendar size={10} /> {new Date(r.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                {r.description && (
                                                    <p className="text-[10px] text-slate-500 mt-1 truncate italic">"{r.description}"</p>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => { setIsModalOpen(false); navigate('/authority/lost') }}
                                                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-400 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-amber-500/20 hover:bg-amber-500/20 hover:text-amber-300 transition-all whitespace-nowrap"
                                            >
                                                View Report <ExternalLink size={11} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Divider */}
                    <div className="border-t border-slate-100" />

                    {/* Section: Location */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Location Info</h3>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Location Area <span className="text-red-400">*</span></label>
                            <select
                                className="input"
                                value={formData.locationId}
                                onChange={e => setFormData({ ...formData, locationId: e.target.value })}
                                required={!editingItem}
                            >
                                <option value="">Select area...</option>
                                {locations.map(l => (<option key={l.id} value={l.id}>{l.icon} {l.name}</option>))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Specific Location <span className="text-slate-400 text-xs font-normal">(Optional)</span></label>
                            <input
                                type="text" placeholder="e.g. 3rd Floor, Room 204, near stairs"
                                className="input" value={formData.specificLocation}
                                onChange={e => setFormData({ ...formData, specificLocation: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-slate-100" />

                    {/* Section: Additional */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Additional Details</h3>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
                            <textarea
                                className="input min-h-[90px]"
                                placeholder="Color, brand, distinguishing marks..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Item Photo</label>
                            <ImageUpload
                                value={formData.imageUrl}
                                onChange={url => setFormData({ ...formData, imageUrl: url })}
                            />
                        </div>

                        {editingItem && (
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status</label>
                                <select className="input" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                    <option value="AVAILABLE">Available</option>
                                    <option value="CLOSED">Returned</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-3 border-t border-slate-100">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary flex-1">Cancel</button>
                        <button type="submit" disabled={formLoading} className="btn btn-primary flex-1">
                            {formLoading ? 'Saving...' : editingItem ? 'Update Item' : 'Add Item'}
                        </button>
                    </div>
                </form>
            </Modal>
            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDelete}
                title="Delete Found Item?"
                message={`Are you sure you want to delete "${itemToDelete?.item_name}"? This will also permanently remove its photo from storage.`}
                confirmLabel="Delete Item"
                danger
                loading={submittingDelete}
            />
        </div>
    )
}
