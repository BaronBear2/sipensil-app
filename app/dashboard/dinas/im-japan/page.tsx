import Link from 'next/link'
import { createAdminClient } from '@/utils/supabase/server'
import { FileText, CheckCircle, XCircle } from 'lucide-react'
import ImJapanTable from '@/components/admin/ImJapanTable'

export default async function ImJapanAdminPage({ searchParams }: { searchParams: Promise<{ status: string }> }) {
    const supabase = await createAdminClient()

    const params = await searchParams
    // URL Status: PENDING | APPROVED | REJECTED
    const status = (params?.status || 'PENDING').toUpperCase()

    // DB Mapping: PENDING | VERIFIED | REJECTED
    let dbStatus = 'PENDING' // Default
    if (status === 'APPROVED' || status === 'VERIFIED') dbStatus = 'VERIFIED'
    if (status === 'REJECTED') dbStatus = 'REJECTED'

    // Fetch Data
    let registrations: any[] = []
    const { data } = await supabase
        .from('im_japan_registrations')
        .select(`
            *,
            profiles!inner(*)
        `)
        .eq('status', dbStatus)
        .order('created_at', { ascending: false })

    if (data) {
        registrations = data.map((reg: any) => ({
            ...reg,
            user: reg.profiles
        }))
    }

    // Dynamic UI Titles
    let title = "Verifikasi Permohonan IM Japan"
    let desc = "Daftar permohonan registrasi program IM Japan yang menunggu verifikasi."

    if (status === 'APPROVED' || status === 'VERIFIED') {
        title = "Permohonan Diterima"
        desc = "Daftar peserta yang telah lolos verifikasi administrasi."
    } else if (status === 'REJECTED') {
        title = "Permohonan Ditolak"
        desc = "Daftar peserta yang tidak lolos verifikasi."
    }

    return (
        <div className="font-sans min-h-screen bg-gray-50/50 pb-20">
            {/* HERO SECTION - RED THEME */}
            <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white pt-8 pb-20 px-6 md:px-12 relative overflow-hidden rounded-b-3xl shadow-lg mb-8">
                <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                    <span className="text-[300px]">🇯🇵</span>
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                                <FileText size={24} className="text-white" />
                            </div>
                            <span className="font-bold tracking-wider text-red-100 uppercase text-sm">Modul IM Japan</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight text-white">
                            {title}
                        </h1>
                        <p className="text-red-100 font-medium text-lg max-w-xl">
                            {desc}
                        </p>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex gap-4">
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl text-center">
                            <h3 className="text-2xl font-bold text-white">{registrations.length}</h3>
                            <p className="text-xs text-red-100 uppercase font-bold tracking-wider">Total Data</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section - Floating Up */}
            <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20 space-y-6">

                {/* Tab Navigation Card */}
                <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-xl flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
                    <div className="flex p-1 bg-gray-50 rounded-xl w-full md:w-auto overflow-x-auto">
                        <Link href="/dashboard/dinas/im-japan?status=pending" className={`flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${status === 'PENDING' ? 'bg-white text-red-600 shadow-md ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>
                            <FileText size={18} /> Menunggu
                        </Link>
                        <Link href="/dashboard/dinas/im-japan?status=approved" className={`flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${(status === 'APPROVED' || status === 'VERIFIED') ? 'bg-white text-red-600 shadow-md ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>
                            <CheckCircle size={18} /> Diterima
                        </Link>
                        <Link href="/dashboard/dinas/im-japan?status=rejected" className={`flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${status === 'REJECTED' ? 'bg-white text-red-600 shadow-md ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>
                            <XCircle size={18} /> Ditolak
                        </Link>
                    </div>
                </div>

                {/* List Card */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    {registrations.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="inline-flex p-4 bg-gray-50 rounded-full mb-4">
                                {(status === 'APPROVED' || status === 'VERIFIED') ? <CheckCircle size={40} className="text-green-300" /> :
                                    status === 'REJECTED' ? <XCircle size={40} className="text-red-300" /> :
                                        <FileText size={40} className="text-gray-300" />}
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">
                                {(status === 'APPROVED' || status === 'VERIFIED') ? 'Belum Ada Data Diterima' :
                                    status === 'REJECTED' ? 'Belum Ada Data Ditolak' :
                                        'Tidak Ada Permohonan Baru'}
                            </h3>
                            <p className="text-gray-500 text-sm mt-1">
                                {(status === 'APPROVED' || status === 'VERIFIED') ? 'Belum ada peserta yang lolos verifikasi.' :
                                    status === 'REJECTED' ? 'Belum ada peserta yang ditolak.' :
                                        'Belum ada permohonan masuk saat ini.'}
                            </p>
                        </div>
                    ) : (
                        <ImJapanTable data={registrations} viewOnly={status !== 'PENDING'} />
                    )}
                </div>
            </div>
        </div>
    )
}
