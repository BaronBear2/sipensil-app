import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import PerusahaanSidebar from '@/components/perusahaan/PerusahaanSidebar'

export default async function PerusahaanLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    // 2. Role Check
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    const role = profile?.role?.toUpperCase()

    // Allow ADMIN_PERUSAHAAN or PERUSAHAAN
    if (role !== 'PERUSAHAAN' && role !== 'ADMIN_PERUSAHAAN') {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="text-center p-8 bg-white rounded-xl shadow-lg border">
                    <h2 className="text-2xl font-bold text-red-600 mb-2">Akses Ditolak</h2>
                    <p className="text-gray-500">Anda tidak memiliki akses ke halaman ini.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-gray-50 font-sans">
            <PerusahaanSidebar />
            <main className="flex-1 w-full max-w-[100vw] overflow-hidden">
                {children}
            </main>
        </div>
    )
}
