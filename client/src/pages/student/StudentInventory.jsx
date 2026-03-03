import { useState, useEffect, useCallback } from 'react'
import api from '../../lib/axios'
import toast from 'react-hot-toast'
import SearchBar from '../../components/SearchBar'
import CategoryFilter from '../../components/CategoryFilter'
import FoundItemCard from '../../components/FoundItemCard'
import ClaimModal from '../../components/ClaimModal'
import EmptyState from '../../components/EmptyState'
import { CardSkeleton } from '../../components/LoadingSkeleton'

const ITEMS_PER_PAGE = 12

export default function StudentInventory() {
    // Data state
    const [items, setItems] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [total, setTotal] = useState(0)

    // Filter state
    const [search, setSearch] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('')
    const [statusFilter, setStatusFilter] = useState('AVAILABLE')
    const [page, setPage] = useState(1)

    // Claim modal state
    const [claimItem, setClaimItem] = useState(null)

    // Fetch categories once on mount
    useEffect(() => {
        api.get('/categories').then(({ data }) => setCategories(data.categories || []))
    }, [])

    // Fetch found items whenever filters change
    const fetchItems = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (search) params.set('search', search)
            if (selectedCategory) params.set('categoryId', selectedCategory)
            if (statusFilter) params.set('status', statusFilter)

            const { data } = await api.get(`/found-items?${params}`)
            setItems(data.items || [])
            setTotal(data.total || 0)
            setPage(1)
        } catch {
            toast.error('Failed to load inventory')
        } finally {
            setLoading(false)
        }
    }, [search, selectedCategory, statusFilter])

    useEffect(() => {
        const timer = setTimeout(fetchItems, 300)  // debounce search
        return () => clearTimeout(timer)
    }, [fetchItems])

    // Paginate results client-side
    const paginated = items.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
    const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE)

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">
                        Public Inventory
                    </h1>
                    <p className="text-sm text-slate-400 mt-1 font-medium">
                        {loading ? 'Searching campus vault...' : `Found ${total} item${total !== 1 ? 's' : ''} in the inventory`}
                    </p>
                </div>

                {/* Status filter tabs */}
                <div className="flex p-1 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-white/5 self-start sm:self-center">
                    {[
                        { id: 'AVAILABLE', label: 'In Vault' },
                        { id: 'CLOSED', label: 'Returned' },
                        { id: '', label: 'All Items' }
                    ].map((s) => (
                        <button
                            key={s.id}
                            onClick={() => setStatusFilter(s.id)}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${statusFilter === s.id
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                : 'text-slate-500 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Search + Category filter */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
                <div className="lg:col-span-5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Quick Search</label>
                    <SearchBar
                        value={search}
                        onChange={setSearch}
                        placeholder="Search items by name..."
                    />
                </div>
                <div className="lg:col-span-7">
                    <CategoryFilter
                        categories={categories}
                        selected={selectedCategory}
                        onChange={setSelectedCategory}
                    />
                </div>
            </div>

            {/* Item grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
                </div>
            ) : paginated.length === 0 ? (
                <EmptyState
                    icon="🔍"
                    title="No items found"
                    description={
                        search || selectedCategory
                            ? 'Try adjusting your search or removing the category filter.'
                            : 'No found items have been added to the inventory yet.'
                    }
                />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {paginated.map((item) => (
                        <FoundItemCard
                            key={item.id}
                            item={item}
                            onClaim={setClaimItem}
                        />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-40"
                    >← Prev</button>

                    <span className="text-sm text-gray-600">
                        Page {page} of {totalPages}
                    </span>

                    <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-40"
                    >Next →</button>
                </div>
            )}

            {/* Claim Modal */}
            <ClaimModal
                isOpen={!!claimItem}
                onClose={() => setClaimItem(null)}
                item={claimItem}
                onSuccess={fetchItems}
            />
        </div>
    )
}
