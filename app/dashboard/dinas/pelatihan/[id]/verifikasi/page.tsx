import { createClient } from '@/utils/supabase/server'
import { AlertCircle, User, CheckCircle, XCircle } from 'lucide-react'
import VerificationTable from '@/components/admin/VerificationTable'
import SearchInput from '@/components/admin/SearchInput'

export const dynamic = 'force-dynamic'

export default async function VerifikasiPencakerPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ status: string, q: string }> }) {
    const supabase = await createClient()

    const { id } = await params
    const sParams = await searchParams
    // Status Filter (Default: PENDING)
    const status = (sParams?.status || 'PENDING').toUpperCase()
    const query = sParams?.q || ''

    // MAP UI STATUS TO DB STATUS
    // UI: PENDING, VERIFIED, REJECTED
    // DB (training_regs): PENDING, DITERIMA, DITOLAK, SELESAI
    let dbStatuses = ['PENDING']
    if (status === 'VERIFIED') dbStatuses = ['DITERIMA', 'SELESAI']
    if (status === 'REJECTED') dbStatuses = ['DITOLAK']

    // FLOW: Admin only sees Pencakers who have REGISTERED for training (PENDING)
    // Query: training_registrations where status='PENDING' JOIN profiles
    const { data } = await supabase
        .from('training_registrations')
        .select(`
      *,
      profiles!inner(*, profile_pencaker(*)),
      blk_trainings(title, registration_end, training_start_date, training_end_date)
    `)
        .eq('training_id', id)
        .in('status', dbStatuses)
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
                training_id: reg.training_id,
                training_title: reg.blk_trainings?.title || 'Generik',
                registration_end: reg.blk_trainings?.registration_end,
                training_start_date: reg.blk_trainings?.training_start_date,
                training_end_date: reg.blk_trainings?.training_end_date,
                status: reg.status
            }
        })

        // Filter by Query
        if (query) {
            const lowerQ = query.toLowerCase()
            users = users.filter(u =>
                u.full_name?.toLowerCase().includes(lowerQ) ||
                u.nik?.includes(lowerQ) ||
                u.training_title?.toLowerCase().includes(lowerQ)
            )
        }
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
        <div className="font-sans">
            {/* HERO SECTION - RED THEME */}
            <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white pt-8 pb-20 px-6 md:px-12 relative overflow-hidden rounded-b-3xl shadow-lg mb-8">
                <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                    <User size={300} />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                                <AlertCircle size={24} className="text-white" />
                            </div>
                            <span className="font-bold tracking-wider text-red-100 uppercase text-sm">Modul Verifikasi</span>
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
                            <h3 className="text-2xl font-bold text-white">{users.length}</h3>
                            <p className="text-xs text-red-100 uppercase font-bold tracking-wider">Total Item</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toolbar / Search Section - Floating Up */}
            <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20 space-y-6">

                {/* Search Card */}
                <div className="bg-white p-2 rounded-2xl shadow-xl border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between mb-8">

                    {/* Status Tabs (Mini - Styled like user management but tailored) */}
                    <div className="flex p-1 bg-gray-50 rounded-xl w-full md:w-auto overflow-x-auto">
                        <a href="?status=PENDING" className={`flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${status === 'PENDING' ? 'bg-white text-red-600 shadow-md ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>
                            <AlertCircle size={18} /> Menunggu
                        </a>
                        <a href="?status=VERIFIED" className={`flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${status === 'VERIFIED' ? 'bg-white text-red-600 shadow-md ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>
                            <CheckCircle size={18} /> Diterima
                        </a>
                        <a href="?status=REJECTED" className={`flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${status === 'REJECTED' ? 'bg-white text-red-600 shadow-md ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>
                            <XCircle size={18} /> Ditolak
                        </a>
                    </div>

                    <div className="w-full md:w-80 mr-2">
                        <SearchInput placeholder="Cari Nama atau NIK..." />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border p-6">
                    {users.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <AlertCircle className="mx-auto mb-3 opacity-20" size={48} />
                            <p>Tidak ada data {status.toLowerCase()} {query && `dengan kata kunci "${query}"`}.</p>
                        </div>
                    ) : (
                        <VerificationTable key={status} users={users} viewOnly={status !== 'PENDING'} />
                    )}
                </div>
            </div>
        </div>
    )
}
