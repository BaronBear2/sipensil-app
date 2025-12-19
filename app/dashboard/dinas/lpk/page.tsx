import { createClient } from '@/utils/supabase/server'
import { Building, FileText, Download } from 'lucide-react'
import { verifyLpkReportAction, verifyProfileAction } from '@/actions/dinas'
import { AdminActionButtons } from '@/components/admin/AdminButtons'
import Link from 'next/link'
import VerificationTable from '@/components/admin/VerificationTable'

export default async function LpkAdminPage() {
    const supabase = await createClient()

    // 1. Verifikasi Akun LPK
    let pendingLpkAccounts: any[] = []
    try {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'ADMIN_LPK')
            .eq('account_status', 'pending')
            .order('created_at', { ascending: false })
        if (data) pendingLpkAccounts = data
    } catch (e) {
        console.error(e)
    }

    // 2. Laporan LPK Masuk
    let lpkReports: any[] = []
    try {
        const { data } = await supabase
            .from('lpk_reports')
            .select(`*, profiles!inner(company_name, phone)`) // Assuming user_id join to profiles
            .eq('status', 'SUBMITTED')
            .order('created_at', { ascending: false })
        if (data) lpkReports = data
    } catch (e) {
        console.error(e)
    }

    return (
        <div className="space-y-8">

            {/* SECTION 1: VERIFIKASI AKUN LPK */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <Building className="text-blue-600" size={24} />
                    <h2 className="text-xl font-bold text-gray-800">Verifikasi Registrasi LPK</h2>
                </div>

                <div className="bg-white rounded-xl shadow-sm border p-6">
                    {pendingLpkAccounts.length === 0 ? <p className="text-gray-400 text-center py-6">Tidak ada LPK menunggu verifikasi akun.</p> :
                        <VerificationTable users={pendingLpkAccounts} />
                    }
                </div>
            </div>

            <div className="border-t border-gray-200"></div>

            {/* SECTION 2: LAPORAN MASUK */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <FileText className="text-green-600" size={24} />
                    <h2 className="text-xl font-bold text-gray-800">Laporan Periodik LPK Masuk</h2>
                </div>

                <div className="bg-white rounded-xl shadow-sm border p-6">
                    {lpkReports.length === 0 ? <p className="text-gray-400 text-center py-6">Tidak ada laporan periodik baru.</p> :
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border rounded-lg">
                                <thead className="bg-gray-100 text-xs font-bold uppercase text-gray-700">
                                    <tr>
                                        <th className="px-4 py-3">LPK</th>
                                        <th className="px-4 py-3">Periode</th>
                                        <th className="px-4 py-3">Kontak</th>
                                        <th className="px-4 py-3 text-center">File</th>
                                        <th className="px-4 py-3 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lpkReports.map((item: any) => (
                                        <tr key={item.id} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <div className="font-bold">{item.nama_lpk}</div>
                                                <div className="text-xs text-gray-500">Reg: {item.no_reg}</div>
                                            </td>
                                            <td className="px-4 py-3">{item.semester} {item.tahun}</td>
                                            <td className="px-4 py-3 text-xs">{item.profiles?.phone}</td>
                                            <td className="px-4 py-3 text-center">
                                                <Link href={`/api/generate-word/lpk-report?id=${item.id}`} target="_blank" className="text-green-600 text-xs font-bold border border-green-200 px-2 py-1 rounded hover:bg-green-50 flex items-center justify-center gap-1">
                                                    <Download size={12} /> Word
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <AdminActionButtons
                                                    id={item.id}
                                                    extraId={item.user_id}
                                                    actionFn={verifyLpkReportAction}
                                                    idName="reportId"
                                                    extraIdName="userId"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    }
                </div>
            </div>

        </div>
    )
}
