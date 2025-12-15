import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AlertCircle, ClipboardList, FileText, Users, CheckCircle, XCircle } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import VerificationTable from '@/components/admin/VerificationTable'
import { verifyTrainingAction } from '@/actions/dinas' 

export default async function DashboardAdmin({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const supabase = await createClient()
  const params = await searchParams 
  const activeTab = params.tab || 'verifikasi_akun'

  // 1. Cek Login & Role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  
  // Security Check
  if (profile?.role !== 'ADMIN_DINAS') {
    return <div className="min-h-screen flex items-center justify-center text-red-600 font-bold">AKSES DITOLAK: Khusus Admin Dinas.</div>
  }

  // 2. Fetch Data Berdasarkan Tab (DENGAN TIPE ANY AGAR TIDAK ERROR)
  let pendingUsers: any[] = []      // <--- PERBAIKAN DI SINI
  let pendingTrainings: any[] = []  // <--- PERBAIKAN DI SINI

  // -- Data Tab 1: Akun --
  if (activeTab === 'verifikasi_akun') {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'PENCAKER')
      .eq('account_status', 'pending') 
      .order('created_at', { ascending: false })
    
    if (data) pendingUsers = data
  }

  // -- Data Tab 2: Pelatihan --
  if (activeTab === 'verifikasi_pelatihan') {
    // Menggunakan Query Relasional Supabase
    // profiles: mengambil data user
    // blk_trainings: mengambil judul pelatihan
    const { data } = await supabase
      .from('training_registrations')
      .select(`
        id, 
        status, 
        applied_at,
        profiles!inner (full_name, nik, phone),
        blk_trainings!inner (title, batch_name)
      `)
      .eq('status', 'PENDING_SELECTION') 
      .order('applied_at', { ascending: false })
    
    if (data) pendingTrainings = data
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="mb-8">
           <h2 className="text-2xl font-bold text-gray-800">Panel Admin Dinas</h2>
           <p className="text-gray-500">Selamat datang, {profile.full_name}</p>
        </div>

        {/* Tab Navigasi */}
        <div className="flex gap-2 mb-6 overflow-x-auto border-b border-gray-200 pb-1">
           <Link href="/dashboard/dinas?tab=verifikasi_akun" 
             className={`px-4 py-2 rounded-t-lg text-sm font-bold flex items-center gap-2 transition-colors ${
               activeTab === 'verifikasi_akun' ? 'bg-white border border-b-0 text-blue-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
             }`}>
             <Users size={16}/> Verifikasi Akun
           </Link>
           <Link href="/dashboard/dinas?tab=verifikasi_pelatihan" 
             className={`px-4 py-2 rounded-t-lg text-sm font-bold flex items-center gap-2 transition-colors ${
               activeTab === 'verifikasi_pelatihan' ? 'bg-white border border-b-0 text-blue-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
             }`}>
             <ClipboardList size={16}/> Pendaftaran Pelatihan
           </Link>
           <Link href="/dashboard/dinas?tab=laporan_masuk" 
             className={`px-4 py-2 rounded-t-lg text-sm font-bold flex items-center gap-2 transition-colors ${
               activeTab === 'laporan_masuk' ? 'bg-white border border-b-0 text-blue-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
             }`}>
             <FileText size={16}/> Laporan Masuk
           </Link>
        </div>

        {/* Isi Konten */}
        <div className="bg-white rounded-b-xl rounded-r-xl shadow-sm border p-6 min-h-[400px]">
           
           {/* TAB 1: VERIFIKASI AKUN */}
           {activeTab === 'verifikasi_akun' && (
             <div>
                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                   <AlertCircle size={18} className="text-orange-500"/> Antrian Verifikasi Akun
                </h3>
                <VerificationTable users={pendingUsers} />
             </div>
           )}

           {/* TAB 2: VERIFIKASI PELATIHAN */}
           {activeTab === 'verifikasi_pelatihan' && (
             <div>
                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                   <ClipboardList size={18} className="text-blue-500"/> Pendaftaran Pelatihan Masuk
                </h3>
                {pendingTrainings.length === 0 ? (
                   <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                      <ClipboardList size={48} className="mb-2 opacity-20"/>
                      <p>Belum ada pendaftaran baru.</p>
                   </div>
                ) : (
                   <div className="overflow-x-auto">
                     <table className="w-full text-sm text-left border rounded-lg">
                       <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                         <tr>
                           <th className="px-6 py-3">Nama Peserta</th>
                           <th className="px-6 py-3">Pelatihan</th>
                           <th className="px-6 py-3">Tanggal</th>
                           <th className="px-6 py-3 text-center">Aksi</th>
                         </tr>
                       </thead>
                       <tbody>
                         {pendingTrainings.map((item: any) => (
                           <tr key={item.id} className="bg-white border-b hover:bg-gray-50 transition">
                             <td className="px-6 py-4">
                               <div className="font-bold text-gray-800">{item.profiles?.full_name || 'Tanpa Nama'}</div>
                               <div className="text-xs text-gray-500">HP: {item.profiles?.phone || '-'}</div>
                               <div className="text-xs text-gray-400">NIK: {item.profiles?.nik || '-'}</div>
                             </td>
                             <td className="px-6 py-4">
                               <div className="font-bold text-blue-800">{item.blk_trainings?.title || 'Judul Error'}</div>
                               <div className="text-xs text-gray-500 bg-blue-50 inline-block px-2 py-0.5 rounded mt-1">
                                 {item.blk_trainings?.batch_name || 'Batch ?'}
                               </div>
                             </td>
                             <td className="px-6 py-4 text-xs text-gray-500">
                               {item.applied_at ? new Date(item.applied_at).toLocaleDateString('id-ID', {
                                 day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                               }) : '-'}
                             </td>
                             <td className="px-6 py-4">
                                <div className="flex justify-center gap-2">
                                  {/* Form Approve */}
                                  <form action={verifyTrainingAction}>
                                     <input type="hidden" name="regId" value={item.id} />
                                     <input type="hidden" name="action" value="approve" />
                                     <button className="bg-green-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-green-700 flex items-center gap-1 shadow-sm">
                                        <CheckCircle size={14}/> Terima
                                     </button>
                                  </form>
                                  {/* Form Reject */}
                                  <form action={verifyTrainingAction}>
                                     <input type="hidden" name="regId" value={item.id} />
                                     <input type="hidden" name="action" value="reject" />
                                     <button className="bg-red-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-red-700 flex items-center gap-1 shadow-sm">
                                        <XCircle size={14}/> Tolak
                                     </button>
                                  </form>
                                </div>
                             </td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                )}
             </div>
           )}

           {/* TAB 3: LAPORAN */}
           {activeTab === 'laporan_masuk' && (
             <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <FileText size={48} className="mb-4 opacity-20"/>
                <h3 className="text-lg font-bold text-gray-600">Fitur Laporan Belum Aktif</h3>
                <p className="text-sm">Menunggu implementasi Dashboard LPK & Perusahaan.</p>
             </div>
           )}

        </div>
      </div>
    </div>
  )
}