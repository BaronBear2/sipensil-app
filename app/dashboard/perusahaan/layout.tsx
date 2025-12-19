import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import PerusahaanSidebar from '@/components/perusahaan/Sidebar'

export default async function PerusahaanLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    // 2. Role Check
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    // Admin Perusahaan = ADMIN_PERUSAHAAN. Normal Perusahaan = PERUSAHAAN (if any). Assuming 'PERUSAHAAN' based on Register logic.
    // Register role was 'perusahaan'. 
    // Let's check logic: Register -> 'perusahaan'. 
    // Code should separate 'ADMIN_PERUSAHAAN' (maybe super admin of company?) or just 'perusahaan'.
    // Let's allow 'ADMIN_PERUSAHAAN' OR 'PERUSAHAAN' OR 'perusahaan'.

    const role = profile?.role?.toUpperCase()
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
