import StatusBadge from './StatusBadge'
import { MapPin, Calendar, Hand } from 'lucide-react'

export default function FoundItemCard({ item, onClaim, showClaimButton = true }) {
    const isAvailable = item.status === 'AVAILABLE'

    return (
        <div className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover-lift transition-all duration-300 flex flex-col shadow-sm">
            {/* Image */}
            <div className="relative h-48 bg-slate-50 overflow-hidden">
                {item.image_url ? (
                    <img
                        src={item.image_url}
                        alt={item.item_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-slate-50 to-slate-100">
                        {item.category?.icon || '📦'}
                    </div>
                )}
                {/* Badge overlay */}
                <div className="absolute top-3 right-3">
                    <StatusBadge status={item.status} />
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col p-5">
                <h3 className="font-bold text-slate-900 text-base leading-tight line-clamp-1 mb-1 group-hover:text-blue-600 transition-colors">
                    {item.item_name}
                </h3>

                {item.category && (
                    <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mb-3">
                        {item.category.icon} {item.category.name}
                    </span>
                )}

                {item.description && (
                    <p className="text-[13px] text-slate-500 line-clamp-2 mb-4 flex-1 leading-relaxed">
                        {item.description}
                    </p>
                )}

                <div className="space-y-2 mt-auto mb-4 pt-3 border-t border-slate-50">
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                        <MapPin size={13} className="text-slate-300 shrink-0" />
                        <span className="truncate">{item.found_location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                        <Calendar size={13} className="text-slate-300 shrink-0" />
                        <span>{new Date(item.date_found).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                </div>

                {/* Claim button */}
                {showClaimButton && (
                    <button
                        onClick={() => onClaim(item)}
                        disabled={!isAvailable}
                        className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${isAvailable
                            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm active:scale-[0.98]'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                    >
                        {isAvailable ? <><Hand size={15} /> Claim This Item</> : 'Not Available'}
                    </button>
                )}
            </div>
        </div>
    )
}
