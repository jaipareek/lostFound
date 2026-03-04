import Modal from './Modal'

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title = 'Are you sure?',
    message = 'This action cannot be undone.',
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    danger = false,
    loading = false,
}) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <p className="text-slate-300 text-sm mb-6 leading-relaxed">{message}</p>
            <div className="flex gap-3 justify-end">
                <button
                    onClick={onClose}
                    disabled={loading}
                    className="px-5 py-2.5 bg-slate-700/50 text-slate-300 rounded-xl text-sm font-semibold border border-white/10 hover:bg-slate-700 transition-all disabled:opacity-50"
                >
                    {cancelLabel}
                </button>
                <button
                    onClick={onConfirm}
                    disabled={loading}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 ${
                        danger
                            ? 'bg-red-600 text-white hover:bg-red-500 hover:shadow-lg hover:shadow-red-500/20'
                            : 'bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20'
                    }`}
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Processing...
                        </span>
                    ) : confirmLabel}
                </button>
            </div>
        </Modal>
    )
}
