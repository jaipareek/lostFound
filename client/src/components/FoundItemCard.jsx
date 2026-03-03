import StatusBadge from './StatusBadge'
import { MapPin, Calendar, Hand } from 'lucide-react'

export default function FoundItemCard({ item, onClaim, showClaimButton = true }) {
    const isAvailable = item.status === 'AVAILABLE'

    return (
        <div className="group bg-slate-800/60 rounded-2xl border border-white/8 overflow-hidden hover:border-indigo-500/20 transition-all duration-300 flex flex-col">
            {/* Image */}
            <div className="relative h-48 bg-slate-900/50 overflow-hidden">
                {item.image_url ? (
                    <img
                        src={item.image_url}
                        alt={item.item_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-slate-800 to-slate-900">
                        {item.category?.icon || '📦'}
                    </div>
                )}
                {/* Badge overlay */}
                <div className="absolute top-3 right-3">
                    <StatusBadge status={item.status} />
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col p-5">
                <h3 className="font-bold text-white text-base leading-tight line-clamp-1 mb-1 group-hover:text-indigo-400 transition-colors">
                    {item.item_name}
                </h3>

                {item.category && (
                    <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mb-3">
                        {item.category.icon} {item.category.name}
                    </span>
                )}

                {item.description && (
                    <p className="text-[13px] text-slate-500 line-clamp-2 mb-4 flex-1 leading-relaxed">
                        {item.description}
                    </p>
                )}

                <div className="space-y-2 mt-auto mb-4 pt-3 border-t border-white/5">
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                        <MapPin size={13} className="text-slate-600 shrink-0" />
                        <span className="truncate">{item.found_location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                        <Calendar size={13} className="text-slate-600 shrink-0" />
                        <span>{new Date(item.date_found).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                </div>

                {/* Claim button */}
                {showClaimButton && (
                    <button
                        onClick={() => onClaim(item)}
                        disabled={!isAvailable}
                        className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${isAvailable
                            ? 'bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98]'
                            : 'bg-slate-700/40 text-slate-600 cursor-not-allowed border border-white/5'
                            }`}
                    >
                        {isAvailable ? <><Hand size={15} /> Claim This Item</> : 'Not Available'}
                    </button>
                )}
            </div>
        </div>
    )
}
