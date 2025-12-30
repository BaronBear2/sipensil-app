import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ShieldCheck, FileText, History, AlertTriangle, ArrowRight, Building, PlusCircle, CheckCircle, Clock, XCircle } from 'lucide-react'
import Link from 'next/link'

// Ensure dynamic rendering
export const dynamic = 'force-dynamic'

export default async function DashboardLPK() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    const { data: profile } = await supabase.from('profiles').select('*, profile_lpk(*)').eq('id', user.id).single()
    const lpkData = profile?.profile_lpk || {} // Detailed LPK data

    // --- REDIRECT LOGIC FOR FIRST TIME LOGIN ---
    if (profile?.account_status === 'unverified') {
        redirect('/dashboard/lpk/profile?alert=first_login')
    }

    // Fetch Summary Stats
    const { count: reportsCount } = await supabase.from('lpk_reports').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
    const { count: pendingCount } = await supabase.from('lpk_reports').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'PENDING')
    const { count: acceptedCount } = await supabase.from('lpk_reports').select('*', { count: 'exact', head: true }).eq('user_id', user.id).in('status', ['ACCEPTED', 'VERIFIED'])
    const { count: rejectedCount } = await supabase.from('lpk_reports').select('*', { count: 'exact', head: true }).eq('user_id', user.id).in('status', ['REJECTED'])

    const lpkName = lpkData?.lpk_name || profile.company_name || profile.full_name
    const isProfileIncomplete = !lpkData?.license_number || !lpkData?.address_office

    return (
        <div className="font-sans flex flex-col w-full min-h-screen">
            <div className="w-full flex-1">

                {/* HERO SECTION */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white pt-12 pb-24 px-6 md:px-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                        <Building size={300} />
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-center md:text-left">
                            <h1 className="text-2xl md:text-4xl font-extrabold mb-2 tracking-tight">
                                Halo, {lpkName} 👋
                            </h1>
                            <p className="text-emerald-100 font-medium text-lg max-w-xl">
                                Selamat datang di Dashboard LPK SIPENSIL. Kelola laporan semester dan profil lembaga Anda dengan mudah.
                            </p>
                        </div>
                        {/* Status Badge */}
                        <div className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm shadow-lg border backdrop-blur-sm ${profile.account_status === 'verified' ? 'bg-green-500/20 border-green-400 text-green-100' :
                            profile.account_status === 'pending' ? 'bg-yellow-500/20 border-yellow-400 text-yellow-100' :
                                'bg-white/10 border-white/30 text-white'
                            }`}>
                            {profile.account_status === 'verified' ? <CheckCircle size={18} /> :
                                profile.account_status === 'pending' ? <Clock size={18} /> :
                                    profile.account_status === 'rejected' ? <XCircle size={18} /> : <ShieldCheck size={18} />}

                            <span className="uppercase tracking-wider">
                                {profile.account_status === 'verified' ? 'Terverifikasi' :
                                    profile.account_status === 'pending' ? 'Menunggu Verifikasi' :
                                        profile.account_status === 'rejected' ? 'Ditolak' : 'Belum Diverifikasi'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT CARD GRID - Shifted up */}
                <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20 pb-12">

                    {/* ALERT PROFILE INCOMPLETE */}
                    {isProfileIncomplete && (
                        <div className="mb-8 p-6 bg-white border border-red-100 rounded-2xl shadow-lg flex flex-col md:flex-row items-start md:items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="p-3 bg-red-100 text-red-600 rounded-full shrink-0">
                                <AlertTriangle size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-red-700 text-lg">Data Lembaga Belum Lengkap</h3>
                                <p className="text-slate-600 mt-1 leading-relaxed">
                                    Mohon lengkapi data legalitas, alamat kantor, dan pimpinan LPK untuk memudahkan verifikasi laporan.
                                </p>
                            </div>
                            <Link href="/dashboard/lpk/profile" className="whitespace-nowrap flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-red-700 transition shadow-md hover:shadow-lg">
                                Lengkapi Sekarang <ArrowRight size={16} />
                            </Link>
                        </div>
                    )}

                    {/* STATS OVERVIEW */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <StatCard label="Total Laporan" value={reportsCount} icon={FileText} color="emerald" />
                        <StatCard label="Menunggu Review" value={pendingCount} icon={Clock} color="yellow" />
                        <StatCard label="Laporan Diterima" value={acceptedCount} icon={CheckCircle} color="green" />
                        <StatCard label="Perlu Revisi" value={rejectedCount} icon={AlertTriangle} color="red" />
                    </div>

                    {/* ACTION CARDS GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                        {/* CARD 1: BUAT LAPORAN */}
                        <Link href="/dashboard/lpk/laporan/create" className="group rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 p-8 flex flex-col items-center text-center hover:-translate-y-2 transition-all duration-300 relative overflow-hidden h-full">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>

                            <div className="w-20 h-20 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 shadow-sm">
                                <PlusCircle size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-emerald-600 transition-colors">Buat Laporan Baru</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                Input laporan semester (Ketersediaan & Penempatan) untuk diserahkan ke Dinas.
                            </p>
                        </Link>

                        {/* CARD 2: RIWAYAT LAPORAN */}
                        <Link href="/dashboard/lpk/laporan/riwayat" className="group rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 p-8 flex flex-col items-center text-center hover:-translate-y-2 transition-all duration-300 relative overflow-hidden h-full">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-500"></div>

                            <div className="w-20 h-20 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-sm">
                                <History size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-purple-600 transition-colors">Riwayat Laporan</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                Pantau status verifikasi, lihat catatan revisi, dan arsip laporan sebelumnya.
                            </p>
                        </Link>

                        {/* CARD 3: PROFIL LPK */}
                        <Link href="/dashboard/lpk/profile" className="group rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 p-8 flex flex-col items-center text-center hover:-translate-y-2 transition-all duration-300 relative overflow-hidden h-full">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>

                            <div className="w-20 h-20 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-sm">
                                <Building size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-emerald-600 transition-colors">Profil Lembaga</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                Kelola data identitas LPK, izin operasional, instruktur, dan sarana prasarana.
                            </p>
                        </Link>

                    </div>
                </div>
            </div>

            {/* DASHBOARD FOOTER */}
            <footer className="bg-white border-t border-slate-100 py-8 mt-auto">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                        &copy; {new Date().getFullYear()} Dinas Ketenagakerjaan Kabupaten Bekasi
                    </p>
                </div>
            </footer>
        </div>
    )
}

function StatCard({ label, value, icon: Icon, color }: any) {
    const colors: any = {
        emerald: 'bg-emerald-100 text-emerald-600',
        green: 'bg-green-100 text-green-600',
        yellow: 'bg-yellow-100 text-yellow-600',
        red: 'bg-red-100 text-red-600',
    }

    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-all">
            <div className={`p-3 rounded-xl ${colors[color] || colors.blue}`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">{label}</p>
                <h4 className="text-2xl font-extrabold text-slate-800">{value || 0}</h4>
            </div>
        </div>
    )
}