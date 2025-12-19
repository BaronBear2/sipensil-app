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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      // 1. Cek User Login
      const { data: { user } } = await supabase.auth.getUser()

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
          <Link href="/layanan" className="hover:text-blue-700 transition-colors">Layanan Publik</Link>
          {profile?.role === 'PENCAKER' && (
            <>
              <Link href="/dashboard/pencaker" className="hover:text-blue-700 transition-colors">Dashboard</Link>
              <Link href="/dashboard/pencaker/programs" className="hover:text-blue-700 transition-colors">Pelatihan</Link>
            </>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-xs text-gray-400">Loading...</div>
        ) : profile ? (
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-gray-500">Login sebagai:</p>
              <p className="text-sm font-bold text-gray-800 uppercase">{profile.role.replace('_', ' ')}</p>
            </div>

            <div className="flex gap-2">
              <button onClick={handleLogout} className="bg-red-50 hover:bg-red-100 p-2 rounded-lg text-red-600 transition" title="Logout">
                <LogOut size={18} />
              </button>
            </div>
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