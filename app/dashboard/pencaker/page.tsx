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

  // 2. Fetch Data (Joined)
  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      *,
      profile_pencaker (*)
    `)
    .eq('id', user.id)
    .maybeSingle()

  // Defensive check for profile
  if (!profile) {
    console.error("Profile not found for user:", user.id)
    // On first load after migration, trigger might have run for new users but not old if migration script wasn't run on DB.
    // Assuming migration script IS run.
  }

  const pencakerData = profile?.profile_pencaker || {}

  const { data: trainings, error: trainingError } = await supabase.from('blk_trainings').select('*')
  if (trainingError) console.error("Error fetching trainings:", trainingError)

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
  const requiredFields = ['nik', 'date_of_birth', 'address_ktp', 'phone', 'education', 'gender', 'address_dom']
  // Check against the JOINED data (profile_pencaker)
  // Note: 'full_name' is in base profile. 'nik' etc are in profile_pencaker.
  // We need to map fields to their source.
  const isProfileComplete = profile && profile.full_name && requiredFields.every((field: string) => pencakerData[field])
  // Wait, dob/nik/etc are now in profile_pencaker.
  // Let's rely on pencakerData for specifics.
  // We need to check if 'nik' exists in pencakerData (it might be in base too if legacy columns exist, but we should prefer new table)


  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto px-4 py-12 w-full animate-fade-in">

        {/* WELCOME HEADER */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-2">
              Halo, <span className="text-blue-600">{profile?.full_name?.split(' ')[0]}</span> 👋
            </h1>
            <p className="text-slate-500 font-medium">Selamat datang di Dashboard Pencari Kerja.</p>
          </div>

          <Link href="/dashboard/pencaker/profile" className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 px-4 py-2 rounded-full font-bold text-sm transition-all shadow-sm">
            <User size={16} />
            <span>Edit Profil</span>
          </Link>
        </div>

        {/* 3 CORE ACTIONS GRID - Updated to 3 cols */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">

          {/* CARD 1 REMOVED (Profil/Verifikasi moved to header) */}

          {/* CARD 1: PELATIHAN SAYA (Available) */}
          <Link href="/dashboard/pencaker/pelatihan-saya" className="group p-6 rounded-3xl bg-white border-2 border-slate-100 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-blue-100 flex flex-col items-center text-center h-80 justify-center relative overflow-hidden">

            {/* Notif Badge if active training exists */}
            {activeTraining && (
              <div className="absolute top-4 right-4 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
              </div>
            )}

            <div className="p-5 rounded-full bg-indigo-100 text-indigo-600 mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <ClipboardList size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors mb-2">
              Pelatihan Saya
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed px-2">
              Lihat status pendaftaran, cetak tanda daftar, dan riwayat pelatihan Anda.
            </p>
          </Link>

          {/* CARD 2: PROGRAM BLK */}
          <Link href="/dashboard/pencaker/programs" className="group p-6 rounded-3xl bg-white border-2 border-slate-100 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-emerald-100 flex flex-col items-center text-center h-80 justify-center">
            <div className="p-5 rounded-full bg-emerald-100 text-emerald-600 mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <BookOpen size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 group-hover:text-emerald-600 transition-colors mb-2">
              Katalog Pelatihan
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed px-2">
              Cari dan daftar pelatihan kompetensi di BLK Kabupaten Bekasi.
            </p>
          </Link>

          {/* CARD 3: Permohonan Surat Rekomendasi (Updated) */}
          <Link href="/dashboard/pencaker/im-japan" className="group p-6 rounded-3xl bg-gradient-to-b from-white to-red-50 border-2 border-red-50 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-red-200 flex flex-col items-center text-center h-80 justify-center relative">
            <div className="p-5 rounded-full bg-red-100 text-red-600 mb-4 group-hover:bg-red-600 group-hover:text-white transition-colors">
              <span className="text-2xl">🇯🇵</span>
            </div>
            <h3 className="text-lg font-bold text-slate-800 group-hover:text-red-600 transition-colors mb-2">
              Surat Rekomendasi IM Japan
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed px-2">
              Ajukan surat rekomendasi tes IM Japan disini.
            </p>

            {/* Sub-link for History */}
            <object className="mt-4 w-full relative z-10">
              <Link href="/dashboard/pencaker/im-japan/riwayat" className="block w-full bg-white border border-red-100 text-red-600 hover:bg-red-600 hover:text-white py-2 rounded-lg text-xs font-bold transition shadow-sm">
                Lihat Riwayat Saya
              </Link>
            </object>
          </Link>

        </div>

      </main>

      {/* DASHBOARD FOOTER (Requested in Item 3) */}
      <footer className="bg-white border-t border-slate-100 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm font-bold mb-4">Dinas Ketenagakerjaan Kabupaten Bekasi</p>
        </div>
      </footer>

    </div>
  )
}