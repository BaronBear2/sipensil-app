import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar' // Assuming Navbar exists and is generic enough
import Link from 'next/link'
import { Building, FileText, Settings, LogOut } from 'lucide-react'
import { logout } from '@/actions/auth'

export default async function PerusahaanDashboard() {
  const supabase = await createClient()

  // 1. Cek Login
  let user;
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch (error) {
    console.error("Supabase Auth Error:", error)
    return <div className="p-8 text-red-600 font-bold border rounded-lg bg-red-50">Gagal terhubung ke server (Auth Timeout). Silakan refresh halaman.</div>
  }

  if (!user) redirect('/auth/login')

  let profile = null;
  try {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    profile = data;
  } catch (error) {
    console.error("Supabase Profile Error:", error)
    // Continue without profile, UI handles it
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">

        {/* 1. WELCOME SECTION (Pencaker Style) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 mb-8 relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
              Selamat Datang, <span className="text-blue-600">{profile?.company_name || user.email}</span> 👋
            </h1>
            <p className="text-slate-500">
              Kelola data perusahaan dan pengajuan magang Anda di sini.
            </p>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <Building size={20} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tipe Akun</p>
              <p className="font-bold text-slate-700 text-sm">Perusahaan</p>
            </div>
          </div>

          {/* Decorative BG */}
          <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-full -mr-8 -mt-8 pointer-events-none"></div>
        </div>

        {/* 2. MAIN MENU GRID */}
        <h3 className="font-bold text-slate-700 text-lg mb-4 flex items-center gap-2">
          <Settings size={20} className="text-blue-600" /> Layanan Tersedia
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* MENU 1: PERJANJIAN PEMAGANGAN */}
          <Link href="/dashboard/perusahaan/pemagangan" className="group relative bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 transition-all overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>

            <div className="relative z-10">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <FileText size={24} />
              </div>

              <h4 className="font-bold text-slate-800 text-lg mb-1 group-hover:text-blue-700 transition-colors">Perjanjian Pemagangan</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                Ajukan pencatatan surat perjanjian pemagangan dalam negeri secara resmi.
              </p>

              <div className="mt-4 flex items-center text-xs font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                Akses Layanan →
              </div>
            </div>
          </Link>

          {/* HELP CARD */}
          <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-6 text-white flex flex-col justify-center items-center text-center shadow-lg">
            <Building size={32} className="mb-3 text-blue-400" />
            <h4 className="font-bold text-lg mb-1">Butuh Bantuan?</h4>
            <p className="text-slate-300 text-sm mb-4">Hubungi Admin Dinas jika ada kendala data.</p>
            <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold backdrop-blur-sm transition border border-white/10">
              Hubungi Admin
            </button>
          </div>

        </div>

      </div>
    </div>
  )
}