export default function EmptyState({ icon = '📭', title, description, action }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in-up">
            <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-4xl mb-5 animate-bounce-subtle">
                {icon}
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1.5">{title}</h3>
            {description && (
                <p className="text-sm text-slate-400 max-w-sm mb-6 leading-relaxed">{description}</p>
            )}
            {action && (
                <button
                    onClick={action.onClick}
                    className="btn btn-primary shimmer-btn"
                >
                    {action.label}
                </button>
            )}
        </div>
    )
}
