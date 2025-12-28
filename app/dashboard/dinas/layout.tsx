import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/dinas/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    // 2. Role Check
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

    if (profile?.role !== 'ADMIN_DINAS') {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="text-center p-8 bg-white rounded-xl shadow-lg border">
                    <h2 className="text-2xl font-bold text-red-600 mb-2">Akses Ditolak</h2>
                    <p className="text-gray-500">Anda tidak memiliki akses ke halaman ini (Hanya Admin Dinas).</p>
                    <p className="text-xs text-gray-400 mt-2">Current Role: {profile?.role}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-gray-50 font-sans">
            <AdminSidebar />
            <main className="flex-1 w-full max-w-[100vw] overflow-hidden pt-16 md:pt-0">
                {children}
            </main>
        </div>
    )
}
