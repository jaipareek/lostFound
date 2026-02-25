import StatusBadge from './StatusBadge'
import { MapPin, Calendar } from 'lucide-react'

export default function FoundItemCard({ item, onClaim, showClaimButton = true }) {
    const isAvailable = item.status === 'AVAILABLE'

    return (
        <div className="card group hover:shadow-lg transition-shadow duration-200 flex flex-col">
            {/* Image */}
            <div className="relative h-44 bg-gray-100 rounded-xl overflow-hidden mb-4 -mx-2 -mt-2">
                {item.image_url ? (
                    <img
                        src={item.image_url}
                        alt={item.item_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-gray-50 to-gray-200">
                        {item.category?.icon || '📦'}
                    </div>
                )}
                {/* Status badge overlay */}
                <div className="absolute top-2 right-2">
                    <StatusBadge status={item.status} />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col">
                <h3 className="font-semibold text-gray-800 text-base leading-tight line-clamp-1 mb-1">
                    {item.item_name}
                </h3>

                {item.category && (
                    <span className="text-xs text-primary-600 font-medium mb-2">
                        {item.category.icon} {item.category.name}
                    </span>
                )}

                {item.description && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3 flex-1">
                        {item.description}
                    </p>
                )}

                <div className="space-y-1.5 mt-auto">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <MapPin size={12} className="text-gray-400 shrink-0" />
                        <span className="truncate">{item.found_location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Calendar size={12} className="text-gray-400 shrink-0" />
                        <span>{new Date(item.date_found).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                </div>

                {/* Claim button */}
                {showClaimButton && (
                    <button
                        onClick={() => onClaim(item)}
                        disabled={!isAvailable}
                        className={`mt-4 w-full py-2 rounded-lg text-sm font-medium transition-colors ${isAvailable
                                ? 'bg-primary-600 text-white hover:bg-primary-700'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        {isAvailable ? '✋ Claim This Item' : 'Not Available'}
                    </button>
                )}
            </div>
        </div>
    )
}
