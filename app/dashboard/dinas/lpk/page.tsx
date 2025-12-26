import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { FileText, Building, CheckCircle, XCircle, Search } from 'lucide-react'
import LPKReportTable from '@/components/admin/LPKReportTable'
import { deleteLpkReportAction } from '@/actions/dinas'

export default async function LpkAdminPage({ searchParams }: { searchParams: Promise<{ status: string }> }) {
    const supabase = await createClient()

    const params = await searchParams
    // Filter Status (Default: PENDING)
    const status = (params?.status || 'PENDING').toUpperCase()

    // DB Mapping
    // UI: PENDING, APPROVED, REJECTED
    // DB: SUBMITTED, APPROVED, REJECTED
    let dbStatus = 'SUBMITTED'
    if (status === 'APPROVED') dbStatus = 'APPROVED'
    if (status === 'REJECTED') dbStatus = 'REJECTED'


    // 2. Laporan LPK Masuk
    let lpkReports: any[] = []
    try {
        const { data } = await supabase
            .from('lpk_reports')
            .select(`
                *,
                profiles!inner(
                   *,
                   profile_lpk(*)
                )
            `)
            .eq('status', dbStatus)
            .order('created_at', { ascending: false })

        if (data) {
            console.log(`FETCHED LPK REPORTS [${dbStatus}]: Found ${data.length} reports.`)
            lpkReports = data.map((rep: any) => {
                const p = rep.profiles
                const lpk = p?.profile_lpk || {}
                if (p) {
                    p.company_name = lpk.lpk_name || p.company_name
                    p.phone = lpk.phone || p.phone
                }
                return rep
            })
        }
    } catch (e) {
        console.error("FETCH ERROR:", e)
    }

    // Dynamic UI
    let title = "Laporan Periodik LPK (Baru)"
    let desc = "Daftar laporan semester yang menunggu verifikasi."

    if (status === 'APPROVED') {
        title = "Laporan Diterima"
        desc = "Arsip laporan LPK yang telah disetujui."
    } else if (status === 'REJECTED') {
        title = "Laporan Ditolak"
        desc = "Laporan yang perlu direvisi oleh LPK."
    }

    return (
        <div className="font-sans min-h-screen bg-gray-50/50 pb-20">
            {/* HERO SECTION - RED THEME */}
            <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white pt-8 pb-20 px-6 md:px-12 relative overflow-hidden rounded-b-3xl shadow-lg mb-8">
                <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                    <Building size={300} />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                                <FileText size={24} className="text-white" />
                            </div>
                            <span className="font-bold tracking-wider text-red-100 uppercase text-sm">Modul LPK</span>
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
                            <h3 className="text-2xl font-bold text-white">{lpkReports.length}</h3>
                            <p className="text-xs text-red-100 uppercase font-bold tracking-wider">Total Laporan</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. CONTENT SECTION - Floating Up */}
            <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20 space-y-6">

                {/* Tab Navigation Card */}
                <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-xl flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
                    <div className="flex p-1 bg-gray-50 rounded-xl w-full md:w-auto overflow-x-auto">
                        <Link href="/dashboard/dinas/lpk?status=pending" className={`flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${status === 'PENDING' ? 'bg-white text-red-600 shadow-md ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>
                            <FileText size={18} /> Menunggu
                        </Link>
                        <Link href="/dashboard/dinas/lpk?status=approved" className={`flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${status === 'APPROVED' ? 'bg-white text-red-600 shadow-md ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>
                            <CheckCircle size={18} /> Diterima
                        </Link>
                        <Link href="/dashboard/dinas/lpk?status=rejected" className={`flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${status === 'REJECTED' ? 'bg-white text-red-600 shadow-md ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>
                            <XCircle size={18} /> Ditolak / Revisi
                        </Link>
                    </div>
                </div>

                {/* Table Card */}
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="">
                        {lpkReports.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="inline-flex p-4 bg-gray-50 rounded-full mb-4">
                                    <FileText size={40} className="text-gray-300" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Tidak ada laporan {status.toLowerCase()}</h3>
                                <p className="text-gray-500 text-sm max-w-sm mx-auto mt-1">
                                    Saat ini belum ada data laporan yang masuk ke dalam kategori ini.
                                </p>
                            </div>
                        ) : (
                            <LPKReportTable reports={lpkReports} viewOnly={status !== 'PENDING'} onDelete={deleteLpkReportAction} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
