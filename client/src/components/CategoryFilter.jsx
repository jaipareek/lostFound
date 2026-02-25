export default function CategoryFilter({ categories, selected, onChange }) {
    return (
        <div className="flex flex-wrap gap-2">
            {/* "All" tab */}
            <button
                onClick={() => onChange('')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${selected === ''
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                    }`}
            >
                All
            </button>

            {categories?.map((cat) => (
                <button
                    key={cat.id}
                    onClick={() => onChange(cat.id === selected ? '' : cat.id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${selected === cat.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                        }`}
                >
                    {cat.icon} {cat.name}
                </button>
            ))}
        </div>
    )
}
