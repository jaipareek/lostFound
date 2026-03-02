import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Search,
    ShieldCheck,
    ArrowRight,
    Users,
    Clock,
    Sparkles,
    Smartphone,
    Watch,
    Laptop,
    Briefcase,
    Zap,
    Mail,
    CheckCircle2,
    Activity,
    Layers,
    Cpu
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const items = [
    { text: 'Phone', icon: <Smartphone className="text-blue-500" /> },
    { text: 'Laptop', icon: <Laptop className="text-purple-500" /> },
    { text: 'Watch', icon: <Watch className="text-orange-500" /> },
    { text: 'Charger', icon: <Zap className="text-yellow-500" /> },
    { text: 'Wallet', icon: <Briefcase className="text-green-500" /> }
]

export default function LandingPage() {
    const [index, setIndex] = useState(0)
    const [fade, setFade] = useState(true)
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
    const navigate = useNavigate()
    const { user } = useAuth()
    const featureRef = useRef(null)
    const footerRef = useRef(null)

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({ x: e.clientX, y: e.clientY })
        }
        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
            setFade(false)
            setTimeout(() => {
                setIndex((prev) => (prev + 1) % items.length)
                setFade(true)
            }, 500)
        }, 3500)
        return () => clearInterval(interval)
    }, [])

    const handleAction = () => {
        if (user) {
            if (user.role === 'student') navigate('/student/inventory')
            else if (user.role === 'authority') navigate('/authority/dashboard')
            else if (user.role === 'admin') navigate('/admin/users')
        } else {
            navigate('/login')
        }
    }

    const scrollToFeatures = () => {
        featureRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const scrollToContact = () => {
        footerRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    return (
        <div className="min-h-screen bg-black text-white selection:bg-primary-500/30 overflow-x-hidden font-inter relative cursor-default">
            {/* Minimalist Subsurface Glow */}
            <div
                className="fixed pointer-events-none z-[1] w-[800px] h-[800px] bg-primary-600/5 blur-[160px] rounded-full transition-transform duration-700 ease-out"
                style={{
                    transform: `translate(${mousePos.x - 400}px, ${mousePos.y - 400}px)`
                }}
            />

            {/* Subtle Noise Texture */}
            <div className="noise-overlay fixed inset-0 z-[100] opacity-[0.015] pointer-events-none" />

            {/* Float Glass Navigation */}
            <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-[110] w-[90%] max-w-5xl">
                <div className="flex items-center justify-between bg-zinc-900/60 backdrop-blur-2xl border border-white/5 px-8 py-4 rounded-3xl shadow-2xl">
                    <div className="flex items-center gap-4 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                            <Search className="text-white" size={20} strokeWidth={3} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black tracking-tight leading-none uppercase">TRACE</span>
                            <span className="text-[9px] font-black tracking-[0.4em] text-primary-500 leading-none mt-1 uppercase">Campus Network</span>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-10 text-[10px] font-black tracking-[0.3em] uppercase text-white/40">
                        <a href="#" onClick={(e) => { e.preventDefault(); scrollToFeatures() }} className="hover:text-white transition-all">Features</a>
                        <a href="#" onClick={(e) => { e.preventDefault(); scrollToContact() }} className="hover:text-white transition-all">Support</a>
                    </div>

                    <button
                        onClick={handleAction}
                        className="bg-white text-black px-8 py-3 rounded-xl font-black text-[11px] tracking-[0.2em] uppercase hover:bg-zinc-200 transition-all active:scale-95"
                    >
                        {user ? 'Dashboard' : 'Sign In'}
                    </button>
                </div>
            </nav>

            {/* Hero Section - Refined Elegance */}
            <main className="relative z-10 pt-48 pb-32 px-6 flex flex-col items-center">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-primary-400 text-[10px] font-black uppercase tracking-[0.3em] mb-12 animate-fade-in-up shadow-xl">
                        <Sparkles size={14} className="animate-pulse" />
                        <span>Reimagining Campus Recovery</span>
                    </div>

                    <h1 className="text-6xl lg:text-9xl font-black tracking-tighter leading-[0.9] mb-10 selection:text-white uppercase transition-all duration-700">
                        WE HELP YOU <br />
                        <span className="text-zinc-700">REDISCOVER</span> <br />
                        <div className="relative mt-8 h-[120px] lg:h-[200px] overflow-hidden flex items-center justify-center">
                            <div className={`transition-all duration-700 absolute inset-0 flex justify-center items-center ${fade ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-12 scale-95 blur-md'}`}>
                                <span className="text-iridescent py-4">
                                    {items[index].text}.
                                </span>
                            </div>
                        </div>
                    </h1>

                    <p className="max-w-xl mx-auto text-zinc-500 text-sm lg:text-base font-bold tracking-[0.1em] leading-relaxed mb-16 px-4 uppercase opacity-80">
                        Bridging the gap between lost objects and their rightful owners via our proprietary matching system.
                    </p>

                    <button
                        onClick={handleAction}
                        className="px-14 py-6 bg-primary-600 text-white font-black rounded-2xl hover:bg-primary-500 transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(37,99,235,0.2)] tracking-[0.3em] text-[11px] uppercase group"
                    >
                        Get Started <ArrowRight size={18} className="inline-block ml-3 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </main>

            {/* Stats Bento Grid - Clean & Standardized */}
            <section className="relative z-10 py-16 px-6">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { label: 'Returns', val: '2,481', icon: <ShieldCheck className="text-emerald-400" /> },
                        { label: 'Members', val: '15.2K', icon: <Users className="text-blue-400" /> },
                        { label: 'Avg Time', val: '12.4h', icon: <Clock className="text-violet-400" /> }
                    ].map((stat, i) => (
                        <div key={i} className="group premium-card p-12 hover-glow flex flex-col gap-8 text-center md:text-left animate-reveal" style={{ animationDelay: `${i * 100}ms` }}>
                            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                {stat.icon}
                            </div>
                            <div>
                                <h3 className="text-5xl font-black text-white tracking-widest leading-none mb-3 tabular-nums">{stat.val}</h3>
                                <p className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.5em] group-hover:text-primary-500 transition-colors uppercase">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Pipeline - High Spacing, No Overlaps */}
            <section ref={featureRef} className="relative z-10 py-40 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row items-end justify-between mb-24 gap-8">
                        <div>
                            <h2 className="text-5xl lg:text-7xl font-black tracking-tighter uppercase italic leading-none mb-4">RECOVERY<br /><span className="text-primary-600">PIPELINE.</span></h2>
                            <p className="text-zinc-500 font-black tracking-[0.3em] uppercase text-[10px]">Engineered for speed and security.</p>
                        </div>
                        <div className="h-[1px] flex-1 bg-white/10 hidden md:block mb-6 ml-12" />
                    </div>

                    <div className="grid lg:grid-cols-3 gap-16">
                        {[
                            {
                                title: 'Digital Reporting',
                                desc: 'Item metadata is securely logged with image verification.',
                                icon: <Cpu className="text-blue-500" />
                            },
                            {
                                title: 'AI Matching',
                                desc: 'Algorithm cross-references lost reports with found items in real-time.',
                                icon: <Activity className="text-primary-500" />
                            },
                            {
                                title: 'Verified Extraction',
                                desc: 'Secure hand-offs at authorized campus points only.',
                                icon: <Layers className="text-purple-500" />
                            }
                        ].map((s, i) => (
                            <div key={i} className="space-y-8 p-10 bg-white/[0.02] border border-white/5 rounded-3xl group hover:border-white/10 transition-all">
                                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-all">
                                    {s.icon}
                                </div>
                                <div>
                                    <h4 className="text-2xl font-black mb-4 uppercase tracking-tight">{s.title}</h4>
                                    <p className="text-zinc-500 font-bold leading-relaxed text-sm uppercase tracking-wider">{s.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Integrated Footer & Contact */}
            <footer ref={footerRef} className="relative z-10 py-32 px-6 border-t border-white/5">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-16">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center shadow-2xl">
                            <Search size={24} strokeWidth={3} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-black tracking-tighter leading-none italic uppercase">CAMPUS<span className="text-primary-600">_</span>TRACE</span>
                            <span className="text-[10px] font-black tracking-[0.4em] text-zinc-700 uppercase mt-1 italic">Est 2024</span>
                        </div>
                    </div>

                    <a
                        href="mailto:jai.pareek@mca.christuniversity.in"
                        className="group flex flex-col items-center md:items-end gap-2"
                    >
                        <span className="text-[11px] font-black text-zinc-700 uppercase tracking-[0.5em] mb-2 uppercase">Developer Access</span>
                        <div className="bg-zinc-900 border border-white/5 px-10 py-6 rounded-3xl flex items-center gap-6 group-hover:border-primary-500/50 transition-all">
                            <Mail size={20} className="text-primary-500" />
                            <span className="text-lg lg:text-xl font-black tracking-tight text-white italic">jai.pareek@mca.christuniversity.in</span>
                        </div>
                    </a>
                </div>
            </footer>
        </div>
    )
}
