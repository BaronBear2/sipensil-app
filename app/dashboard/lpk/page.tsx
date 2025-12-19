import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { ShieldCheck, FileText, History, Edit, AlertCircle, Briefcase, Users, FileBarChart, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardLPK() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

    // --- REDIRECT LOGIC FOR FIRST TIME LOGIN (Item 15) ---
    if (profile?.account_status === 'unverified') {
        // Check if we need to force redirect. Since this IS the dashboard root, yes.
        redirect('/dashboard/lpk/profile?alert=first_login')
    }

    // Fetch Summary Stats
    const { count: reportsCount } = await supabase.from('lpk_reports').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
    const { count: pendingCount } = await supabase.from('lpk_reports').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'PENDING')

    // Custom Status Styling
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'verified': return 'bg-green-100 text-green-700 border-green-200'
            case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
            case 'rejected': return 'bg-red-100 text-red-700 border-red-200'
            default: return 'bg-gray-100 text-gray-600 border-gray-200'
        }
    }

    return (
        <div className="min-h-screen bg-white md:bg-gray-50 font-sans p-4 md:p-8 animate-fade-in">
            {/* Mobile Navbar Spacer if needed, but Layout handles it. Navbar is removed from here as it's likely handled by Sidebar or Layout for desktop. 
            Wait, Pencaker used Navbar component. LPK now uses Sidebar. 
            Mobile view might need a wrapper. Let's keep it simple. 
        */}

            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white md:bg-transparent p-6 md:p-0 rounded-2xl md:rounded-none shadow-sm md:shadow-none border md:border-none">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">
                        Dashboard LPK
                    </h1>
                    <p className="text-gray-500">Selamat datang, <span className="font-bold text-gray-700">{profile.company_name}</span></p>
                </div>

                <div className={`px-4 py-2 rounded-xl text-sm font-bold border flex items-center gap-2 w-fit ${getStatusColor(profile.account_status)}`}>
                    <ShieldCheck size={18} />
                    {profile.account_status === 'verified' ? 'TERVERIFIKASI' :
                        profile.account_status === 'pending' ? 'MENUNGGU VERIFIKASI' : profile.account_status.toUpperCase()}
                </div>
            </header>

            {/* STATS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="bg-blue-100 p-4 rounded-full text-blue-600">
                        <FileText size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-bold">Total Laporan</p>
                        <h3 className="text-2xl font-extrabold text-gray-800">{reportsCount || 0}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="bg-yellow-100 p-4 rounded-full text-yellow-600">
                        <History size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-bold">Menunggu Review</p>
                        <h3 className="text-2xl font-extrabold text-gray-800">{pendingCount || 0}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="bg-green-100 p-4 rounded-full text-green-600">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-bold">Status Akun</p>
                        <h3 className="text-lg font-bold text-gray-800 uppercase">{profile.account_status}</h3>
                    </div>
                </div>
            </div>

            {/* QUICK ACTIONS */}
            <h3 className="font-bold text-gray-800 text-lg mb-4">Akses Cepat</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                <Link href="/dashboard/lpk/laporan?type=ketersediaan" className="group bg-white p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all flex flex-col items-start gap-4">
                    <div className="bg-blue-50 p-3 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <FileBarChart size={28} />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">Laporan Ketersediaan</h4>
                        <p className="text-sm text-gray-500 mt-1">Input data pelatihan, instruktur, dan sarana prasarana.</p>
                    </div>
                </Link>

                <Link href="/dashboard/lpk/laporan?type=penempatan" className="group bg-white p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all flex flex-col items-start gap-4">
                    <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <Briefcase size={28} />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-800 group-hover:text-emerald-600 transition-colors">Laporan Penempatan</h4>
                        <p className="text-sm text-gray-500 mt-1">Input data lulusan dan penempatan kerja alumni.</p>
                    </div>
                </Link>

                <Link href="/dashboard/lpk/riwayat" className="group bg-white p-6 rounded-2xl border border-gray-100 hover:border-purple-200 hover:shadow-lg transition-all flex flex-col items-start gap-4">
                    <div className="bg-purple-50 p-3 rounded-xl text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                        <History size={28} />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-800 group-hover:text-purple-600 transition-colors">Riwayat Laporan</h4>
                        <p className="text-sm text-gray-500 mt-1">Lihat status dan riwayat pelaporan sebelumnya.</p>
                    </div>
                </Link>
            </div>

        </div>
    )
}