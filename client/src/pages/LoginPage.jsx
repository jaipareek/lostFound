import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
    const { login, loading } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ email: '', password: '' })

    const handleSubmit = async (e) => {
        e.preventDefault()
        const result = await login(form.email, form.password)
        if (result.success) {
            toast.success('Welcome back!')
            if (result.role === 'student') navigate('/student')
            else if (result.role === 'authority') navigate('/authority')
            else if (result.role === 'admin') navigate('/admin')
        } else {
            toast.error(result.message)
        }
    }

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-600/20 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-secondary-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo / Brand */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-xl rounded-[2rem] shadow-2xl mb-6 border border-white/10 group hover:scale-110 transition-transform duration-500">
                        <span className="text-4xl group-hover:rotate-12 transition-transform">🔍</span>
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter">
                        Lost<span className="text-primary-500">&</span>Found
                    </h1>
                    <p className="text-gray-400 mt-2 font-medium tracking-wide uppercase text-[10px]">Campus Asset Intelligence</p>
                </div>

                {/* Card */}
                <div className="bg-white/[0.03] backdrop-blur-2xl rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] p-10 border border-white/[0.05]">
                    <div className="mb-10 text-center">
                        <h2 className="text-xl font-black text-white tracking-tight">Welcome Back</h2>
                        <p className="text-gray-500 text-xs mt-1 font-medium">Verify your credentials to continue</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Identity</label>
                            <input
                                id="email"
                                type="email"
                                required
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all font-medium"
                                placeholder="you@college.edu"
                                autoComplete="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Access Key</label>
                            <input
                                id="password"
                                type="password"
                                required
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all font-medium"
                                placeholder="••••••••"
                                autoComplete="current-password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                            />
                        </div>

                        <button
                            type="submit"
                            id="login-btn"
                            disabled={loading}
                            className="w-full py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-primary-900/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Authorizing...
                                </span>
                            ) : (
                                <>
                                    Establish Link
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-white/[0.05] text-center">
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                            Secured by Campus Control<br />
                            <span className="text-gray-600 font-medium normal-case mt-1 block">Request access from your IT department</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
