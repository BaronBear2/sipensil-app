import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, ClipboardList, FileText, Users, Building, ChevronRight } from 'lucide-react'

export default async function DashboardAdmin() {
  const supabase = await createClient()

  // 1. Cek Login & Role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  // 2. Fetch Summary Stats (Parallel Fetching)
  const statsQuery = [
    // 1. Verifikasi Profil (Pencaker yg daftar training & pending)
    supabase.from('training_registrations').select('*', { count: 'exact', head: true }).eq('status', 'PENDING'),

    // 2. IM Japan Pending
    supabase.from('im_japan_registrations').select('*', { count: 'exact', head: true }).eq('status', 'PENDING'),

    // 3. Laporan LPK Pending
    supabase.from('lpk_reports').select('*', { count: 'exact', head: true }).eq('status', 'SUBMITTED'),

    // 4. Magang Pending
    supabase.from('magang_permits').select('*', { count: 'exact', head: true }).eq('status', 'PENDING'),

    // 5. Total User Pencaker
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'PENCAKER'),

    // 6. Verifikasi Akun LPK
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'ADMIN_LPK').eq('account_status', 'pending')
  ] as const

  const [
    { count: countProfil },
    { count: countImJapan },
    { count: countLpk },
    { count: countMagang },
    { count: countPencaker },
    { count: countLpkAccount }
  ] = await Promise.all(statsQuery)

  const cards = [
    {
      title: 'Verifikasi Pencaker',
      count: countProfil || 0,
      label: 'Antrian Validasi',
      icon: AlertCircle,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
      href: '/dashboard/dinas/verifikasi-pencaker'
    },
    {
      title: 'Verifikasi LPK',
      count: countLpkAccount || 0,
      label: 'Registrasi Baru',
      icon: Building,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      href: '/dashboard/dinas/lpk'
    },
    {
      title: 'Program IM Japan',
      count: countImJapan || 0,
      label: 'Pendaftar Baru',
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
      href: '/dashboard/dinas/im-japan'
    },
    {
      title: 'Laporan LPK',
      count: countLpk || 0,
      label: 'Laporan Masuk',
      icon: FileText,
      color: 'text-green-600',
      bg: 'bg-green-100',
      href: '/dashboard/dinas/lpk'
    },
    {
      title: 'Perjanjian Magang',
      count: countMagang || 0,
      label: 'Permohonan',
      icon: ClipboardList,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
      href: '/dashboard/dinas/pemagangan'
    },
    {
      title: 'Total Pencaker',
      count: countPencaker || 0,
      label: 'Terdaftar',
      icon: Users,
      color: 'text-gray-600',
      bg: 'bg-gray-100',
      href: '/dashboard/dinas/users'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* Header */}
      <div className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
        <p className="text-gray-500">Selamat datang kembali, <span className="font-bold text-blue-600">{profile?.full_name}</span>.</p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, idx) => (
          <Link key={idx} href={card.href} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group relative overflow-hidden">
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className={`p-3 rounded-xl ${card.bg} ${card.color}`}>
                <card.icon size={24} />
              </div>
              <ChevronRight className="text-gray-300 group-hover:text-blue-500 transition-colors" />
            </div>
            <div className="relative z-10">
              <h3 className="text-gray-500 text-sm font-bold mb-1">{card.title}</h3>
              <p className="text-3xl font-bold text-gray-800">{card.count}</p>
              <p className="text-xs text-gray-400 mt-1 font-medium bg-gray-50 inline-block px-2 py-1 rounded">{card.label}</p>
            </div>
          </Link>
        ))}
      </div>

    </div>
  )
}
