import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import LpkSidebar from '@/components/lpk/Sidebar'
import { headers } from 'next/headers'

export default async function LpkLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    // 2. Role Check
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (profile?.role !== 'ADMIN_LPK') {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="text-center p-8 bg-white rounded-xl shadow-lg border">
                    <h2 className="text-2xl font-bold text-red-600 mb-2">Akses Ditolak</h2>
                    <p className="text-gray-500">Anda tidak memiliki akses ke halaman ini.</p>
                </div>
            </div>
        )
    }

    // 3. First-Time Login / Unverified Redirect Logic
    // Check current path header to avoid infinite loop on profile page
    const headerList = await headers()
    const pathname = headerList.get("x-invoke-path") || headerList.get("referer") || ""

    // Note: "x-invoke-path" might not be reliable in all environments but usually works in Next.js middleware context. 
    // However, headers() in layout doesn't consistently give pathname.
    // Alternative: We interpret "First-time login" as: User lands on /dashboard/lpk.
    // We can let specific pages handle their restrictions, but the layout can't easily do "redirect if not on profile" without reliable pathname.
    // BUT the user explicitly asked for "First time login logic".
    // Let's rely on the pages to handle "Locking" (like we did in Pencaker) OR explicit redirect in `page.tsx` (the dashboard root).

    // However, I can implement a Client Component wrapper if I really want strict global protection.
    // For now, I'll place the Redirect Logic in `page.tsx` (Dashboard Root).

    return (
        <div className="flex min-h-screen bg-gray-50 font-sans">
            <LpkSidebar />
            <main className="flex-1 w-full max-w-[100vw] overflow-hidden">
                {children}
            </main>
        </div>
    )
}
