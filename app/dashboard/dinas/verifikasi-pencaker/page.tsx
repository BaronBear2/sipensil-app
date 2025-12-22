import { createClient } from '@/utils/supabase/server'
import { AlertCircle } from 'lucide-react'
import VerificationTable from '@/components/admin/VerificationTable'

export default async function VerifikasiPencakerPage() {
    const supabase = await createClient()

    // FLOW: Admin only sees Pencakers who have REGISTERED for training (PENDING)
    // Query: training_registrations where status='PENDING' JOIN profiles
    const { data } = await supabase
        .from('training_registrations')
        .select(`
      *,
      profiles!inner(*, profile_pencaker(*)),
      blk_trainings(title)
    `)
        .eq('status', 'PENDING')
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

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-2">
                    <AlertCircle className="text-orange-500" /> Validasi Data Pencaker
                </h1>
                <p className="text-gray-500">
                    Daftar pencaker yang baru mendaftar pelatihan BLK dan menunggu verifikasi profil dan berkas.
                </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
                {users.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <AlertCircle className="mx-auto mb-3 opacity-20" size={48} />
                        <p>Tidak ada antrian verifikasi profil saat ini.</p>
                    </div>
                ) : (
                    <VerificationTable users={users} />
                )}
            </div>
        </div>
    )
}
