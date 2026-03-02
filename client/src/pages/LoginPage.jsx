import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Search, Mail, Lock, ArrowRight, Fingerprint, Shield, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
    const { login, loading } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ email: '', password: '' })
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
    const [error, setError] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [focusedField, setFocusedField] = useState(null)

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
        <div className="min-h-screen w-screen bg-[#030306] text-white font-inter relative flex items-center justify-center overflow-hidden">
            {/* Animated mesh gradient background */}
            <div className="absolute inset-0">
                <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] bg-indigo-600/20 rounded-full blur-[180px] animate-pulse-slow" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-violet-600/15 rounded-full blur-[160px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
                <div className="absolute top-[20%] right-[20%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[140px] animate-breathe" />
                <div className="absolute bottom-[30%] left-[15%] w-[300px] h-[300px] bg-purple-500/8 rounded-full blur-[120px] animate-breathe" style={{ animationDelay: '3s' }} />
            </div>

            {/* Interactive cursor aura */}
            <div
                className="fixed pointer-events-none z-[1] w-[900px] h-[900px] bg-indigo-500/[0.03] blur-[200px] rounded-full transition-transform duration-[1500ms] ease-out"
                style={{ transform: `translate(${mousePos.x - 450}px, ${mousePos.y - 450}px)` }}
            />

            {/* Noise */}
            <div className="noise-overlay" />

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 opacity-[0.015]" style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                backgroundSize: '60px 60px'
            }} />

            {/* Main content */}
            <div className="w-full max-w-[480px] relative z-10 px-6 py-20">
                {/* Brand */}
                <div className="text-center mb-14 animate-fade-in-up">
                    <div className="relative inline-flex items-center justify-center w-20 h-20 mb-8">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl blur-xl opacity-40 animate-breathe" />
                        <div className="relative w-full h-full bg-gradient-to-br from-indigo-500/20 to-violet-600/20 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl">
                            <Search className="text-indigo-400" size={32} strokeWidth={2} />
                        </div>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight uppercase leading-none mb-3">
                        CAMPUS<span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">_</span>TRACE
                    </h1>
                    <p className="text-zinc-500 text-sm font-medium tracking-wide">Lost & Found Intelligence Network</p>
                </div>

                {/* Glass Card */}
                <div className="animate-fade-in-up stagger-2 relative group">
                    {/* Card border glow */}
                    <div className="absolute -inset-[1px] bg-gradient-to-br from-indigo-500/20 via-transparent to-violet-500/20 rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                    <div className="relative bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-[32px] p-10 md:p-12 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8)] overflow-hidden">
                        {/* Interior glow */}
                        <div className="absolute top-0 right-0 w-60 h-60 bg-indigo-500/[0.05] blur-[100px] rounded-full -mr-28 -mt-28 group-hover:scale-150 transition-transform duration-1000" />
                        <div className="absolute bottom-0 left-0 w-40 h-40 bg-violet-500/[0.04] blur-[80px] rounded-full -ml-20 -mb-20" />

                        {/* Header */}
                        <div className="mb-10 relative">
                            <h2 className="text-2xl font-black text-white tracking-tight mb-2">Welcome back</h2>
                            <p className="text-zinc-500 text-sm font-medium">Enter your credentials to access the platform</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6 relative" noValidate>
                            {/* Error */}
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 animate-fade-in-up">
                                    <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                    </div>
                                    <span className="text-sm font-semibold text-red-400">{error}</span>
                                </div>
                            )}

                            {/* Email */}
                            <div className="space-y-2">
                                <label className={`flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] mb-2.5 ml-1 transition-colors duration-300 ${focusedField === 'email' ? 'text-indigo-400' : 'text-zinc-500'}`}>
                                    <Mail size={12} /> Email Address
                                </label>
                                <div className={`relative rounded-2xl transition-all duration-300 ${focusedField === 'email' ? 'ring-2 ring-indigo-500/30' : ''}`}>
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl px-5 py-4 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/40 transition-all duration-300 font-medium"
                                        placeholder="you@university.edu"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        onFocus={() => setFocusedField('email')}
                                        onBlur={() => setFocusedField(null)}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <label className={`flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] mb-2.5 ml-1 transition-colors duration-300 ${focusedField === 'password' ? 'text-indigo-400' : 'text-zinc-500'}`}>
                                    <Lock size={12} /> Password
                                </label>
                                <div className={`relative rounded-2xl transition-all duration-300 ${focusedField === 'password' ? 'ring-2 ring-indigo-500/30' : ''}`}>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl px-5 py-4 pr-12 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/40 transition-all duration-300 font-medium"
                                        placeholder="••••••••"
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        onFocus={() => setFocusedField('password')}
                                        onBlur={() => setFocusedField(null)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="pt-3">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="shimmer-btn w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-2xl font-bold text-sm tracking-wide shadow-2xl shadow-indigo-600/20 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group/btn relative overflow-hidden"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-3">
                                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                            <span>Authenticating...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <Fingerprint size={18} />
                                            Sign In
                                            <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* Footer */}
                        <div className="mt-10 pt-7 border-t border-white/[0.04] flex items-center justify-center gap-6">
                            <div className="flex items-center gap-2 text-zinc-600">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-bold uppercase tracking-[0.15em]">Encrypted</span>
                            </div>
                            <div className="w-px h-3 bg-zinc-800" />
                            <div className="flex items-center gap-2 text-zinc-600">
                                <Shield size={10} />
                                <span className="text-[10px] font-bold uppercase tracking-[0.15em]">Secure</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom text */}
                <p className="mt-10 text-center text-zinc-700 text-[10px] font-bold uppercase tracking-[0.25em] animate-fade-in-up stagger-6">
                    MCA Christ University — Campus Safety Initiative
                </p>
            </div>
        </div>
    )
}
