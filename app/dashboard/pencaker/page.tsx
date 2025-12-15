// app/dashboard/pencaker/page.tsx
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ShieldCheck, AlertCircle, AlertTriangle, User, ClipboardList, Edit } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import TrainingCard from '@/components/TrainingCard'

export default async function DashboardPencaker() {
  const supabase = await createClient()
  
  // 1. Cek User Login
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // 2. Fetch Data
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const { data: trainings } = await supabase.from('blk_trainings').select('*')

  // Logic Warna Status
  const statusColor = 
    profile?.account_status === 'verified' ? 'green' : 
    profile?.account_status === 'rejected' ? 'red' : 'yellow';

  const statusText = 
    profile?.account_status === 'verified' ? 'AKUN TERVERIFIKASI' :
    profile?.account_status === 'rejected' ? 'VERIFIKASI DITOLAK' :
    profile?.account_status === 'pending' ? 'MENUNGGU VERIFIKASI' : 'BELUM LENGKAP';

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
        
        {/* NOTIFIKASI JIKA DITOLAK */}
        {profile?.account_status === 'rejected' && (
           <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg mb-6 flex items-start gap-4 shadow-sm">
              <AlertTriangle className="text-red-500 mt-1" size={24}/>
              <div>
                  <h4 className="font-bold text-red-800 text-lg">Verifikasi Ditolak</h4>
                  <p className="text-red-700 mt-1">"{profile.rejection_message}"</p>
                  <p className="text-sm text-red-600 mt-2">Silakan klik tombol Edit Profil di bawah untuk memperbaiki data.</p>
              </div>
           </div>
        )}

        {/* HEADER DASHBOARD (KARTU UTAMA) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                 <div>
                    <h2 className="text-2xl font-bold text-gray-800">Halo, {profile?.full_name} 👋</h2>
                    <p className="text-gray-500 text-sm mt-1">
                        NIK: {profile?.nik ? profile.nik : <span className="text-red-500 italic">(Belum diisi)</span>}
                    </p>
                 </div>

                 {/* --- INI TOMBOL YANG ANDA CARI --- */}
                 <Link 
                    href="/dashboard/pencaker/profile" 
                    className="mt-4 md:mt-0 flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition shadow-md active:scale-95"
                 >
                    <User size={18}/> 
                    {profile?.account_status === 'unverified' ? 'Lengkapi Profil Sekarang' : 'Lihat & Edit Profil'}
                 </Link>
                 {/* ---------------------------------- */}
            </div>

            {/* STATUS BAR */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                 <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mb-3">
                     <h4 className={`font-bold text-gray-700 flex items-center gap-2`}>
                        <ShieldCheck size={20} className={`text-${statusColor}-600`}/> Status Akun
                     </h4>
                     <span className={`px-3 py-1 rounded-full text-xs font-bold w-fit bg-${statusColor}-100 text-${statusColor}-700 border border-${statusColor}-200`}>
                        {statusText}
                     </span>
                 </div>
                 
                 {/* Progress Bar Visual */}
                 <div className="h-3 bg-gray-200 rounded-full overflow-hidden mt-2 relative">
                    <div 
                        className={`h-full bg-${statusColor}-500 transition-all duration-1000 absolute top-0 left-0`} 
                        style={{width: profile?.account_status === 'verified' ? '100%' : '50%'}}
                    ></div>
                 </div>
                 
                 {/* Pesan Bantuan di Bawah Status */}
                 <div className="mt-3 text-sm">
                    {profile?.account_status === 'pending' && (
                        <p className="text-yellow-700 flex items-center gap-2 bg-yellow-50 p-2 rounded border border-yellow-100">
                            <AlertCircle size={16}/> 
                            Data Anda sedang diperiksa oleh Admin Dinas. Mohon tunggu 1x24 jam.
                        </p>
                    )}
                    {profile?.account_status === 'unverified' && (
                        <p className="text-gray-600 flex items-center gap-2">
                            <Edit size={16} className="text-blue-500"/> 
                            Silakan klik tombol biru di atas untuk melengkapi data agar bisa diverifikasi.
                        </p>
                    )}
                    {profile?.account_status === 'verified' && (
                        <p className="text-green-700 flex items-center gap-2">
                            <ShieldCheck size={16}/> 
                            Akun aman. Anda dapat mendaftar pelatihan di bawah ini.
                        </p>
                    )}
                 </div>
            </div>
        </div>

        {/* LIST PELATIHAN */}
        <h3 className="font-bold text-gray-700 text-lg mb-4 flex items-center gap-2 border-b pb-2">
            <ClipboardList size={22} className="text-blue-600"/> Program Pelatihan Tersedia
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainings?.map((item: any) => (
             <TrainingCard key={item.id} item={item} userStatus={profile?.account_status || 'unverified'} />
          ))}
        </div>

      </div>
    </div>
  )
}