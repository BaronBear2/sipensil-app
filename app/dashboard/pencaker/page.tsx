// app/dashboard/pencaker/page.tsx
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ShieldCheck, AlertCircle, AlertTriangle, User, ClipboardList, Edit, Clock, CheckCircle, ArrowRight, BookOpen, Briefcase } from 'lucide-react'

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

  // User Request: Redirect rejected users directly to profile for revision
  if (profile?.account_status === 'rejected') {
    // Check if we are already showing a view? No, this is main dashboard.
    // Redirect to profile with edit param
    redirect('/dashboard/pencaker/profile?action=edit')
  }

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
  const regStatus = pendingReg?.status || ''

  // Check Completeness
  const requiredFields = ['nik', 'date_of_birth', 'address_ktp', 'phone', 'gender', 'place_of_birth']
  // Translation Map
  const fieldNames: Record<string, string> = {
    nik: 'NIK',
    date_of_birth: 'Tanggal Lahir',
    address_ktp: 'Alamat KTP',
    phone: 'Nomor Handphone',
    gender: 'Jenis Kelamin',
    place_of_birth: 'Tempat Lahir'
  }

  // Check against profile_pencaker data
  const missingFields = requiredFields.filter((field) => !pencakerData[field])
  const isProfileComplete = missingFields.length === 0


  return (
    <div className="font-sans flex flex-col w-full min-h-screen">

      <div className="w-full flex-1">

        {/* HERO SECTION */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white pt-12 pb-24 px-6 md:px-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-1/4 -translate-y-1/4">
            <ShieldCheck size={300} />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-5xl font-extrabold mb-2 tracking-tight">
                Halo, {profile?.full_name?.split(' ')[0]} 👋
              </h1>
              <p className="text-blue-100 font-medium text-lg max-w-xl">
                Selamat datang di SIPENSIL. Kelola pelatihan, karir, dan masa depan Anda di satu tempat.
              </p>
            </div>
            <Link href="/dashboard/pencaker/profile" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-sm text-white px-5 py-2.5 rounded-full font-bold text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
              <div className="bg-white text-blue-600 rounded-full p-1">
                <Edit size={14} />
              </div>
              <span>Edit Profil Saya</span>
            </Link>
          </div>
        </div>

        {/* MAIN CONTENT CARD GRID - Shifted up to overlap Hero */}
        <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20 pb-12">

          {/* ALERT REJECTION */}
          {profile?.account_status === 'rejected' && (
            <div className="mb-8 p-6 bg-white border-l-4 border-red-500 rounded-r-2xl shadow-lg flex flex-col md:flex-row items-start md:items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="p-3 bg-red-100 text-red-600 rounded-full shrink-0">
                <AlertCircle size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-red-700 text-lg">Verifikasi Akun Ditolak</h3>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  Mohon maaf, verifikasi data Anda ditolak dengan alasan:
                </p>
                <div className="bg-red-50 p-3 rounded-lg mt-2 border border-red-100 text-red-800 font-medium text-sm">
                  "{profile.rejection_message || 'Data tidak sesuai atau kurang lengkap.'}"
                </div>
                <p className="text-slate-500 text-xs mt-2">
                  Silakan perbaiki data di menu Profil Saya untuk mengajukan ulang.
                </p>
              </div>
              <Link href="/dashboard/pencaker/profile?action=edit" className="whitespace-nowrap flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-red-700 transition shadow-md hover:shadow-lg">
                Perbaiki Data <ArrowRight size={16} />
              </Link>
            </div>
          )}

          {/* ALERT PROFILE INCOMPLETE */}
          {!isProfileComplete && (
            <div className="mb-8 p-6 bg-white border border-red-100 rounded-2xl shadow-lg flex flex-col md:flex-row items-start md:items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="p-3 bg-red-100 text-red-600 rounded-full shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-red-700 text-lg">Profil Belum Lengkap</h3>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  Agar dapat mendaftar pelatihan, mohon lengkapi data berikut: <span className="font-semibold text-red-600">{missingFields.map(f => fieldNames[f] || f).join(', ')}</span>.
                </p>
              </div>
              <Link href="/dashboard/pencaker/profile" className="whitespace-nowrap flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-red-700 transition shadow-md hover:shadow-lg">
                Lengkapi Sekarang <ArrowRight size={16} />
              </Link>
            </div>
          )}

          {/* CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

            {/* CARD 1: PELATIHAN SAYA */}
            <Link href="/dashboard/pencaker/pelatihan-saya" className="group rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 p-8 flex flex-col items-center text-center hover:-translate-y-2 transition-all duration-300 relative overflow-hidden h-full">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>

              {/* Notif Badge if active training exists */}
              {activeTraining && (
                <div className="absolute top-4 right-4 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                </div>
              )}

              {/* Status Indicator */}
              {regStatus && (
                <div className={`absolute top-4 left-4 text-[10px] font-bold px-3 py-1 rounded-full border ${regStatus === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                  regStatus === 'DITERIMA' ? 'bg-green-50 text-green-700 border-green-200' :
                    'bg-slate-50 text-slate-600 border-slate-200'
                  }`}>
                  {regStatus === 'PENDING' ? 'Menunggu Verifikasi' : regStatus === 'DITERIMA' ? 'Aktif' : regStatus}
                </div>
              )}

              <div className="w-20 h-20 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-sm">
                <ClipboardList size={40} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-indigo-600 transition-colors">Pelatihan Saya</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Pantau status pendaftaran, jadwal seleksi, dan riwayat pelatihan kompetensi Anda.
              </p>
            </Link>

            {/* CARD 2: PROGRAM BLK */}
            <Link href="/dashboard/pencaker/programs" className="group rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 p-8 flex flex-col items-center text-center hover:-translate-y-2 transition-all duration-300 relative overflow-hidden h-full">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>

              <div className="w-20 h-20 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 shadow-sm">
                <BookOpen size={40} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-emerald-600 transition-colors">Katalog Pelatihan</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Jelajahi berbagai program pelatihan kejuruan yang tersedia di UPTD BLK Kabupaten Bekasi.
              </p>
            </Link>

            {/* CARD 3: Permohonan Surat Rekomendasi */}
            <Link href="/dashboard/pencaker/im-japan" className="group rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 p-8 flex flex-col items-center text-center hover:-translate-y-2 transition-all duration-300 relative overflow-hidden h-full">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-rose-500"></div>

              <div className="w-20 h-20 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-sm">
                <span className="text-4xl">🇯🇵</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-red-600 transition-colors">IM Japan</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-4">
                Program magang ke Jepang. Ajukan surat rekomendasi tes seleksi disini.
              </p>

              <object className="w-full relative z-10 pointer-events-none group-hover:pointer-events-auto">
                <div className="text-red-600 text-xs font-bold flex items-center justify-center gap-1 group-hover:translate-x-1 transition-transform">
                  Lihat Program <ArrowRight size={14} />
                </div>
              </object>
            </Link>

          </div>
        </div>

      </div>

      {/* DASHBOARD FOOTER */}
      <footer className="bg-white border-t border-slate-100 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
            &copy; {new Date().getFullYear()} Dinas Ketenagakerjaan Kabupaten Bekasi
          </p>
        </div>
      </footer>

    </div>
  )
}
