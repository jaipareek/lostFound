import { useState, useEffect, useRef, useCallback } from 'react'
import ScrollReveal from '../components/ScrollReveal'
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
    Activity,
    Layers,
    Cpu,
    ChevronDown,
    Fingerprint,
    ArrowUpRight
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const items = [
    { text: 'PHONE', icon: <Smartphone />, color: '#3b82f6' },
    { text: 'LAPTOP', icon: <Laptop />, color: '#8b5cf6' },
    { text: 'WATCH', icon: <Watch />, color: '#f59e0b' },
    { text: 'CHARGER', icon: <Zap />, color: '#10b981' },
    { text: 'WALLET', icon: <Briefcase />, color: '#ef4444' }
]

/* ── tiny floating particle ── */
function Particle({ delay, size, x, duration }) {
    return (
        <div
            className="absolute rounded-full bg-white/[0.03]"
            style={{
                width: size,
                height: size,
                left: `${x}%`,
                bottom: '-20px',
                animation: `float-up ${duration}s ease-in-out ${delay}s infinite`,
            }}
        />
    )
}

/* ── animated counter ── */
function AnimatedNumber({ target, suffix = '' }) {
    const [val, setVal] = useState(0)
    const ref = useRef(null)
    const started = useRef(false)

    useEffect(() => {
        const observer = new IntersectionObserver(([e]) => {
            if (e.isIntersecting && !started.current) {
                started.current = true
                const num = parseFloat(target.replace(/[^0-9.]/g, ''))
                const hasK = target.includes('K')
                const steps = 40
                let i = 0
                const timer = setInterval(() => {
                    i++
                    const progress = 1 - Math.pow(1 - i / steps, 3)
                    setVal(hasK ? (num * progress).toFixed(1) : Math.round(num * progress).toLocaleString())
                    if (i >= steps) clearInterval(timer)
                }, 30)
            }
        }, { threshold: 0.5 })
        if (ref.current) observer.observe(ref.current)
        return () => observer.disconnect()
    }, [target])

    return <span ref={ref}>{val}{suffix}</span>
}

