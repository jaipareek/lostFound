export default function EmptyState({ icon = '📭', title, description, action }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in-up">
            <div className="w-20 h-20 rounded-2xl bg-slate-800/60 border border-white/8 flex items-center justify-center text-4xl mb-5 animate-bounce-subtle">
                {icon}
            </div>
            <h3 className="text-lg font-bold text-white mb-1.5">{title}</h3>
            {description && (
                <p className="text-sm text-slate-400 max-w-sm mb-6 leading-relaxed">{description}</p>
            )}
            {action && (
                <button
                    onClick={action.onClick}
                    className="px-6 py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-xl hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 transition-all active:scale-95"
                >
                    {action.label}
                </button>
            )}
        </div>
    )
}
