'use client'
import Link from 'next/link'
import { Building, User, LayoutDashboard, LogOut } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const router = useRouter()
  const supabase = createClient()
  const [profile, setProfile] = useState<any>(null)
  const [sessionUser, setSessionUser] = useState<any>(null) // Fallback if profile fails
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      // 1. Cek User Login (Optimized: getSession first)
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user
      setSessionUser(user)

      if (user) {
        // 2. AMBIL ROLE LANGSUNG DARI DB (PENTING!)
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (data) {
          console.log("Current User Role:", data.role) // Cek ini di Console Browser (F12)
          setProfile(data)
        }
      }
      setLoading(false)
    }
    fetchProfile()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  // LOGIC ROUTING YANG AMAN (CASE INSENSITIVE)
  const getDashboardLink = (role: string) => {
    if (!role) return '/'
    const r = role.toUpperCase() // Paksa huruf besar biar aman

    if (r === 'ADMIN_DINAS') return '/dashboard/dinas'
    if (r === 'ADMIN_LPK') return '/dashboard/lpk'
    if (r === 'ADMIN_PERUSAHAAN') return '/dashboard/perusahaan'
    return '/dashboard/pencaker' // Default ke pencaker
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-[100] border-b border-gray-100 font-sans">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3 cursor-pointer group">
          <div className="bg-blue-900 p-2 rounded-lg shadow-sm group-hover:bg-blue-800 transition-colors">
            <Building className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-xl text-blue-900 leading-none tracking-tight">SIPENSIL</h1>
            <p className="text-[0.65rem] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Disnaker Kab. Bekasi</p>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600">
          <Link href="/" className="hover:text-blue-700 transition-colors">Beranda</Link>
          {/* <Link href="/layanan" className="hover:text-blue-700 transition-colors">Layanan Publik</Link> */}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-xs text-gray-400">Loading...</div>
        ) : profile || sessionUser ? ( // Show if profile exists OR just session user exists (fallback)
          <div className="flex items-center gap-4">

            {/* Dynamic Dashboard Button */}
            <Link
              href={getDashboardLink(profile?.role)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-all flex items-center gap-2"
            >
              <LayoutDashboard size={16} />
              <span>Kembali ke Dashboard {profile?.role?.replace('ADMIN_', '') || ''}</span>
            </Link>

            {/* Logout Icon Button (Small) */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition-colors border border-red-100"
              title="Keluar Aplikasi"
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <Link href="/auth/login" className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-md transition-all flex items-center gap-2">
            <User size={16} /> Masuk / Daftar
          </Link>
        )}
      </div>
    </nav>
  )
}