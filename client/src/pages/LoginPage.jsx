import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Search, Mail, Lock, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react'

export default function LoginPage() {
    const { login, loading } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ email: '', password: '' })
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
    const [error, setError] = useState('')

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({ x: e.clientX, y: e.clientY })
        }
        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        const result = await login(form.email, form.password)
        if (result.success) {
            toast.success('Access Granted')
            if (result.role === 'student') navigate('/student/inventory')
            else if (result.role === 'authority') navigate('/authority/dashboard')
            else if (result.role === 'admin') navigate('/admin/users')
        } else {
            setError(result.message)
            toast.error(result.message)
        }
    }

    return (
        <div className="min-h-screen w-screen bg-[#000] text-white selection:bg-primary-500/30 font-inter relative flex flex-col items-center justify-center py-20 px-6">
            {/* Soft, Beautiful Background Aura */}
            <div
                className="fixed pointer-events-none z-[1] w-[1000px] h-[1000px] bg-primary-600/5 blur-[160px] rounded-full transition-transform duration-1000 ease-out"
                style={{
                    transform: `translate(${mousePos.x - 500}px, ${mousePos.y - 500}px)`
                }}
            />

            <div className="absolute inset-0 z-0 bg-gradient-to-br from-black via-zinc-950 to-black opacity-80" />
            <div className="noise-overlay opacity-[0.01]" />

            <div className="w-full max-w-lg relative z-10 space-y-12 animate-fade-in">
                {/* Minimalist Branding */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/5 border border-white/10 rounded-2xl shadow-2xl mb-2">
                        <Search className="text-primary-500" size={28} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight uppercase leading-none italic">
                        CAMPUS<span className="text-primary-600">_</span>TRACE
                    </h1>
                </div>

                {/* Elegant Glass Login Card */}
                <div className="bg-zinc-900/30 backdrop-blur-3xl border border-white/10 rounded-[40px] p-12 md:p-14 shadow-3xl relative overflow-hidden">
                    <div className="mb-12 text-center md:text-left space-y-2">
                        <h2 className="text-2xl font-black text-white tracking-tight uppercase italic">Welcome Back</h2>
                        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] opacity-60 px-1">Verify identity to proceed</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-10" noValidate>
                        {/* Error Message Display */}
                        {error && (
                            <div className="bg-red-500 border border-red-400 rounded-2xl p-4 flex items-center gap-3 animate-fade-in shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                <span className="text-[11px] font-black uppercase tracking-wider text-white">{error}</span>
                            </div>
                        )}

                        {/* Elegant Input Fields */}
                        <div className="space-y-6">
                            <div className="space-y-3 group">
                                <label className="flex items-center gap-2 text-[9px] font-black text-zinc-600 uppercase tracking-[0.4em] ml-2 group-focus-within:text-primary-500 transition-colors">
                                    <Mail size={12} /> Email Address
                                </label>
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-6 py-5 text-white placeholder:text-zinc-800 focus:outline-none focus:ring-1 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all font-medium text-sm"
                                    placeholder="Enter your university email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                />
                            </div>

                            <div className="space-y-3 group">
                                <label className="flex items-center gap-2 text-[9px] font-black text-zinc-600 uppercase tracking-[0.4em] ml-2 group-focus-within:text-primary-500 transition-colors">
                                    <Lock size={12} /> Access Key
                                </label>
                                <input
                                    type="password"
                                    required
                                    className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-6 py-5 text-white placeholder:text-zinc-800 focus:outline-none focus:ring-1 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all font-medium text-sm"
                                    placeholder="Enter your secure password"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Beautifully Simple Action Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-6 bg-white text-black hover:bg-zinc-200 rounded-3xl font-black uppercase tracking-[0.4em] text-[11px] shadow-2xl active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-4 group"
                        >
                            {loading ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 border-2 border-black/10 border-t-black rounded-full animate-spin"></div>
                                    <span>Authorizing</span>
                                </div>
                            ) : (
                                <>
                                    Sign In <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Bottom Security Note */}
                    <div className="mt-12 pt-8 border-t border-white/5 text-center flex items-center justify-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">Network Connection Secure</span>
                    </div>
                </div>

                {/* Sub-Card Footer */}
                <div className="text-center opacity-40">
                    <p className="text-[9px] font-black uppercase tracking-[0.6em] text-zinc-500">MCA Christ University • Network Control</p>
                </div>
            </div>
        </div>
    )
}
