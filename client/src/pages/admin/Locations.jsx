import { useState, useEffect } from 'react'
import api from '../../lib/axios'
import toast from 'react-hot-toast'
import Modal from '../../components/Modal'
import ConfirmDialog from '../../components/ConfirmDialog'
import EmptyState from '../../components/EmptyState'
import {
    Plus,
    Edit3,
    Trash2,
    MapPin,
    Info,
    Save,
    ArrowUpDown
} from 'lucide-react'

export default function Locations() {
    const [locations, setLocations] = useState([])
    const [loading, setLoading] = useState(true)

    // Create/Edit State
    const [showModal, setShowModal] = useState(false)
    const [editingLocation, setEditingLocation] = useState(null)
    const [formData, setFormData] = useState({ name: '', icon: '📍', sort_order: 0 })
    const [submitting, setSubmitting] = useState(false)

    // Delete State
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [locationToDelete, setLocationToDelete] = useState(null)

    useEffect(() => {
        fetchLocations()
    }, [])

    const fetchLocations = async () => {
        setLoading(true)
        try {
            const { data } = await api.get('/locations')
            setLocations(data.locations || [])
        } catch (err) {
            toast.error('Failed to load locations')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.name) return toast.error('Location name is required')

        setSubmitting(true)
        try {
            if (editingLocation) {
                await api.patch(`/locations/${editingLocation.id}`, formData)
                toast.success('Location updated')
            } else {
                await api.post('/locations', formData)
                toast.success('Location created')
            }
            setShowModal(false)
            fetchLocations()
        } catch (err) {
            toast.error('Failed to save location')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async () => {
        setSubmitting(true)
        try {
            await api.delete(`/locations/${locationToDelete.id}`)
            toast.success('Location deleted')
            setShowDeleteConfirm(false)
            fetchLocations()
        } catch (err) {
            toast.error('Failed to delete location')
        } finally {
            setSubmitting(false)
        }
    }

    const openAddModal = () => {
        setEditingLocation(null)
        setFormData({ name: '', icon: '📍', sort_order: locations.length + 1 })
        setShowModal(true)
    }

    const openEditModal = (loc) => {
        setEditingLocation(loc)
        setFormData({ name: loc.name, icon: loc.icon, sort_order: loc.sort_order || 0 })
        setShowModal(true)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">📍 Locations</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Manage campus locations for lost & found reports</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="btn btn-primary flex items-center gap-2"
                >
                    <Plus size={20} /> Add Location
                </button>
            </div>

            <div className="bg-white/50 backdrop-blur-sm border border-primary-100 p-6 rounded-[2rem] flex flex-col sm:flex-row gap-4 text-primary-900 mb-8 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-600 shrink-0 shadow-inner">
                    <Info size={24} />
                </div>
                <div>
                    <p className="text-sm font-black uppercase tracking-widest text-primary-600 mb-1">Location System</p>
                    <p className="text-xs font-medium leading-relaxed text-primary-800/80">
                        Locations help standardize where items are lost or found on campus. Students and authorities will select from these in a dropdown. Add <span className="font-bold underline">"Other"</span> as a fallback for unlisted areas.
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-48 bg-white rounded-[2.5rem] animate-pulse border border-gray-100" />
                    ))}
                </div>
            ) : locations.length === 0 ? (
                <div className="bg-white rounded-[3rem] p-16 border border-gray-100 shadow-sm flex flex-col items-center text-center">
                    <EmptyState
                        icon="📍"
                        title="No locations"
                        description="Create your first location to help users specify where items were lost or found."
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {locations.map((loc) => (
                        <div key={loc.id} className="bg-white rounded-[2.5rem] p-6 border border-gray-100 group relative shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="flex items-start justify-between">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-gray-50 text-4xl flex items-center justify-center shadow-inner border border-gray-100 group-hover:scale-110 transition-transform bg-gradient-to-br from-white to-gray-50">
                                    {loc.icon}
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => openEditModal(loc)}
                                        className="p-3 bg-white text-gray-400 hover:text-primary-600 rounded-xl transition-all shadow-sm border border-gray-100 hover:border-primary-100"
                                    >
                                        <Edit3 size={18} />
                                    </button>
                                    <button
                                        onClick={() => { setLocationToDelete(loc); setShowDeleteConfirm(true) }}
                                        className="p-3 bg-white text-gray-400 hover:text-red-600 rounded-xl transition-all shadow-sm border border-gray-100 hover:border-red-100"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                            <div className="mt-6">
                                <h3 className="text-lg font-black text-gray-900 group-hover:text-primary-600 transition-colors tracking-tight">{loc.name}</h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="px-2.5 py-1 rounded-lg bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border border-gray-100 flex items-center gap-1">
                                        <ArrowUpDown size={10} /> Order: {loc.sort_order}
                                    </div>
                                    <div className="px-2.5 py-1 rounded-lg bg-primary-50 text-[10px] font-black text-primary-400 uppercase tracking-widest border border-primary-100">
                                        Active
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <Modal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    title={editingLocation ? 'Edit Location' : 'Add New Location'}
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Icon / Emoji</label>
                            <input
                                type="text"
                                placeholder="e.g. 🏢, 🏛️, 🌳"
                                className="input text-2xl py-4 text-center"
                                value={formData.icon}
                                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                            />
                            <p className="text-[10px] text-gray-500 text-center italic">Use a single emoji for the best look</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Location Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Block 1, Central Block, Library"
                                className="input focus:ring-primary-100"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sort Order</label>
                            <input
                                type="number"
                                placeholder="e.g. 1, 2, 3"
                                className="input focus:ring-primary-100"
                                value={formData.sort_order}
                                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                            />
                            <p className="text-[10px] text-gray-500 italic">Lower numbers appear first in the dropdown</p>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="flex-1 btn bg-gray-100 hover:bg-gray-200 text-gray-700 py-3"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 btn btn-primary py-3 flex items-center justify-center gap-2"
                                disabled={submitting}
                            >
                                {submitting ? 'Saving...' : (
                                    <>
                                        <Save size={18} /> {editingLocation ? 'Update' : 'Create'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Delete Confirmation */}
            {showDeleteConfirm && (
                <ConfirmDialog
                    isOpen={showDeleteConfirm}
                    onClose={() => setShowDeleteConfirm(false)}
                    onConfirm={handleDelete}
                    title="Delete Location?"
                    message={`Are you sure you want to delete the "${locationToDelete?.name}" location? Reports referencing it will keep their existing data.`}
                    confirmLabel="Delete Location"
                    danger
                    loading={submitting}
                />
            )}
        </div>
    )
}
