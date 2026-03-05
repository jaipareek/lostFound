import { useState, useEffect, useRef, useCallback } from 'react'
import api from '../lib/axios'
import { Bell, Check, CheckCheck, X } from 'lucide-react'

export default function NotificationBell() {
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const panelRef = useRef(null)

    // Fetch unread count (lightweight — for badge)
    const fetchUnreadCount = useCallback(async () => {
        try {
            const { data } = await api.get('/notifications/unread-count')
            setUnreadCount(data.count || 0)
        } catch { /* silent */ }
    }, [])

    // Fetch full notifications (when dropdown opens)
    const fetchNotifications = useCallback(async () => {
        setLoading(true)
        try {
            const { data } = await api.get('/notifications')
            setNotifications(data.notifications || [])
        } catch { /* silent */ }
        finally { setLoading(false) }
    }, [])

    // Poll unread count every 15 seconds
    useEffect(() => {
        fetchUnreadCount()
        const interval = setInterval(fetchUnreadCount, 15000)
        return () => clearInterval(interval)
    }, [fetchUnreadCount])

    // When panel opens, fetch full list
    useEffect(() => {
        if (isOpen) fetchNotifications()
    }, [isOpen, fetchNotifications])

    // Click outside to close
    useEffect(() => {
        const handler = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                setIsOpen(false)
            }
        }
        if (isOpen) document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [isOpen])

    const markAsRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`)
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch { /* silent */ }
    }

    const markAllRead = async () => {
        try {
            await api.patch('/notifications/read-all')
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
            setUnreadCount(0)
        } catch { /* silent */ }
    }

    const timeAgo = (dateStr) => {
        const now = new Date()
        const date = new Date(dateStr)
        const seconds = Math.floor((now - date) / 1000)
        if (seconds < 60) return 'Just now'
        const minutes = Math.floor(seconds / 60)
        if (minutes < 60) return `${minutes}m ago`
        const hours = Math.floor(minutes / 60)
        if (hours < 24) return `${hours}h ago`
        const days = Math.floor(hours / 24)
        return `${days}d ago`
    }

    return (
        <div className="relative" ref={panelRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200"
                title="Notifications"
            >
                <Bell size={19} strokeWidth={2} />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-black rounded-full shadow-lg shadow-red-500/40 animate-bounce-in border-2 border-[#030712]">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-[360px] max-h-[440px] bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50 animate-fade-in-down">
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-white">Notifications</h3>
                            {unreadCount > 0 && (
                                <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-bold rounded-full">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllRead}
                                    className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider hover:text-indigo-400 transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
                                >
                                    <CheckCheck size={12} /> Read all
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="overflow-y-auto max-h-[360px] scrollbar-thin">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="w-5 h-5 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                                <div className="w-14 h-14 rounded-2xl bg-slate-800/80 flex items-center justify-center text-3xl mb-3 border border-white/5">
                                    🔕
                                </div>
                                <p className="text-sm font-semibold text-slate-400">No notifications yet</p>
                                <p className="text-xs text-slate-600 mt-1">You'll be notified when your claims are reviewed</p>
                            </div>
                        ) : (
                            <div>
                                {notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        onClick={() => !n.is_read && markAsRead(n.id)}
                                        className={`flex items-start gap-3 px-5 py-3.5 border-b border-white/[0.03] transition-all cursor-pointer
                                            ${n.is_read
                                                ? 'opacity-50 hover:opacity-70'
                                                : 'bg-indigo-500/[0.04] hover:bg-indigo-500/[0.08]'
                                            }`}
                                    >
                                        {/* Icon */}
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 border ${n.type === 'CLAIM_APPROVED'
                                            ? 'bg-emerald-500/10 border-emerald-500/20'
                                            : n.type === 'CLAIM_INFO_REQUESTED'
                                                ? 'bg-blue-500/10 border-blue-500/20'
                                                : 'bg-red-500/10 border-red-500/20'
                                            }`}>
                                            {n.type === 'CLAIM_APPROVED' ? '🎉' : n.type === 'CLAIM_INFO_REQUESTED' ? 'ℹ️' : '❌'}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="text-xs font-bold text-white truncate">{n.title}</p>
                                                {!n.is_read && (
                                                    <div className="w-2 h-2 rounded-full bg-indigo-400 shrink-0 animate-pulse" />
                                                )}
                                            </div>
                                            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed line-clamp-2">{n.message}</p>
                                            <p className="text-[10px] text-slate-600 mt-1 font-semibold">{timeAgo(n.created_at)}</p>
                                        </div>

                                        {/* Read check */}
                                        {!n.is_read && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); markAsRead(n.id) }}
                                                className="shrink-0 p-1.5 rounded-lg text-slate-600 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
                                                title="Mark as read"
                                            >
                                                <Check size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
