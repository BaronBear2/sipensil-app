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
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
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

  // Logic Warna Status
  const statusColor =
    profile?.account_status === 'verified' ? 'green' :
      profile?.account_status === 'rejected' ? 'red' : 'yellow';

  const statusText =
    profile?.account_status === 'verified' ? 'AKUN TERVERIFIKASI' :
      profile?.account_status === 'rejected' ? 'VERIFIKASI DITOLAK' :
        profile?.account_status === 'unverified' ? 'BELUM LENGKAP' : 'MENUNGGU VERIFIKASI';

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-32">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">

        {/* 1. WELCOME HEADER - MORE INVITING */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800">
              Halo, <span className="text-blue-600">{profile?.full_name?.split(' ')[0]}</span> 👋
            </h1>
            <p className="text-slate-500 mt-2 font-medium">
              Selamat datang di Dashboard SiPensil.
              {profile?.account_status === 'unverified'
                ? ' Yuk, lengkapi profilmu untuk mulai mendaftar pelatihan.'
                : ' Akses semua layanan ketenagakerjaan di sini.'}
            </p>
          </div>

          {/* Action Button if showing all trainings but have pending */}
          {activeTraining && showAll && (
            <Link href="/dashboard/pencaker" className="group bg-blue-50 hover:bg-blue-100 text-blue-700 px-6 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 border border-blue-200">
              <Clock size={18} className="text-blue-600" />
              <span>Lihat Status Pendaftaran Saya</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>

        {/* 2. CRITICAL ALERTS */}
        {profile?.account_status === 'rejected' && (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-2xl mb-8 flex items-start gap-4 shadow-sm animate-shake">
            <div className="bg-red-100 p-2 rounded-full text-red-600 shrink-0">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h4 className="font-bold text-red-900 text-lg">Verifikasi Akun Ditolak</h4>
              <p className="text-red-700 mt-1">Admin memberikan pesan berikut: <span className="font-bold">"{profile.rejection_message}"</span></p>
              <Link href="/dashboard/pencaker/profile" className="inline-flex items-center gap-2 mt-3 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition">
                Perbaiki Profil Sekarang <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}

        {/* 3. PENDING TRAINING VIEW (HERO STATUS) */}
        {showPendingView && activeTraining ? (
          <div className="mb-12 animate-fade-in-up">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Briefcase className="text-blue-600" size={24} />
              Status Pendaftaran Aktif
            </h2>

            <div className="bg-white rounded-3xl shadow-xl shadow-blue-100/50 overflow-hidden ring-1 ring-slate-100">
              {/* Status Banner */}
              <div className="bg-blue-600 p-8 text-white relative overflow-hidden">
                <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 skew-x-12"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md shadow-inner border border-white/30">
                    <Clock size={40} className="text-white drop-shadow-md" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-3xl font-extrabold mb-2 text-white tracking-tight">Menunggu Verifikasi</h3>
                    <p className="text-blue-50 text-base max-w-2xl leading-relaxed font-medium opacity-90">
                      Permohonan Anda sedang ditinjau oleh tim Admin Dinas. Kami sedang memeriksa kelengkapan profil dan persyaratan pelatihan Anda.
                    </p>
                  </div>
                </div>
              </div>

              {/* Detail Content */}
              <div className="p-8">
                <div className="flex flex-col md:flex-row gap-8">
                  {activeTraining.image_url ? (
                    <img src={activeTraining.image_url} className="w-full md:w-56 h-40 object-cover rounded-2xl shadow-md ring-1 ring-slate-100" />
                  ) : (
                    <div className="w-full md:w-56 h-40 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300">
                      <Briefcase size={40} />
                    </div>
                  )}

                  <div className="flex-1 space-y-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                        {activeTraining.category || 'Pelatihan BLK'}
                      </span>
                      <h2 className="text-2xl font-bold text-slate-800 mt-3">{activeTraining.title}</h2>
                      <div className="flex items-center gap-2 text-slate-500 font-medium mt-1">
                        <User size={16} />
                        <span>Penyelenggara: {activeTraining.provider}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100">
                      <div className="text-center px-6 py-2 bg-slate-50 rounded-xl">
                        <span className="block text-2xl font-bold text-slate-800">{activeTraining.min_age}-{activeTraining.max_age}</span>
                        <span className="text-xs text-slate-500 font-bold uppercase">Usia</span>
                      </div>
                      <div className="text-center px-6 py-2 bg-slate-50 rounded-xl">
                        <span className="block text-2xl font-bold text-slate-800">{activeTraining.quota}</span>
                        <span className="text-xs text-slate-500 font-bold uppercase">Kuota Peserta</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 min-w-[240px]">
                    <Link
                      href={`/dashboard/pencaker/training/${activeTraining.id}`}
                      className="w-full bg-blue-600 text-white font-bold px-6 py-4 rounded-xl text-center hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95 flex items-center justify-center gap-2"
                    >
                      <span>Lihat Detail Lengkap</span>
                      <ArrowRight size={18} />
                    </Link>
                    <Link
                      href="/dashboard/pencaker?view=all"
                      className="w-full bg-white text-slate-600 border-2 border-slate-200 font-bold px-6 py-4 rounded-xl text-center hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      Lihat Pelatihan Lainnya
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* 4. DASHBOARD MENU CARDS - BEGINNER FRIENDLY "STEPS" FEEL */}
            <h2 className="text-xl font-bold text-slate-800 mb-4 px-1">Menu Utama</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-fade-in-up">

              {/* STEP 1: PROFIL - Highlighted if Unverified */}
              <Link href="/dashboard/pencaker/profile" className={`relative group p-6 rounded-3xl border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between h-48
                  ${statusColor === 'yellow' && profile?.account_status === 'unverified'
                  ? 'bg-blue-50 border-blue-400 border-dashed shadow-blue-100 ring-4 ring-blue-50/50'
                  : 'bg-white border-transparent shadow-sm hover:border-blue-100'
                }
              `}>
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-4 rounded-2xl ${statusColor === 'yellow' ? 'bg-blue-200 text-blue-700' : 'bg-slate-100 text-slate-600'} group-hover:bg-blue-600 group-hover:text-white transition-colors`}>
                      <User size={28} />
                    </div>
                    <div className="bg-slate-100 text-slate-500 text-xs font-bold px-3 py-1 rounded-full">Langkah 1</div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">Data Diri & Profil</h3>
                  <p className="text-sm text-slate-500 mt-2 leading-snug">
                    {profile?.account_status === 'unverified'
                      ? 'Wajib dilengkapi sebelum mendaftar pelatihan.'
                      : 'Update CV, dokumen, dan data diri Anda.'}
                  </p>
                </div>
              </Link>

              {/* STEP 2: STATUS AKUN */}
              <div className={`relative p-6 rounded-3xl border transition-all duration-300 hover:shadow-lg flex flex-col justify-between h-48 overflow-hidden
                  ${statusColor === 'green' ? 'bg-green-600 border-green-500 text-white shadow-green-200' :
                  statusColor === 'red' ? 'bg-red-600 border-red-500 text-white' :
                    'bg-white border-slate-100 shadow-sm'
                }
              `}>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-4 rounded-2xl bg-white/20 backdrop-blur-sm ${statusColor === 'yellow' ? 'text-slate-600' : 'text-white'}`}>
                      <ShieldCheck size={28} />
                    </div>
                    <div className={`text-xs font-bold px-3 py-1 rounded-full ${statusColor === 'yellow' ? 'bg-slate-100 text-slate-500' : 'bg-white/20 text-white'}`}>Info Status</div>
                  </div>
                  <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${statusColor === 'yellow' ? 'text-slate-400' : 'text-white/80'}`}>Status Verifikasi</p>
                  <h3 className={`text-2xl font-extrabold ${statusColor === 'yellow' ? 'text-purple-600' : 'text-white'}`}>
                    {statusText}
                  </h3>
                </div>
                {/* Decorative BG */}
                <ShieldCheck size={140} className={`absolute -bottom-6 -right-6 opacity-10 rotate-[-10deg] ${statusColor === 'yellow' ? 'text-slate-800' : 'text-white'}`} />
              </div>

              {/* STEP 3: IM JAPAN */}
              <Link href="/dashboard/pencaker/im-japan" className="group bg-gradient-to-br from-white to-red-50 p-6 rounded-3xl border border-red-100 shadow-sm hover:shadow-xl hover:border-red-200 hover:-translate-y-1 transition-all flex flex-col justify-between h-48">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-4 rounded-2xl bg-red-100 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors shadow-sm">
                      <span className="text-xl font-bold">🇯🇵</span>
                    </div>
                    <div className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded-full border border-red-200">Program Khusus</div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-red-700 transition-colors">Program IM Japan</h3>
                  <p className="text-sm text-slate-500 mt-2 leading-snug">Karir Profesional ke Jepang. Pelatihan bahasa & keterampilan teknis.</p>
                </div>
              </Link>

            </div>

            {/* 5. TRAINING LIST SECTION */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <BookOpen className="text-blue-600" size={28} />
                  Program Pelatihan Tersedia
                </h2>
                <p className="text-slate-500 mt-1 text-sm">Pilih pelatihan yang sesuai dengan minat dan kualifikasi Anda.</p>
              </div>

              {profile?.account_status !== 'verified' && (
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-full text-xs font-bold border border-yellow-200">
                  <AlertTriangle size={14} />
                  <span>Lengkapi profil untuk dapat mendaftar</span>
                </div>
              )}
            </div>

            {/* List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {trainings?.map((item: any) => (
                <TrainingCard key={item.id} item={item} userStatus={profile?.account_status || 'unverified'} />
              ))}
              {(!trainings || trainings.length === 0) && (
                <div className="col-span-full py-16 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
                  <ClipboardList className="mx-auto text-slate-300 mb-4" size={48} />
                  <p className="text-slate-400 font-bold text-lg">Belum ada pelatihan yang dibuka sat ini.</p>
                  <p className="text-slate-400 text-sm">Silakan cek kembali secara berkala.</p>
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  )
}