import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import LpkReportForm from '@/components/lpk/LpkReportForm'
import { ShieldCheck, FileText, History, Edit, Lock, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardLPK({ searchParams }: { searchParams: Promise<{ tab?: string, editId?: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (profile?.role !== 'ADMIN_LPK') return <div className="p-10 text-red-600 font-bold">Akses Khusus LPK</div>

  const params = await searchParams
  const activeTab = params.tab || 'buat_laporan'

  // Fetch Riwayat
  const { data: reports } = await supabase.from('lpk_reports').select('*').eq('user_id', user.id).order('created_at', { ascending: false })

  // Cek Edit Mode
  let initialData = null
  if (params.editId) {
     const { data: report } = await supabase.from('lpk_reports').select('*').eq('id', params.editId).single()
     initialData = report
  }

  // --- LOGIC KUNCI ---
  // Form Terbuka JIKA: Status bukan 'unverified' (Jadi Pending atau Verified BOLEH masuk)
  const isUnlocked = profile.account_status !== 'unverified'

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* HEADER DASHBOARD */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        {profile.company_name || 'Selamat Datang, LPK Baru'} 
                        {!isUnlocked && <span className="text-xs font-normal text-red-500 bg-red-50 px-2 py-1 rounded border border-red-100">(Data Belum Lengkap)</span>}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">Kelola pelaporan kegiatan pelatihan secara berkala.</p>
                </div>
                
                <div className="mt-4 md:mt-0 flex items-center gap-3">
                    <div className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-2 ${
                        profile.account_status === 'verified' ? 'bg-green-50 text-green-700 border-green-200' : 
                        profile.account_status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-gray-100 text-gray-600'
                    }`}>
                        <ShieldCheck size={14}/> {profile.account_status === 'unverified' ? 'BELUM DIVERIFIKASI' : profile.account_status.toUpperCase()}
                    </div>
                    <Link href="/dashboard/lpk/profile" className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-sm font-bold text-blue-600 hover:bg-blue-50 transition shadow-sm">
                        <Edit size={16}/> {isUnlocked ? 'Edit Profil' : 'Lengkapi Profil'}
                    </Link>
                </div>
            </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex gap-2 mb-6 border-b pb-1">
            <Link href="/dashboard/lpk?tab=buat_laporan" className={`px-4 py-2 text-sm font-bold flex items-center gap-2 rounded-t-lg transition ${activeTab === 'buat_laporan' ? 'bg-white border border-b-0 text-blue-600' : 'text-gray-500 hover:bg-gray-200'}`}>
                <FileText size={16}/> {params.editId ? 'Edit Laporan' : 'Buat Laporan'}
            </Link>
            <Link href="/dashboard/lpk?tab=riwayat" className={`px-4 py-2 text-sm font-bold flex items-center gap-2 rounded-t-lg transition ${activeTab === 'riwayat' ? 'bg-white border border-b-0 text-blue-600' : 'text-gray-500 hover:bg-gray-200'}`}>
                <History size={16}/> Riwayat
            </Link>
        </div>

        <div className="bg-white p-6 rounded-b-xl rounded-r-xl border shadow-sm min-h-[600px] relative overflow-hidden">
            
            {/* === KONTEN TAB: BUAT LAPORAN === */}
            {activeTab === 'buat_laporan' && (
                <div className="relative">
                    
                    {/* OVERLAY PENGUNCI (Jika Belum Lengkap) */}
                    {!isUnlocked && (
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm rounded-xl">
                            <div className="bg-white p-8 rounded-2xl shadow-2xl border text-center max-w-md animate-bounce-small">
                                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Lock className="text-blue-600 w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Formulir Terkunci</h3>
                                <p className="text-gray-600 mb-6 text-sm">
                                    Untuk mengisi laporan, Anda wajib melengkapi <strong>Profil Lembaga</strong> terlebih dahulu agar data Anda valid di sistem Dinas.
                                </p>
                                <Link href="/dashboard/lpk/profile" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg hover:shadow-blue-500/30">
                                    Lengkapi Profil Sekarang <ChevronRight size={18}/>
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* FORM ASLI (Blur Effect di Background) */}
                    <div className={!isUnlocked ? 'filter blur-[2px] opacity-40 pointer-events-none select-none grayscale' : ''}>
                        <LpkReportForm profile={profile} initialData={initialData} />
                    </div>

                </div>
            )}
            
            {/* === KONTEN TAB: RIWAYAT === */}
            {activeTab === 'riwayat' && (
                <div className="space-y-3">
                    {reports?.length === 0 ? <p className="text-gray-400 italic text-center py-10">Belum ada laporan dikirim.</p> : 
                        reports?.map((r: any) => (
                            <div key={r.id} className="flex justify-between items-center p-4 border rounded-lg bg-gray-50 hover:bg-white transition shadow-sm">
                                <div>
                                    <div className="font-bold text-gray-800">Laporan Semester {r.semester} {r.tahun}</div>
                                    <div className="text-xs text-gray-500 mt-1">Dikirim: {new Date(r.created_at).toLocaleDateString()}</div>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    {r.status === 'APPROVED' ? (
                                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded text-xs font-bold border border-green-200">DITERIMA</span>
                                    ) : r.status === 'REJECTED' ? (
                                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded text-xs font-bold border border-red-200">DITOLAK (Revisi)</span>
                                    ) : (
                                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded text-xs font-bold border border-yellow-200">DIPROSES</span>
                                    )}

                                    {r.status !== 'APPROVED' && (
                                        <Link href={`/dashboard/lpk?tab=buat_laporan&editId=${r.id}`} className="text-blue-600 hover:text-blue-800 text-xs font-bold flex items-center gap-1 border px-2 py-1 rounded bg-white hover:bg-blue-50">
                                            <Edit size={12}/> Edit
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))
                    }
                </div>
            )}
        </div>
      </div>
    </div>
  )
}