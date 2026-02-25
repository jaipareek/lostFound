import Modal from './Modal'

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title = 'Are you sure?',
    message = 'This action cannot be undone.',
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'danger',   // 'danger' | 'primary'
    loading = false,
}) {
    const btnClass = variant === 'danger' ? 'btn-danger' : 'btn-primary'

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <p className="text-gray-600 text-sm mb-6">{message}</p>
            <div className="flex gap-3 justify-end">
                <button
                    onClick={onClose}
                    disabled={loading}
                    className="btn-secondary"
                >
                    {cancelLabel}
                </button>
                <button
                    onClick={onConfirm}
                    disabled={loading}
                    className={btnClass}
                >
                    {loading ? 'Processing...' : confirmLabel}
                </button>
            </div>
        </Modal>
    )
}
