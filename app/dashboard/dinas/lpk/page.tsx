import { createClient } from '@/utils/supabase/server'
import { Building, FileText } from 'lucide-react'
import LPKReportTable from '@/components/admin/LPKReportTable'
import VerificationTable from '@/components/admin/VerificationTable'
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
    if (status === 'APPROVED') dbStatus = 'APPROVED' // Enum might be APPROVED or ACCEPTED, check schema or previous code.
    // Previous code in line 118 actions/dinas.ts used 'APPROVED'.
    if (status === 'REJECTED') dbStatus = 'REJECTED'

    // 1. Verifikasi Akun LPK (Only show on PENDING view)
    let pendingLpkAccounts: any[] = []
    if (status === 'PENDING') {
        try {
            const { data } = await supabase
                .from('profiles')
                .select('*, profile_lpk(*)')
                .eq('role', 'ADMIN_LPK')
                .eq('account_status', 'pending')
                .order('created_at', { ascending: false })

            if (data) {
                pendingLpkAccounts = data.map((p: any) => ({
                    ...p,
                    ...(p.profile_lpk || {}) // Flatten structure
                }))
            }
        } catch (e) {
            console.error(e)
        }
    }

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
        console.error(e)
    }

    // Dynamic UI
    let title = "Laporan Periodik LPK (Baru)"
    let desc = "Daftar laporan semester yang menunggu verifikasi."
    let color = "text-gray-800"

    if (status === 'APPROVED') {
        title = "Laporan Diterima"
        desc = "Arsip laporan LPK yang telah disetujui."
        color = "text-green-800"
    } else if (status === 'REJECTED') {
        title = "Laporan Ditolak"
        desc = "Laporan yang perlu direvisi oleh LPK."
        color = "text-red-800"
    }

    return (
        <div className="space-y-8">

            {/* SECTION 1: VERIFIKASI AKUN LPK (Only PENDING) */}
            {status === 'PENDING' && (
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
                    <div className="border-t border-gray-200"></div>
                </div>
            )}

            {/* SECTION 2: LAPORAN MASUK */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <FileText className={status === 'APPROVED' ? "text-green-600" : status === 'REJECTED' ? "text-red-600" : "text-blue-600"} size={24} />
                    <h2 className={`text-xl font-bold ${color}`}>{title}</h2>
                </div>

                <div className="bg-white rounded-xl shadow-sm border p-6">
                    {lpkReports.length === 0 ? <p className="text-gray-400 text-center py-6">Tidak ada laporan {status.toLowerCase()}.</p> :
                        <LPKReportTable reports={lpkReports} viewOnly={status !== 'PENDING'} onDelete={deleteLpkReportAction} />
                    }
                </div>
            </div>

        </div>
    )
}