export default function LandingPage() {
    const [index, setIndex] = useState(0)
    const [fade, setFade] = useState(true)
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
    const [scrollY, setScrollY] = useState(0)
    const navigate = useNavigate()
    const { user } = useAuth()
    const featureRef = useRef(null)
    const footerRef = useRef(null)

    useEffect(() => {
        const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY })
        const handleScroll = () => setScrollY(window.scrollY)
        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('scroll', handleScroll)
        }
    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
            setFade(false)
            setTimeout(() => {
                setIndex((prev) => (prev + 1) % items.length)
                setFade(true)
            }, 500)
        }, 3000)
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

    const heroParallax = Math.min(scrollY * 0.3, 200)
    const heroOpacity = Math.max(1 - scrollY / 600, 0)

    return (
        <div className="min-h-screen bg-[#030303] text-white selection:bg-indigo-500/30 overflow-x-hidden font-inter relative">

            {/* ── Ambient cursor glow ── */}
            <div
                className="fixed pointer-events-none z-[1] w-[900px] h-[900px] rounded-full transition-transform duration-1000 ease-out"
                style={{
                    background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)',
                    transform: `translate(${mousePos.x - 450}px, ${mousePos.y - 450}px)`
                }}
            />

            {/* ── Noise texture ── */}
            <div className="noise-overlay fixed inset-0 z-[100] pointer-events-none" />

            {/* ── Floating particles ── */}
            <div className="fixed inset-0 z-[2] pointer-events-none overflow-hidden">
                {[...Array(12)].map((_, i) => (
                    <Particle key={i} delay={i * 1.5} size={`${3 + Math.random() * 4}px`} x={Math.random() * 100} duration={12 + Math.random() * 10} />
                ))}
            </div>

            {/* ── Gradient mesh background ── */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/[0.04] rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-violet-600/[0.03] rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '4s' }} />
                <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] bg-blue-600/[0.02] rounded-full blur-[100px] animate-breathe" />
            </div>

            {/* ═══════════════ NAVIGATION ═══════════════ */}
            <nav className={`fixed top-0 left-0 right-0 z-[110] transition-all duration-500 ${scrollY > 50 ? 'py-2' : 'py-5'}`}>
                <div className="mx-auto max-w-5xl px-4">
                    <div className={`flex items-center justify-between px-6 py-3 rounded-2xl transition-all duration-500 bg-white/[0.04] backdrop-blur-2xl border shadow-2xl ${scrollY > 50 ? 'border-white/10 bg-black/50' : 'border-white/[0.06]'}`}>
                        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 group-hover:scale-105 transition-all">
                                <Search className="text-white" size={16} strokeWidth={3} />
                            </div>
                            <span className="text-[15px] font-bold tracking-tight leading-none">CampusTrace</span>
                        </div>

                        <div className="hidden md:flex items-center bg-white/[0.04] rounded-xl px-1 py-1 gap-1">
                            <a href="#" onClick={(e) => { e.preventDefault(); featureRef.current?.scrollIntoView({ behavior: 'smooth' }) }}
                                className="px-5 py-2 rounded-lg text-[11px] font-semibold text-white/50 hover:text-white hover:bg-white/[0.06] transition-all duration-200">How it works</a>
                            <a href="#" onClick={(e) => { e.preventDefault(); footerRef.current?.scrollIntoView({ behavior: 'smooth' }) }}
                                className="px-5 py-2 rounded-lg text-[11px] font-semibold text-white/50 hover:text-white hover:bg-white/[0.06] transition-all duration-200">Contact</a>
                        </div>

                        <button
                            onClick={handleAction}
                            className="group bg-white text-black px-6 py-2 rounded-lg font-semibold text-[12px] hover:bg-indigo-500 hover:text-white transition-all duration-300 active:scale-95"
                        >
                            <span className="flex items-center gap-1.5">
                                {user ? 'Dashboard' : 'Sign In'}
                                <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* ═══════════════ HERO ═══════════════ */}
            <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 pt-32">
                <div
                    className="max-w-5xl mx-auto text-center"
                    style={{ transform: `translateY(${heroParallax}px)`, opacity: heroOpacity }}
                >

                    {/* Main headline */}
                    <h1 className="text-5xl sm:text-7xl lg:text-[6.5rem] font-black tracking-[-0.04em] leading-[0.9] mb-6 animate-fade-in-up stagger-1">
                        <span className="text-white/90">Lost something?</span><br />
                        <span className="text-white/30">We'll find your</span><br />
                        <div className="relative h-[70px] sm:h-[90px] lg:h-[130px] mt-2 overflow-hidden flex items-center justify-center">
                            <div className={`transition-all duration-700 absolute inset-0 flex items-center justify-center gap-4 ${fade ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95 blur-sm'}`}>
                                <span
                                    className="font-black"
                                    style={{
                                        color: items[index].color,
                                        textShadow: `0 0 80px ${items[index].color}40, 0 0 30px ${items[index].color}20`
                                    }}
                                >
                                    {items[index].text}.
                                </span>
                            </div>
                        </div>
                    </h1>

                    <p className="max-w-lg mx-auto text-white/30 text-sm lg:text-base font-medium leading-relaxed mb-12 animate-fade-in-up stagger-2">
                        The smart campus recovery platform that connects lost items
                        with their owners through verified claims and real-time tracking.
                    </p>

                    {/* CTA buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up stagger-3">
                        <button
                            onClick={handleAction}
                            className="group px-10 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-2xl hover:shadow-[0_20px_60px_-15px_rgba(99,102,241,0.4)] transition-all duration-500 hover:scale-[1.02] active:scale-95 text-sm tracking-wide"
                        >
                            Get Started Free
                            <ArrowRight size={16} className="inline-block ml-2 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button
                            onClick={() => featureRef.current?.scrollIntoView({ behavior: 'smooth' })}
                            className="px-8 py-4 text-white/50 font-semibold rounded-2xl hover:text-white hover:bg-white/[0.04] transition-all duration-300 text-sm flex items-center gap-2"
                        >
                            Learn more <ChevronDown size={16} className="animate-bounce-subtle" />
                        </button>
                    </div>

                    {/* Scroll indicator */}
                    <div className="mt-20 flex flex-col items-center gap-2 animate-fade-in stagger-4">
                        <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
                    </div>
                </div>
            </main>

            {/* ═══════════════ STATS ═══════════════ */}
            <section className="relative z-10 py-24 px-6">
                <div className="max-w-5xl mx-auto">
                    <ScrollReveal>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-white/[0.06] rounded-3xl overflow-hidden">
                            {[
                                { label: 'Items Returned', val: '2,481', target: '2481', icon: <ShieldCheck size={20} />, color: 'emerald' },
                                { label: 'Active Users', val: '15.2K', target: '15.2K', icon: <Users size={20} />, color: 'blue' },
                                { label: 'Avg Recovery Time', val: '12h', target: '12', icon: <Clock size={20} />, color: 'violet', suffix: 'h' }
                            ].map((stat, i) => (
                                <div key={i} className="bg-[#0a0a0a] p-10 lg:p-14 group hover:bg-white/[0.02] transition-colors duration-500">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-8 bg-${stat.color}-500/10 text-${stat.color}-400 group-hover:scale-110 transition-transform duration-500`}>
                                        {stat.icon}
                                    </div>
                                    <div className="text-4xl lg:text-5xl font-black text-white tracking-tight mb-2 tabular-nums">
                                        <AnimatedNumber target={stat.val} suffix={stat.suffix || ''} />
                                        {stat.val.includes('K') && 'K'}
                                    </div>
                                    <p className="text-xs font-semibold text-white/30 tracking-wide">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* ═══════════════ FEATURES / HOW IT WORKS ═══════════════ */}
            <section ref={featureRef} className="relative z-10 py-32 px-6">
                <div className="max-w-5xl mx-auto">
                    <ScrollReveal>
                        <div className="text-center mb-20">
                            <span className="text-[11px] font-semibold tracking-widest text-indigo-400 uppercase mb-4 block">How it works</span>
                            <h2 className="text-4xl lg:text-6xl font-black tracking-[-0.03em] leading-tight">
                                Three steps to<br />
                                <span className="text-white/30">recovery.</span>
                            </h2>
                        </div>
                    </ScrollReveal>

                    <div className="grid lg:grid-cols-3 gap-6">
                        {[
                            {
                                step: '01',
                                title: 'Report',
                                desc: 'Lost something? File a detailed report with photos, location, and distinguishing features.',
                                icon: <Cpu size={24} />,
                                gradient: 'from-blue-500/10 to-cyan-500/5',
                                iconColor: 'text-blue-400',
                                borderColor: 'hover:border-blue-500/20'
                            },
                            {
                                step: '02',
                                title: 'Match',
                                desc: 'Our system cross-references your report against all found items in real-time.',
                                icon: <Activity size={24} />,
                                gradient: 'from-indigo-500/10 to-violet-500/5',
                                iconColor: 'text-indigo-400',
                                borderColor: 'hover:border-indigo-500/20'
                            },
                            {
                                step: '03',
                                title: 'Recover',
                                desc: 'Verify ownership, get approved by campus authorities, and collect your item.',
                                icon: <Fingerprint size={24} />,
                                gradient: 'from-violet-500/10 to-purple-500/5',
                                iconColor: 'text-violet-400',
                                borderColor: 'hover:border-violet-500/20'
                            }
                        ].map((s, i) => (
                            <ScrollReveal key={i} delay={i * 0.12}>
                                <div className={`group relative p-8 lg:p-10 bg-white/[0.02] border border-white/[0.05] rounded-3xl ${s.borderColor} transition-all duration-500 hover:-translate-y-1`}>
                                    {/* Step number */}
                                    <span className="text-[80px] lg:text-[100px] font-black text-white/[0.03] absolute top-4 right-6 leading-none select-none group-hover:text-white/[0.05] transition-colors duration-700">
                                        {s.step}
                                    </span>

                                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.gradient} flex items-center justify-center ${s.iconColor} mb-8 group-hover:scale-110 transition-transform duration-500`}>
                                        {s.icon}
                                    </div>

                                    <h4 className="text-xl font-bold mb-3 tracking-tight">{s.title}</h4>
                                    <p className="text-white/35 text-sm leading-relaxed font-medium">{s.desc}</p>

                                    {/* Bottom glow line */}
                                    <div className="absolute bottom-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════ TRUST BANNER ═══════════════ */}
            <section className="relative z-10 py-20 px-6">
                <ScrollReveal>
                    <div className="max-w-5xl mx-auto">
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600/10 via-violet-600/5 to-transparent border border-white/[0.06] p-12 lg:p-16">
                            {/* Decorative orb */}
                            <div className="absolute -top-20 -right-20 w-60 h-60 bg-indigo-500/10 rounded-full blur-[80px]" />

                            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
                                <div className="max-w-md">
                                    <h3 className="text-3xl lg:text-4xl font-black tracking-tight mb-4 leading-tight">
                                        Trusted by <span className="text-indigo-400">15,000+</span> students
                                    </h3>
                                    <p className="text-white/35 text-sm font-medium leading-relaxed">
                                        Partnered with campus authorities for verified, secure item recovery. Every handoff is logged and authenticated.
                                    </p>
                                </div>
                                <button
                                    onClick={handleAction}
                                    className="shrink-0 px-10 py-4 bg-white text-black font-bold rounded-2xl hover:bg-indigo-500 hover:text-white transition-all duration-300 active:scale-95 text-sm group"
                                >
                                    {user ? 'Go to Dashboard' : 'Join Now'}
                                    <ArrowRight size={16} className="inline ml-2 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                </ScrollReveal>
            </section>

            {/* ═══════════════ FOOTER ═══════════════ */}
            <footer ref={footerRef} className="relative z-10 py-16 px-6 border-t border-white/[0.04]">
                <ScrollReveal>
                    <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center">
                                <Search size={16} strokeWidth={3} />
                            </div>
                            <span className="text-[15px] font-bold tracking-tight">CampusTrace</span>
                        </div>

                        <a
                            href="mailto:jai.pareek@mca.christuniversity.in"
                            className="group flex items-center gap-3 text-white/30 hover:text-white transition-colors duration-300"
                        >
                            <Mail size={16} className="text-indigo-400" />
                            <span className="text-sm font-semibold">jai.pareek@mca.christuniversity.in</span>
                            <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                    </div>
                </ScrollReveal>
            </footer>

            {/* ── CSS for particles ── */}
            <style>{`
                @keyframes float-up {
                    0% { transform: translateY(0) scale(0); opacity: 0; }
                    10% { opacity: 1; transform: scale(1); }
                    90% { opacity: 0.5; }
                    100% { transform: translateY(-100vh) scale(0.5); opacity: 0; }
                }
            `}</style>
        </div>
    )
}
