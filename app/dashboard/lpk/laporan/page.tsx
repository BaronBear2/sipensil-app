import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import LpkReportForm from '@/components/lpk/LpkReportForm'
import { Lock, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default async function LpkLaporanPage({ searchParams }: { searchParams: Promise<{ type?: string, editId?: string }> }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    const { data: rawProfile } = await supabase.from('profiles').select('*, profile_lpk(*)').eq('id', user.id).single()
    // No need access check, handled by layout/sidebar logic mostly, but good safety measure
    if (rawProfile?.role !== 'ADMIN_LPK') return <div>Akses Ditolak</div>

    // FLATTEN for Component
    const profile = {
        ...rawProfile,
        ...(rawProfile.profile_lpk || {}),
        company_name: rawProfile.profile_lpk?.lpk_name || rawProfile.company_name,
        vin: rawProfile.profile_lpk?.nips || rawProfile.vin
    }

    const params = await searchParams
    const isUnlocked = profile.account_status !== 'unverified'

    let initialData = null
    if (params.editId) {
        const { data: report } = await supabase.from('lpk_reports').select('*').eq('id', params.editId).single()
        initialData = report
    }

    // --- Title based on type ---
    const typeKey = 'Laporan Semester'

    return (
        <div className="p-8 animate-fade-in">
            <div className="bg-white rounded-xl shadow-sm border p-8 mb-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Formulir {typeKey}</h1>
                <p className="text-gray-500">
                    Silakan isi data laporan semester di bawah ini. Pastikan data yang diinput valid.
                    <br /><span className="text-xs text-blue-600 font-bold">*Formulir ini mencakup seluruh aspek laporan semester (Ketersediaan & Penempatan)</span>
                </p>
            </div>

            <div className="bg-white p-8 rounded-xl border shadow-sm relative overflow-hidden min-h-[500px]">

                {/* OVERLAY PENGUNCI (Jika Belum Lengkap) */}
                {!isUnlocked && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm rounded-xl">
                        <div className="bg-white p-8 rounded-2xl shadow-2xl border text-center max-w-md animate-bounce-small">
                            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Lock className="text-blue-600 w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Formulir Terkunci</h3>
                            <p className="text-gray-600 mb-6 text-sm">
                                Untuk mengisi laporan, Anda wajib melengkapi <strong>Profil Lembaga</strong> terlebih dahulu agar data Anda valid di sistem Dinas.
                            </p>
                            <Link href="/dashboard/lpk/profile" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg hover:shadow-blue-500/30">
                                Lengkapi Profil Sekarang <ChevronRight size={18} />
                            </Link>
                        </div>
                    </div>
                )}

                {/* FORM ASLI (Blur Effect di Background) */}
                <div className={!isUnlocked ? 'filter blur-[2px] opacity-40 pointer-events-none select-none grayscale' : ''}>
                    <LpkReportForm profile={profile} initialData={initialData} userId={user.id} />
                </div>

            </div>
        </div>
    )
}
