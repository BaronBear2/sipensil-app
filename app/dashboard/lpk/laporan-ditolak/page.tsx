import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AlertCircle, FileText, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default async function RejectedReportsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    // Fetch Rejected Reports
    const { data: reports } = await supabase
        .from('lpk_reports')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'REJECTED')
        .order('created_at', { ascending: false })

    return (
        <div className="p-8 animate-fade-in">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100 mb-8">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-2">
                    <AlertCircle className="text-red-500" /> Laporan Ditolak / Revisi
                </h1>
                <p className="text-gray-500">
                    Daftar laporan semester yang ditolak oleh Dinas dan perlu diperbaiki.
                </p>
            </div>

            <div className="space-y-4">
                {reports && reports.length > 0 ? (
                    reports.map((report: any) => (
                        <div key={report.id} className="bg-white p-6 rounded-xl shadow-sm border border-red-200">
                            <div className="flex flex-col md:flex-row justify-between gap-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-md border border-red-200 uppercase tracking-wider">Perlu Revisi</span>
                                        <span className="text-sm font-bold text-gray-700">{report.semester} {report.tahun}</span>
                                    </div>
                                    <h3 className="font-bold text-gray-800 text-lg mb-4">Catatan Penolakan Dinas:</h3>
                                    <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-red-800 text-sm leading-relaxed whitespace-pre-line">
                                        "{report.rejection_reason || 'Mohon periksa kelengkapan data.'}"
                                    </div>
                                    <p className="text-xs text-gray-400 mt-4">Diajukan pada: {new Date(report.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                </div>

                                <div className="flex items-center">
                                    <Link
                                        href={`/dashboard/lpk/laporan?editId=${report.id}`}
                                        className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-all"
                                    >
                                        <FileText size={18} />
                                        Perbaiki Laporan
                                        <ChevronRight size={18} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
                        <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="text-green-600 w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Tidak Ada Laporan Ditolak</h3>
                        <p className="text-gray-500">Semua laporan Anda berstatus aman atau pending.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
