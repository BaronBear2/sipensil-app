import { createClient } from '@/utils/supabase/server'
import { AlertCircle } from 'lucide-react'
import VerificationTable from '@/components/admin/VerificationTable'

export const dynamic = 'force-dynamic'


export default async function VerifikasiPencakerPage({ searchParams }: { searchParams: Promise<{ status: string }> }) {
    const supabase = await createClient()

    const params = await searchParams
    // Status Filter (Default: PENDING)
    const status = (params?.status || 'PENDING').toUpperCase()

    // MAP UI STATUS TO DB STATUS
    // UI: PENDING, VERIFIED, REJECTED
    // DB (training_regs): PENDING, DITERIMA, DITOLAK
    let dbStatus = 'PENDING'
    if (status === 'VERIFIED') dbStatus = 'DITERIMA'
    if (status === 'REJECTED') dbStatus = 'DITOLAK'

    // FLOW: Admin only sees Pencakers who have REGISTERED for training (PENDING)
    // Query: training_registrations where status='PENDING' JOIN profiles
    const { data } = await supabase
        .from('training_registrations')
        .select(`
      *,
      profiles!inner(*, profile_pencaker(*)),
      blk_trainings(title)
    `)
        .eq('status', dbStatus)
        .order('created_at', { ascending: false })

    let users: any[] = []
    if (data) {
        // Map to Flat User Structure for VerificationTable
        users = data.map((reg: any) => {
            const profile = reg.profiles
            const details = profile.profile_pencaker || {}
            return {
                ...profile,
                ...details, // Merge details (nik, phone, etc) to top level
                id: profile.id, // Ensure ID is from profile
                created_at: reg.created_at,
                training_reg_id: reg.id,
                training_title: reg.blk_trainings?.title || 'Generik'
            }
        })
    }

    // Dynamic Titles
    let title = "Validasi Data Pencaker"
    let desc = "Daftar pencaker yang baru mendaftar pelatihan BLK dan menunggu verifikasi profil dan berkas."

    if (status === 'VERIFIED') {
        title = "Pencaker Diterima"
        desc = "Daftar pencaker yang telah diverifikasi dan diterima dalam pelatihan."
    } else if (status === 'REJECTED') {
        title = "Pencaker Ditolak"
        desc = "Daftar pencaker yang ditolak verifikasinya."
    }

    return (
        <div className="space-y-6">
            <div className={`p-6 rounded-xl shadow-sm border flex items-center gap-4 ${status === 'VERIFIED' ? 'bg-green-50 border-green-100' : status === 'REJECTED' ? 'bg-red-50 border-red-100' : 'bg-white border-orange-100'}`}>
                <div className={`p-3 rounded-full ${status === 'VERIFIED' ? 'bg-green-100 text-green-600' : status === 'REJECTED' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                    <AlertCircle size={24} />
                </div>
                <div>
                    <h1 className={`text-2xl font-bold ${status === 'VERIFIED' ? 'text-green-800' : status === 'REJECTED' ? 'text-red-800' : 'text-gray-800'}`}>
                        {title}
                    </h1>
                    <p className="text-gray-500 text-sm">
                        {desc}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
                {users.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <AlertCircle className="mx-auto mb-3 opacity-20" size={48} />
                        <p>Tidak ada data {status.toLowerCase()}.</p>
                    </div>
                ) : (
                    <VerificationTable key={status} users={users} viewOnly={status !== 'PENDING'} />
                )}
            </div>
        </div>
    )
}
