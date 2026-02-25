// Skeleton shimmer for loading states
function SkeletonBox({ className = '' }) {
    return (
        <div className={`bg-gray-200 rounded animate-pulse ${className}`} />
    )
}

export function CardSkeleton() {
    return (
        <div className="card space-y-3">
            <SkeletonBox className="h-40 w-full rounded-lg" />
            <SkeletonBox className="h-4 w-3/4" />
            <SkeletonBox className="h-4 w-1/2" />
            <div className="flex gap-2 pt-1">
                <SkeletonBox className="h-6 w-16 rounded-full" />
                <SkeletonBox className="h-6 w-20 rounded-full" />
            </div>
        </div>
    )
}

export function TableRowSkeleton({ cols = 5 }) {
    return (
        <tr className="border-b border-gray-100">
            {Array.from({ length: cols }).map((_, i) => (
                <td key={i} className="px-4 py-3">
                    <SkeletonBox className="h-4 w-full" />
                </td>
            ))}
        </tr>
    )
}

export function StatCardSkeleton() {
    return (
        <div className="card space-y-2">
            <SkeletonBox className="h-4 w-1/2" />
            <SkeletonBox className="h-8 w-1/3" />
        </div>
    )
}

export default SkeletonBox
