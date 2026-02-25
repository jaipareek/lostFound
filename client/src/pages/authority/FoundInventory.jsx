import { useState, useEffect, useCallback } from 'react'
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
import { Plus, MapPin, Calendar, Warehouse, Edit, Trash2 } from 'lucide-react'

export default function FoundInventory() {
    const [items, setItems] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [categoryId, setCategoryId] = useState('')
    const [status, setStatus] = useState('AVAILABLE') // Default to available items

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [formLoading, setFormLoading] = useState(false)

    // Deletion states
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [itemToDelete, setItemToDelete] = useState(null)
    const [submittingDelete, setSubmittingDelete] = useState(false)

    // Form states
    const [formData, setFormData] = useState({
        itemName: '',
        categoryId: '',
        description: '',
        foundLocation: '',
        storageLocation: '',
        dateFound: new Date().toISOString().split('T')[0],
        imageUrl: '',
        status: 'AVAILABLE'
    })

    // Fetch categories on mount
    useEffect(() => {
        api.get('/categories').then(({ data }) => setCategories(data.categories || []))
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

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item)
            setFormData({
                itemName: item.item_name,
                categoryId: item.category_id || '',
                description: item.description || '',
                foundLocation: item.found_location,
                storageLocation: item.storage_location || '',
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
                foundLocation: '',
                storageLocation: '',
                dateFound: new Date().toISOString().split('T')[0],
                imageUrl: '',
                status: 'AVAILABLE'
            })
        }
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
        setFormLoading(true)
        try {
            if (editingItem) {
                await api.patch(`/found-items/${editingItem.id}`, formData)
                toast.success('Item updated successfully')
            } else {
                await api.post('/found-items', formData)
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
                                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/50 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-center gap-2">
                                    <button
                                        onClick={() => handleOpenModal(item)}
                                        className="p-3 bg-white/90 backdrop-blur-sm text-gray-900 rounded-xl hover:bg-white transition-colors shadow-lg"
                                        title="Edit Item"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => { setItemToDelete(item); setShowDeleteConfirm(true); }}
                                        className="p-3 bg-white/90 backdrop-blur-sm text-red-600 rounded-xl hover:bg-white transition-colors shadow-lg"
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
                                        <div className="flex items-center gap-2 text-xs text-secondary-500 font-bold bg-secondary-50/50 px-2 py-1 rounded-lg border border-secondary-100/50">
                                            <Warehouse size={14} className="text-secondary-400 shrink-0" />
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

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingItem ? 'Edit Found Item' : 'Add New Found Item'}
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1 sm:col-span-2">
                            <label className="text-sm font-medium text-gray-700">Item Name *</label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. Blue Dell Laptop"
                                className="input"
                                value={formData.itemName}
                                onChange={e => setFormData({ ...formData, itemName: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Category</label>
                            <select
                                className="input"
                                value={formData.categoryId}
                                onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Date Found *</label>
                            <input
                                required
                                type="date"
                                className="input"
                                value={formData.dateFound}
                                onChange={e => setFormData({ ...formData, dateFound: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Found Location *</label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. Library 2nd Floor"
                                className="input"
                                value={formData.foundLocation}
                                onChange={e => setFormData({ ...formData, foundLocation: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Storage Location</label>
                            <input
                                type="text"
                                placeholder="e.g. Locker B-12"
                                className="input"
                                value={formData.storageLocation}
                                onChange={e => setFormData({ ...formData, storageLocation: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1 sm:col-span-2">
                            <label className="text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                className="input min-h-[80px]"
                                placeholder="Add any unique marks or details..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1 sm:col-span-2">
                            <label className="text-sm font-medium text-gray-700">Item Image</label>
                            <ImageUpload
                                value={formData.imageUrl}
                                onChange={url => setFormData({ ...formData, imageUrl: url })}
                            />
                        </div>

                        {editingItem && (
                            <div className="space-y-1 sm:col-span-2">
                                <label className="text-sm font-medium text-gray-700">Status</label>
                                <select
                                    className="input"
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="AVAILABLE">AVAILABLE</option>
                                    <option value="CLOSED">CLOSED</option>
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="btn btn-secondary flex-1"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={formLoading}
                            className="btn btn-primary flex-1"
                        >
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
