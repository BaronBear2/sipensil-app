import { createClient } from '@/utils/supabase/server'
import { Building, FileText } from 'lucide-react'
import LPKReportTable from '@/components/admin/LPKReportTable'
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
                        <LPKReportTable reports={lpkReports} />
                    }
                </div>
            </div>

        </div>
    )
}
