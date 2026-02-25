import { Shield, Sparkles, Layout } from 'lucide-react'

export default function AdminDashboard() {
    return (
        <div className="h-[calc(100vh-12rem)] flex items-center justify-center p-6">
            <div className="bg-white rounded-[3rem] p-12 shadow-xl border border-gray-100 max-w-lg w-full text-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>

                <div className="relative mb-8 flex justify-center">
                    <div className="w-24 h-24 rounded-3xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-200">
                        <Shield size={48} className="text-white" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-secondary-500 flex items-center justify-center text-white border-4 border-white shadow-md">
                        <Sparkles size={18} />
                    </div>
                </div>

                <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-4">
                    <span className="gradient-text">Admin Terminal</span>
                </h1>

                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-widest mb-6">
                    <Layout size={14} /> System v2.4.0
                </div>

                <p className="text-gray-500 font-medium leading-relaxed mb-8">
                    The control center for global system audits, user policies, and configuration is currently being optimized for the next deployment.
                </p>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-[1.5rem] bg-gray-50 border border-gray-100">
                        <p className="text-sm font-black text-gray-900">99.9%</p>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Uptime</p>
                    </div>
                    <div className="p-4 rounded-[1.5rem] bg-gray-50 border border-gray-100">
                        <p className="text-sm font-black text-gray-900">Audit</p>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Status</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
