// app/dashboard/pencaker/page.tsx
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ShieldCheck, AlertCircle, AlertTriangle, User, ClipboardList, Edit, Clock, CheckCircle, ArrowRight, BookOpen, Briefcase } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import TrainingCard from '@/components/TrainingCard'

export const dynamic = 'force-dynamic'

export default async function DashboardPencaker({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const supabase = await createClient()
  const params = await searchParams
  const showAll = params.view === 'all'

  // 1. Cek User Login
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // 2. Fetch Data
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
  const { data: trainings } = await supabase.from('blk_trainings').select('*')

  // 3. Fetch Pending Registration
  const { data: pendingReg, error: regError } = await supabase
    .from('training_registrations')
    .select('*, blk_trainings(*)')
    .eq('user_id', user.id)
    .eq('status', 'PENDING')
    .order('created_at', { ascending: false })
    .maybeSingle()

  const activeTraining = pendingReg?.blk_trainings
  const showPendingView = activeTraining && !showAll

  // Check Completeness
  const requiredFields = ['nik', 'full_name', 'dob', 'address_ktp', 'phone', 'education', 'gender', 'address_dom']
  const isProfileComplete = requiredFields.every(field => profile?.[field])

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto px-4 py-12 w-full animate-fade-in">

        {/* WELCOME HEADER */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-2">
            Halo, <span className="text-blue-600">{profile?.full_name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-slate-500 font-medium">Selamat datang di Dashboard Pencari Kerja.</p>
        </div>

        {/* 3 CORE ACTIONS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">

          {/* CARD 1: PROFIL / VERIFIKASI */}
          <Link href="/dashboard/pencaker/profile" className={`relative group p-8 rounded-3xl border-2 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl flex flex-col items-center text-center h-80 justify-center
              ${profile?.account_status === 'unverified'
              ? (isProfileComplete
                ? 'bg-yellow-50 border-yellow-400 border-dashed shadow-yellow-100 ring-4 ring-yellow-50/50' // Completed but Unverified
                : 'bg-blue-50 border-blue-400 border-dashed shadow-blue-100 ring-4 ring-blue-50/50') // Incomplete
              : 'bg-white border-slate-100 shadow-sm hover:border-blue-100'
            }
          `}>
            <div className={`p-6 rounded-full mb-6 
                ${profile?.account_status === 'unverified' && isProfileComplete ? 'bg-yellow-100 text-yellow-600' :
                profile?.account_status === 'unverified' ? 'bg-blue-200 text-blue-700' : 'bg-slate-100 text-slate-600'} 
                group-hover:bg-blue-600 group-hover:text-white transition-colors`}>
              {profile?.account_status === 'verified' ? <ShieldCheck size={40} /> : <User size={40} />}
            </div>

            <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors mb-2">
              {profile?.account_status === 'verified' ? 'Profil Terverifikasi' :
                (isProfileComplete ? 'Menunggu Verifikasi' : 'Lengkapi Profil')}
            </h3>

            <p className="text-sm text-slate-500 leading-relaxed px-4">
              {profile?.account_status === 'verified' ? 'Data diri Anda sudah valid. Siap mendaftar pelatihan.' :
                (isProfileComplete ? 'Data sudah terlengkapi. Anda sudah bisa melakukan pelayanan' : 'Langkah Pertama! Isi data diri Anda untuk verifikasi akun.')}
            </p>

            {profile?.account_status === 'unverified' && (
              <span className={`mt-6 px-4 py-2 text-white text-xs font-bold rounded-full animate-pulse ${isProfileComplete ? 'bg-yellow-600' : 'bg-blue-600'}`}>
                {isProfileComplete ? 'SUDAH LENGKAP - SEDANG MENUNGGU VERIFIKASI' : 'Wajib Diisi'}
              </span>
            )}
          </Link>

          {/* CARD 2: PROGRAM BLK */}
          <Link href="/dashboard/pencaker/programs" className="group p-8 rounded-3xl bg-white border-2 border-slate-100 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-blue-100 flex flex-col items-center text-center h-80 justify-center">
            <div className="p-6 rounded-full bg-emerald-100 text-emerald-600 mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <BookOpen size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 group-hover:text-emerald-600 transition-colors mb-2">
              Program Pelatihan BLK
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed px-4">
              Daftar pelatihan kompetensi gratis di UPTD BLK Kabupaten Bekasi.
            </p>
          </Link>

          {/* CARD 3: IM JAPAN */}
          <Link href="/dashboard/pencaker/im-japan" className="group p-8 rounded-3xl bg-gradient-to-b from-white to-red-50 border-2 border-red-50 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-red-200 flex flex-col items-center text-center h-80 justify-center">
            <div className="p-6 rounded-full bg-red-100 text-red-600 mb-6 group-hover:bg-red-600 group-hover:text-white transition-colors">
              <span className="text-3xl">🇯🇵</span>
            </div>
            <h3 className="text-xl font-bold text-slate-800 group-hover:text-red-600 transition-colors mb-2">
              Program IM Japan
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed px-4">
              Program pemagangan ke Jepang. Karir internasional dan gaji tinggi.
            </p>
          </Link>

        </div>

      </main>

      {/* DASHBOARD FOOTER (Requested in Item 3) */}
      <footer className="bg-white border-t border-slate-100 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm font-medium mb-4">Dinas Ketenagakerjaan Kabupaten Bekasi</p>
          <div className="flex justify-center gap-6 text-sm font-bold text-slate-600">
            <Link href="/dashboard/pencaker" className="hover:text-blue-600">Dashboard</Link>
            <Link href="/dashboard/pencaker/profile" className="hover:text-blue-600">Profil Saya</Link>
            <Link href="/dashboard/pencaker/programs" className="hover:text-blue-600">Program BLK</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}