import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AlertCircle, ClipboardList, FileText, Users, CheckCircle, XCircle, Download, Building } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import VerificationTable from '@/components/admin/VerificationTable'
import { verifyImJapanAction, verifyLpkReportAction, verifyMagangPermitAction } from '@/actions/dinas'
import TrainingList from '@/components/admin/TrainingList'
import {
  AdminActionButtons,
  DeleteTrainingButton
} from '@/components/admin/AdminButtons'
import UserManagement from '@/components/admin/UserManagement'

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

  // 2. Fetch Data Berdasarkan Tab
  let dataTab1: any[] = [] // Verifikasi Akun (Gate BLK)
  let dataTab2: any[] = [] // IM Japan
  let dataTab3: any[] = [] // LPK Reports
  let dataTab4: any[] = [] // Magang Permits
  let dataTab5: any[] = [] // Manajemen Pelatihan (CRUD)
  let dataTab6: any[] = [] // Peserta Pelatihan (Monitor)
  let dataTab7: any[] = [] // Manajemen User (All Pencaker)

  // -- TAB 1: VERIFIKASI PELATIHAN BLK (SEBAGAI GATE PROFIL) --
  // Flow Baru: Admin hanya melihat Pencaker yang SUDAH DAFTAR PELATIHAN (status PENDING).
  // Query: training_registrations where status='PENDING' JOIN profiles
  if (activeTab === 'verifikasi_akun') {
    const { data } = await supabase
      .from('training_registrations')
      .select(`
        *,
        profiles!inner(*)
      `)
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false })

    if (data) {
      // Mapping flat structure agar sesuai dengan VerificationTable (expects User object)
      dataTab1 = data.map((reg: any) => ({
        ...reg.profiles,         // Spread data profile (nama, nik, dll)
        id: reg.profiles.id,     // ID User (PENTING untuk verifyProfileAction)
        created_at: reg.created_at, // Gunakan tanggal daftar training sebagai tanggal antrian
        training_reg_id: reg.id  // Extra info (tidak dipakai table tapi useful debug)
      }))
    }
  }

  // -- TAB 2: PROGRAM IM JAPAN --
  if (activeTab === 'im_japan') {
    // Need table `im_japan_registrations`
    try {
      const { data } = await supabase
        .from('im_japan_registrations')
        .select(`*, profiles!inner(full_name, nik, phone)`)
        .eq('status', 'PENDING')
        .order('created_at', { ascending: false })
      if (data) dataTab2 = data
    } catch (e) { }
  }

  // -- TAB 3: PELAPORAN PERIODIK 6 BULAN (LPK) --
  if (activeTab === 'lpk_reports') {
    try {
      const { data } = await supabase
        .from('lpk_reports')
        .select(`*, profiles!inner(company_name, phone)`) // Assuming user_id join to profiles
        .eq('status', 'SUBMITTED')
        .order('created_at', { ascending: false })
      if (data) dataTab3 = data
    } catch (e) { }
  }

  // -- TAB 4: SURAT PENCATATAN PERJANJIAN PEMAGANGAN --
  if (activeTab === 'magang_permits') {
    try {
      const { data } = await supabase
        .from('magang_permits')
        .select(`*, profiles!inner(company_name, nib, phone)`)
        .eq('status', 'PENDING')
        .order('created_at', { ascending: false })
      if (data) dataTab4 = data
    } catch (e) { }
  }

  // -- TAB 5: MANAJEMEN PELATIHAN --
  if (activeTab === 'manajemen_pelatihan') {
    const { data } = await supabase.from('blk_trainings').select('*').order('created_at', { ascending: false })
    if (data) dataTab5 = data
  }

  // -- TAB 6: PESERTA PELATIHAN --
  if (activeTab === 'peserta_pelatihan') {
    const { data } = await supabase.from('training_registrations').select('*, profiles(*), blk_trainings(title)').order('created_at', { ascending: false })
    if (data) dataTab6 = data
  }

  // -- TAB 7: MANAJEMEN USER (ADVANCED) --
  // Pagination & Search params
  const pPage = (params as any).page ? parseInt((params as any).page) : 1
  const pQuery = (params as any).q || ''
  const ITEMS_PER_PAGE = 10

  let totalUserCount = 0
  let totalUserPages = 0

  if (activeTab === 'manajemen_user') {
    // 1. Base Query
    let query = supabase.from('profiles').select('*', { count: 'exact' }).eq('role', 'PENCAKER')

    // 2. Search Filter
    if (pQuery) {
      query = query.or(`full_name.ilike.%${pQuery}%,nik.ilike.%${pQuery}%`)
    }

    // 3. Pagination
    const from = (pPage - 1) * ITEMS_PER_PAGE
    const to = from + ITEMS_PER_PAGE - 1

    const { data, count } = await query.range(from, to).order('created_at', { ascending: false })

    if (data) {
      dataTab7 = data
      totalUserCount = count || 0
      totalUserPages = Math.ceil(totalUserCount / ITEMS_PER_PAGE)
    }
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
            className={`shrink-0 px-4 py-2 rounded-t-lg text-sm font-bold flex items-center gap-2 transition-colors ${activeTab === 'verifikasi_akun' ? 'bg-white border border-b-0 text-blue-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}>
            <Users size={16} /> Verifikasi Pelatihan BLK (Profil)
          </Link>
          <Link href="/dashboard/dinas?tab=im_japan"
            className={`shrink-0 px-4 py-2 rounded-t-lg text-sm font-bold flex items-center gap-2 transition-colors ${activeTab === 'im_japan' ? 'bg-white border border-b-0 text-blue-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}>
            <ClipboardList size={16} /> Program IM Japan
          </Link>
          <Link href="/dashboard/dinas?tab=lpk_reports"
            className={`shrink-0 px-4 py-2 rounded-t-lg text-sm font-bold flex items-center gap-2 transition-colors ${activeTab === 'lpk_reports' ? 'bg-white border border-b-0 text-blue-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}>
            <FileText size={16} /> Laporan Masuk (LPK)
          </Link>
          <Link href="/dashboard/dinas?tab=magang_permits"
            className={`shrink-0 px-4 py-2 rounded-t-lg text-sm font-bold flex items-center gap-2 transition-colors ${activeTab === 'magang_permits' ? 'bg-white border border-b-0 text-blue-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}>
            <Building size={16} /> Perjanjian Pemagangan
          </Link>
          <Link href="/dashboard/dinas?tab=manajemen_pelatihan"
            className={`shrink-0 px-4 py-2 rounded-t-lg text-sm font-bold flex items-center gap-2 transition-colors ${activeTab === 'manajemen_pelatihan' ? 'bg-white border border-b-0 text-blue-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}>
            <ClipboardList size={16} /> Data Pelatihan BLK
          </Link>
          <Link href="/dashboard/dinas?tab=peserta_pelatihan"
            className={`shrink-0 px-4 py-2 rounded-t-lg text-sm font-bold flex items-center gap-2 transition-colors ${activeTab === 'peserta_pelatihan' ? 'bg-white border border-b-0 text-blue-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}>
            <Users size={16} /> Data Peserta
          </Link>
          <Link href="/dashboard/dinas?tab=manajemen_user"
            className={`shrink-0 px-4 py-2 rounded-t-lg text-sm font-bold flex items-center gap-2 transition-colors ${activeTab === 'manajemen_user' ? 'bg-white border border-b-0 text-blue-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}>
            <Users size={16} /> Master Pencaker
          </Link>
        </div>

        {/* Isi Konten */}
        <div className="bg-white rounded-b-xl rounded-r-xl shadow-sm border p-6 min-h-[400px]">

          {/* TAB 1: VERIFIKASI PROFILE (GATE BLK) */}
          {activeTab === 'verifikasi_akun' && (
            <div>
              <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                <AlertCircle size={18} className="text-orange-500" /> Validasi Data Pencaker (Gate Pelatihan)
              </h3>
              {dataTab1.length === 0 ? <p className="text-gray-400 text-center py-10">Tidak ada antrian verifikasi profil.</p> :
                <VerificationTable users={dataTab1} />
              }
            </div>
          )}

          {/* TAB 2: IM JAPAN */}
          {activeTab === 'im_japan' && (
            <div>
              <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                <Users size={18} className="text-blue-500" /> Pelamar IM Japan (Verifikasi)
              </h3>
              {dataTab2.length === 0 ? <p className="text-gray-400 text-center py-10">Tidak ada pendaftaran IM Japan baru.</p> :
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left border rounded-lg">
                    <thead className="bg-gray-100 text-xs font-bold uppercase text-gray-700">
                      <tr>
                        <th className="px-4 py-3">Pelamar</th>
                        <th className="px-4 py-3">Batch</th>
                        <th className="px-4 py-3">Dokumen</th>
                        <th className="px-4 py-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dataTab2.map((item: any) => (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="font-bold">{item.profiles?.full_name}</div>
                            <div className="text-xs text-gray-500">{item.profiles?.nik}</div>
                          </td>
                          <td className="px-4 py-3">{item.batch || '-'}</td>
                          <td className="px-4 py-3">
                            {item.document_path ?
                              <a href={item.document_path} target="_blank" className="text-blue-600 underline text-xs">Lihat Berkas</a>
                              : <span className="text-red-500 text-xs">Tidak ada</span>}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <AdminActionButtons
                              id={item.id}
                              actionFn={verifyImJapanAction}
                              idName="regId"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              }
            </div>
          )}

          {/* TAB 3: LPK REPORTS */}
          {activeTab === 'lpk_reports' && (
            <div>
              <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                <FileText size={18} className="text-green-500" /> Laporan Periodik LPK Masuk
              </h3>
              {dataTab3.length === 0 ? <p className="text-gray-400 text-center py-10">Tidak ada laporan baru.</p> :
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left border rounded-lg">
                    <thead className="bg-gray-100 text-xs font-bold uppercase text-gray-700">
                      <tr>
                        <th className="px-4 py-3">LPK</th>
                        <th className="px-4 py-3">Periode</th>
                        <th className="px-4 py-3">Kontak</th>
                        <th className="px-4 py-3 text-center">File</th>
                        <th className="px-4 py-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dataTab3.map((item: any) => (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="font-bold">{item.nama_lpk}</div>
                            <div className="text-xs text-gray-500">Reg: {item.no_reg}</div>
                          </td>
                          <td className="px-4 py-3">{item.semester} {item.tahun}</td>
                          <td className="px-4 py-3 text-xs">{item.profiles?.phone}</td>
                          <td className="px-4 py-3 text-center">
                            <Link href={`/api/generate-word/lpk-report?id=${item.id}`} target="_blank" className="text-green-600 text-xs font-bold border border-green-200 px-2 py-1 rounded hover:bg-green-50 flex items-center justify-center gap-1">
                              <Download size={12} /> Word
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <AdminActionButtons
                              id={item.id}
                              extraId={item.user_id}
                              actionFn={verifyLpkReportAction}
                              idName="reportId"
                              extraIdName="userId"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              }
            </div>
          )}

          {/* TAB 4: MAGANG PERMITS */}
          {activeTab === 'magang_permits' && (
            <div>
              <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                <Building size={18} className="text-purple-500" /> Permohonan Perjanjian Pemagangan
              </h3>
              {dataTab4.length === 0 ? <p className="text-gray-400 text-center py-10">Tidak ada permohonan baru.</p> :
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left border rounded-lg">
                    {/* ... (Existing Table) ... */}
                    <thead className="bg-gray-100 text-xs font-bold uppercase text-gray-700">
                      <tr>
                        <th className="px-4 py-3">Perusahaan</th>
                        <th className="px-4 py-3">Jadwal</th>
                        <th className="px-4 py-3">Peserta</th>
                        <th className="px-4 py-3 text-center">Dokumen</th>
                        <th className="px-4 py-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dataTab4.map((item: any) => (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="font-bold">{item.profiles?.company_name}</div>
                            <div className="text-xs text-gray-500">NIB: {item.profiles?.nib}</div>
                          </td>
                          <td className="px-4 py-3 text-xs">
                            {item.start_date} s/d {item.end_date}
                          </td>
                          <td className="px-4 py-3 text-center">{item.participant_count}</td>
                          <td className="px-4 py-3 text-center">
                            {item.document_path ? <a href={item.document_path} target="_blank" className="text-blue-600 underline text-xs">Cek Surat</a> : '-'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <AdminActionButtons
                              id={item.id}
                              actionFn={verifyMagangPermitAction}
                              idName="permitId"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              }
            </div>
          )}

          {/* TAB 5: MANAJEMEN PELATIHAN */}
          {activeTab === 'manajemen_pelatihan' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                  <ClipboardList size={18} className="text-blue-600" /> Manajemen Pelatihan BLK
                </h3>
                {/* Add Button Trigger (Needs Client Component really, but using Details for MVP hack) */}
                <details className="relative">
                  <summary className="list-none bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm cursor-pointer hover:bg-blue-700">+ Tambah Pelatihan</summary>
                  <div className="absolute right-0 top-12 w-96 bg-white shadow-xl border rounded-xl p-6 z-50">
                    <h4 className="font-bold mb-4">Tambah Pelatihan Baru</h4>
                    <form action={async (fd) => { 'use server'; const { createTrainingAction } = await import('@/actions/dinas'); await createTrainingAction(fd) }}>
                      <div className="space-y-3">
                        <input name="title" placeholder="Judul Pelatihan" className="w-full border p-2 rounded text-sm" required />
                        <input name="provider" placeholder="Penyelenggara (mis: UPTD BLK)" className="w-full border p-2 rounded text-sm" required />
                        <input name="category" placeholder="Kategori (mis: Las, IT)" className="w-full border p-2 rounded text-sm" required />
                        <textarea name="description" placeholder="Deskripsi Singkat" className="w-full border p-2 rounded text-sm" required></textarea>
                        <div className="grid grid-cols-2 gap-2">
                          <input type="number" name="quota" placeholder="Kuota" className="border p-2 rounded text-sm" required />
                          <input type="text" name="certification" placeholder="Sertifikasi" className="border p-2 rounded text-sm" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input type="number" name="min_age" placeholder="Min Usia (17)" className="border p-2 rounded text-sm" />
                          <input type="number" name="max_age" placeholder="Max Usia (60)" className="border p-2 rounded text-sm" />
                        </div>
                        <textarea name="requirements" placeholder="Persyaratan (pisahkan baris)" className="w-full border p-2 rounded text-sm h-24"></textarea>
                        <button className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700">Simpan Pelatihan</button>
                      </div>
                    </form>
                  </div>
                </details>
              </div>

              <TrainingList trainings={dataTab5} />
            </div>
          )}

          {/* TAB 6: PESERTA PELATIHAN */}
          {activeTab === 'peserta_pelatihan' && (
            <div>
              <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                <Users size={18} className="text-purple-500" /> Monitoring Peserta
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border rounded-lg">
                  <thead className="bg-gray-100 text-xs font-bold uppercase text-gray-700">
                    <tr>
                      <th className="px-4 py-3">Nama Peserta</th>
                      <th className="px-4 py-3">Pelatihan</th>
                      <th className="px-4 py-3">Tanggal Daftar</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataTab6.map((item: any) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-bold">{item.profiles?.full_name}</td>
                        <td className="px-4 py-3">{item.blk_trainings?.title}</td>
                        <td className="px-4 py-3 text-xs">{new Date(item.created_at).toLocaleDateString('id-ID')}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.status === 'DITERIMA' ? 'bg-green-100 text-green-600' : item.status === 'PENDING' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {item.status !== 'DITOLAK' && (
                            <details className="relative inline-block text-left">
                              <summary className="text-red-600 font-bold text-xs cursor-pointer hover:underline list-none">Keluarkan</summary>
                              <div className="absolute right-0 top-6 w-64 bg-white shadow-xl border rounded p-3 z-20">
                                <form action={async (fd) => { 'use server'; const { kickParticipantAction } = await import('@/actions/dinas'); await kickParticipantAction(fd) }}>
                                  <input type="hidden" name="regId" value={item.id} />
                                  <p className="text-xs font-bold mb-2 text-left">Alasan dikeluarkan:</p>
                                  <textarea name="reason" className="w-full border text-xs p-1 rounded mb-2" required></textarea>
                                  <button className="w-full bg-red-600 text-white text-xs font-bold py-1 rounded">Konfirmasi</button>
                                </form>
                              </div>
                            </details>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: MANAJEMEN USER */}
          {activeTab === 'manajemen_user' && (
            <UserManagement
              users={dataTab7}
              currentPage={pPage}
              totalPages={totalUserPages}
              totalCount={totalUserCount}
            />
          )}

        </div>
      </div>
    </div>
  )
}

// Replaces the local definition and usage
function EmptyPlaceholder() { return null } // Just to be safe if anything weird happens during replace
