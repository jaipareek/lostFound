export default function CategoryFilter({ categories, selected, onChange }) {
    return (
        <div className="flex flex-wrap gap-2">
            {/* "All" tab */}
            <button
                onClick={() => onChange('')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${selected === ''
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'bg-slate-800/60 text-slate-400 border border-white/10 hover:bg-white/5 hover:text-white'
                    }`}
            >
                All
            </button>

            {categories?.map((cat) => (
                <button
                    key={cat.id}
                    onClick={() => onChange(cat.id === selected ? '' : cat.id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${selected === cat.id
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                        : 'bg-slate-800/60 text-slate-400 border border-white/10 hover:bg-white/5 hover:text-white'
                        }`}
                >
                    {cat.icon} {cat.name}
                </button>
            ))}
        </div>
    )
}
