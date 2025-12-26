'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Eye, FileText, X, Trash2 } from 'lucide-react'
import { verifyProfileAction, deleteRegistrationHistoryAction } from '@/actions/dinas'
import Link from 'next/link'

export default function VerificationTable({ users, viewOnly = false }: { users: any[], viewOnly?: boolean }) {
   const router = useRouter()
   // State untuk Modal Confirm/Reject (masih dipakai untuk aksi cepat)
   const [selectedUser, setSelectedUser] = useState<any>(null)
   const [isRejectMode, setIsRejectMode] = useState(false)
   const [isConfirmMode, setIsConfirmMode] = useState(false)
   const [isDeleteMode, setIsDeleteMode] = useState(false)
   const [loading, setLoading] = useState(false)
   const [rejectReason, setRejectReason] = useState('')

   // Buka Modal Hapus (Untuk Riwayat)
   const openDeleteConfirm = (user: any) => {
      setSelectedUser(user)
      setIsDeleteMode(true)
      setIsConfirmMode(false)
      setIsRejectMode(false)
   }

   // Eksekusi Hapus Riwayat
   const executeDelete = async () => {
      if (!selectedUser) return
      setLoading(true)

      const formData = new FormData()
      formData.append('regId', selectedUser.training_reg_id)

      const res = await deleteRegistrationHistoryAction(formData) as any

      if (res?.error) {
         alert(res.error)
         setLoading(false)
         return
      }

      setLoading(false)
      setSelectedUser(null)
      setIsDeleteMode(false)
      router.refresh()
   }

   // Eksekusi Verifikasi (Approve/Reject)
   const executeVerify = async (action: 'approve' | 'reject') => {
      if (!selectedUser && !rejectReason && action === 'reject') return
      setLoading(true)

      const formData = new FormData()
      // Note: verifyProfileAction expects 'regId' but VerificationTable uses 'training_reg_id' from the user object
      formData.append('regId', selectedUser.training_reg_id)
      formData.append('action', action)
      formData.append('reason', rejectReason)

      try {
         await verifyProfileAction(formData)
         setLoading(false)
         setSelectedUser(null)
         setIsConfirmMode(false)
         setIsRejectMode(false)
         setRejectReason('')
         router.refresh()
      } catch (e: any) {
         alert(e.message || "Gagal memproses verifikasi")
         setLoading(false)
      }
   }

   // Helper Hitung Umur
   const calculateAge = (dobString: string) => {
      if (!dobString) return '-'
      const today = new Date()
      const birthDate = new Date(dobString)
      let age = today.getFullYear() - birthDate.getFullYear()
      const m = today.getMonth() - birthDate.getMonth()
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
         age--
      }
      return age
   }

   return (
      <>
         {/* TABEL DATA */}
         <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
               <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                  <tr>
                     <th className="px-6 py-3">Nama & NIK</th>
                     <th className="px-6 py-3">Tanggal Daftar</th>
                     <th className="px-6 py-3">Batas Daftar</th>
                     <th className="px-6 py-3">Nama Pelatihan</th>
                     <th className="px-6 py-3">Mulai</th>
                     <th className="px-6 py-3">Selesai</th>
                     <th className="px-6 py-3 text-center">Status</th>
                     <th className="px-6 py-3 text-center">Aksi</th>
                     {viewOnly && <th className="px-6 py-3 text-center">Hapus</th>}
                  </tr>
               </thead>
               <tbody>
                  {users.length === 0 ? (
                     <tr><td colSpan={viewOnly ? 9 : 8} className="text-center py-8 text-gray-500 italic">Tidak ada report history.</td></tr>
                  ) : (
                     users.map((u) => (
                        <tr key={u.id} className="bg-white border-b hover:bg-gray-50">
                           <td className="px-6 py-4">
                              <div className="font-bold text-gray-900">{u.full_name}</div>
                              <div className="text-xs text-gray-500">NIK: {u.nik}</div>
                           </td>
                           <td className="px-6 py-4 text-xs text-gray-500 font-medium">
                              {new Date(u.created_at).toLocaleDateString('id-ID')}
                           </td>
                           <td className="px-6 py-4 text-xs">
                              {u.registration_end ? (
                                 <span className="text-red-500 font-bold bg-red-50 px-2 py-1 rounded">
                                    {new Date(u.registration_end).toLocaleDateString('id-ID')}
                                 </span>
                              ) : (
                                 <span className="text-gray-400">-</span>
                              )}
                           </td>
                           <td className="px-6 py-4 text-xs font-bold text-blue-600">
                              {u.training_title}
                           </td>
                           <td className="px-6 py-4 text-xs">
                              {u.training_start_date ? new Date(u.training_start_date).toLocaleDateString('id-ID') : '-'}
                           </td>
                           <td className="px-6 py-4 text-xs">
                              {u.training_end_date ? new Date(u.training_end_date).toLocaleDateString('id-ID') : '-'}
                           </td>
                           <td className="px-6 py-4 text-center">
                              {/* STATUS BADGE */}
                              {u.status === 'PENDING' && (
                                 <span className="px-2 py-1 bg-orange-100 text-orange-700 text-[10px] font-bold uppercase rounded border border-orange-200 whitespace-nowrap">
                                    Menunggu
                                 </span>
                              )}
                              {u.status === 'DITERIMA' && (
                                 <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded border border-green-200 whitespace-nowrap">
                                    Sedang Pelatihan
                                 </span>
                              )}
                              {u.status === 'SELESAI' && (
                                 <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase rounded border border-gray-200 whitespace-nowrap">
                                    Selesai
                                 </span>
                              )}
                              {u.status === 'DITOLAK' && (
                                 <span className="px-2 py-1 bg-red-100 text-red-600 text-[10px] font-bold uppercase rounded border border-red-200 whitespace-nowrap">
                                    Ditolak
                                 </span>
                              )}
                           </td>
                           <td className="px-6 py-4 text-center">
                              <Link
                                 href={`/dashboard/dinas/verifikasi-pencaker/${u.training_reg_id}`}
                                 className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-blue-700 flex items-center justify-center gap-1 mx-auto shadow-sm transition w-fit"
                              >
                                 <FileText size={12} /> {viewOnly ? 'Detail' : 'Verifikasi'}
                              </Link>
                           </td>
                           {viewOnly && (
                              <td className="px-6 py-4 text-center">
                                 <button
                                    onClick={() => openDeleteConfirm(u)}
                                    className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition mx-auto"
                                    title="Hapus Riwayat"
                                 >
                                    <Trash2 size={16} />
                                 </button>
                              </td>
                           )}
                        </tr>
                     ))
                  )}
               </tbody>
            </table>
         </div>

         {/* --- MODAL AREA (Only for Quick Actions now) --- */}
         {selectedUser && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
               <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">

                  {/* Header Modal */}
                  <div className="bg-gray-100 px-6 py-4 flex justify-between items-center border-b">
                     <h3 className="font-bold text-gray-800">
                        {isConfirmMode ? 'Konfirmasi Verifikasi' : isDeleteMode ? 'Hapus Riwayat' : 'Tolak Verifikasi'}
                     </h3>
                     <button onClick={() => setSelectedUser(null)} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
                  </div>

                  {/* Isi Modal */}
                  <div className="p-6">
                     {/* 2. MODE KONFIRMASI TERIMA */}
                     {isConfirmMode && (
                        <div className="text-center">
                           <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                              <CheckCircle className="text-green-600 w-8 h-8" />
                           </div>
                           <h4 className="text-lg font-bold text-gray-800 mb-2">Terima Data Pencaker?</h4>
                           <p className="text-sm text-gray-600 mb-6">Pastikan semua data dan berkas sudah diperiksa dan valid. Status akun akan berubah menjadi <strong>VERIFIED</strong>.</p>
                           <div className="flex justify-center gap-3">
                              <button onClick={() => setIsConfirmMode(false)} className="px-4 py-2 border rounded-lg text-gray-600 font-bold text-sm hover:bg-gray-50">Batal</button>
                              <button onClick={() => executeVerify('approve')} disabled={loading} className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700">
                                 {loading ? 'Memproses...' : 'Ya, Terima'}
                              </button>
                           </div>
                        </div>
                     )}

                     {/* 3. MODE TOLAK + PESAN */}
                     {isRejectMode && (
                        <div>
                           <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4 text-xs text-red-700">
                              Pesan ini akan muncul di dashboard pencaker.
                           </div>
                           <label className="block text-sm font-bold text-gray-700 mb-2">Alasan Penolakan:</label>
                           <textarea
                              className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none h-32"
                              placeholder="Contoh: Scan KTP buram, Mohon upload ulang dengan pencahayaan yang baik."
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                           ></textarea>
                           <div className="text-xs text-gray-500 mt-2">
                              *Sistem otomatis menambahkan kalimat: <em>"Silakan klik tombol daftar lagi jika data sudah direvisi."</em>
                           </div>
                           <div className="flex justify-end gap-3 mt-6">
                              <button onClick={() => setIsRejectMode(false)} className="px-4 py-2 border rounded-lg text-gray-600 font-bold text-sm hover:bg-gray-50">Batal</button>
                              <button onClick={() => executeVerify('reject')} disabled={loading || !rejectReason} className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 disabled:bg-gray-300">
                                 {loading ? 'Mengirim...' : 'Kirim Penolakan'}
                              </button>
                           </div>
                        </div>
                     )}

                     {/* 4. MODE HAPUS RIWAYAT */}
                     {isDeleteMode && (
                        <div className="text-center">
                           <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Trash2 className="text-red-600 w-8 h-8" />
                           </div>
                           <h4 className="text-lg font-bold text-gray-800 mb-2">Hapus Riwayat?</h4>
                           <p className="text-sm text-gray-600 mb-6">
                              Data riwayat pendaftaran ini akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
                           </p>
                           <div className="flex justify-center gap-3">
                              <button onClick={() => setIsDeleteMode(false)} className="px-4 py-2 border rounded-lg text-gray-600 font-bold text-sm hover:bg-gray-50">Batal</button>
                              <button onClick={executeDelete} disabled={loading} className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700">
                                 {loading ? 'Menghapus...' : 'Ya, Hapus'}
                              </button>
                           </div>
                        </div>
                     )}

                  </div>
               </div>
            </div>
         )}
      </>
   )
}