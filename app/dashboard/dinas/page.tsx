import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, ClipboardList, FileText, Users, Building, ChevronRight, ShieldCheck, PieChart, Activity } from 'lucide-react'
import QATimeController from '@/components/QATimeController'

// Ensure dynamic rendering
export const dynamic = 'force-dynamic'

export default async function DashboardAdmin() {
  const supabase = await createClient()

  // 1. Cek Login & Role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  const statsQuery = [
    // 1. Verifikasi Profil (Pencaker yg daftar training & pending)
    supabase.from('training_registrations').select('training_id', { count: 'exact' }).eq('status', 'PENDING'),

    // 2. Total User Pencaker
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'PENCAKER'),

    // 3. Pelatihan Terbuka
    supabase.from('blk_trainings').select('*', { count: 'exact', head: true }).eq('status', 'OPEN'),
  ] as const

  const [
    { data: pendingRegistrations, count: countProfil },
    { count: countPencaker },
    { count: countOpenTrainings }
  ] = await Promise.all(statsQuery)

  // Find the training with the most pending registrations
  let targetTrainingId = null
  if (pendingRegistrations && pendingRegistrations.length > 0) {
    const trainingCounts = pendingRegistrations.reduce((acc: Record<string, number>, curr) => {
      acc[curr.training_id] = (acc[curr.training_id] || 0) + 1
      return acc
    }, {})
    
    // Get the key (training_id) with the highest count
    targetTrainingId = Object.keys(trainingCounts).reduce((a, b) => trainingCounts[a] > trainingCounts[b] ? a : b)
  }

  const verifikasiHref = targetTrainingId ? `/dashboard/dinas/pelatihan/${targetTrainingId}` : '/dashboard/dinas/pelatihan'

  const cards = [
    {
      title: 'Verifikasi Pencaker',
      count: countProfil || 0,
      label: 'Antrian Validasi',
      icon: AlertCircle,
      color: 'red',
      href: verifikasiHref
    },
    {
      title: 'Total Pencaker',
      count: countPencaker || 0,
      label: 'Terdaftar',
      icon: Users,
      color: 'emerald',
      href: '/dashboard/dinas/users'
    },
    {
      title: 'Pelatihan Terbuka',
      count: countOpenTrainings || 0,
      label: 'Aktif',
      icon: Activity,
      color: 'blue',
      href: '/dashboard/dinas/pelatihan'
    }
  ]

  return (
    <div className="font-sans flex flex-col w-full min-h-screen">
      <div className="w-full flex-1">

        {/* HERO SECTION */}
        <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white pt-12 pb-24 px-6 md:px-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-1/4 -translate-y-1/4">
            <ShieldCheck size={300} />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h1 className="text-2xl md:text-4xl font-extrabold mb-2 tracking-tight">
                Halo, Admin Dinas 👋
              </h1>
              <p className="text-red-100 font-medium text-lg max-w-xl">
                Selamat datang di Dashboard Admin SIPENSIL. Pantau dan kelola seluruh aktivitas ketenagakerjaan dari satu tempat.
              </p>
            </div>
            {/* Status Badge */}
            <div className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm shadow-lg border backdrop-blur-sm bg-white/10 border-white/30 text-white">
              <ShieldCheck size={18} />
              <span className="uppercase tracking-wider">ADMIN</span>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT CARD GRID - Shifted up */}
        <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20 pb-12">

          {/* QA TIME TRAVEL CONTROLLER */}
          <div className="mb-8">
            <QATimeController />
          </div>

          {/* ALERT OVERVIEW */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8 bg-white p-6 rounded-2xl shadow-lg border border-red-50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                <AlertCircle size={24} />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-lg">{(countProfil || 0)}</h4>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Pending</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                <Activity size={24} />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-lg">{(countPencaker || 0)}</h4>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider"> Pencaker Aktif</p>
              </div>
            </div>
          </div>

          {/* ACTION CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 max-w-6xl">
            {cards.map((card, idx) => (
              <StatCard key={idx} {...card} />
            ))}
          </div>

        </div>

      </div>

      {/* DASHBOARD FOOTER */}
      <footer className="bg-white border-t border-slate-100 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
            &copy; {new Date().getFullYear()} Dinas Ketenagakerjaan Kabupaten Bekasi
          </p>
        </div>
      </footer>
    </div>
  )
}

function StatCard({ title, count, label, icon: Icon, color, href }: any) {
  const colors: any = {
    red: 'bg-red-100 text-red-600 hover:border-red-300',
    blue: 'bg-blue-100 text-blue-600 hover:border-blue-300',
    green: 'bg-green-100 text-green-600 hover:border-green-300',
    orange: 'bg-orange-100 text-orange-600 hover:border-orange-300',
    purple: 'bg-purple-100 text-purple-600 hover:border-purple-300',
    emerald: 'bg-emerald-100 text-emerald-600 hover:border-emerald-300',
  }

  // Derived border color for hover effect
  const borderColor = color === 'red' ? 'hover:border-red-400' :
    color === 'blue' ? 'hover:border-blue-400' :
      color === 'green' ? 'hover:border-green-400' :
        'hover:border-gray-400'

  return (
    <Link href={href} className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-all duration-300 hover:translate-y-[-4px] hover:shadow-lg group ${borderColor}`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-4 rounded-xl ${colors[color] || colors.blue} transition-transform group-hover:scale-110`}>
          <Icon size={24} />
        </div>
        <div className="bg-gray-50 px-3 py-1 rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-wider group-hover:bg-gray-100 transition">
          {label}
        </div>
      </div>
      <div>
        <h4 className="text-3xl font-extrabold text-slate-800 mb-1 group-hover:text-slate-900">{count}</h4>
        <p className="text-sm font-bold text-slate-500 group-hover:text-slate-600">{title}</p>
      </div>
      {/* Decorative arrow */}
      <div className="absolute bottom-6 right-6 opacity-0 transform translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-slate-300">
        <ChevronRight size={20} />
      </div>
    </Link>
  )
}
