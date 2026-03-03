import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
    const overlayRef = useRef()

    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose() }
        if (isOpen) document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [isOpen, onClose])

    // Do NOT set body overflow hidden — let the overlay handle scroll
    if (!isOpen) return null

    const sizeClass = {
        sm: 'max-w-sm',
        md: 'max-w-xl',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    }[size] || 'max-w-xl'

    const handleOverlayClick = (e) => {
        if (e.target === overlayRef.current) onClose()
    }

    return createPortal(
        <div
            ref={overlayRef}
            onClick={handleOverlayClick}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in"
        >
            <div className={`modal-content bg-slate-900 rounded-2xl shadow-2xl shadow-black/50 w-full ${sizeClass} max-h-[85vh] flex flex-col animate-fade-in-up border border-white/10`}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 shrink-0">
                    <h2 className="text-lg font-bold text-white">{title}</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white transition-colors hover:bg-white/10"
                    >
                        <X size={18} />
                    </button>
                </div>
                {/* Body — scrollable */}
                <div
                    className="flex-1 px-6 py-5 text-slate-200"
                    style={{ overflowY: 'auto' }}
                >
                    {children}
                </div>
            </div>
        </div>,
        document.body
    )
}
