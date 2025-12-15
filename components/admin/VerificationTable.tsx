'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Eye, FileText, X } from 'lucide-react'
import { verifyUserAction } from '@/actions/dinas' // <--- INI BENAR // Kita buat file action terpisah nanti

export default function VerificationTable({ users }: { users: any[] }) {
  // State untuk Modal
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isRejectMode, setIsRejectMode] = useState(false)
  const [isConfirmMode, setIsConfirmMode] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [loading, setLoading] = useState(false)

  // Buka Modal Lihat Data
  const handleView = (user: any) => {
    setSelectedUser(user)
    setIsRejectMode(false)
    setIsConfirmMode(false)
  }

  // Buka Modal Konfirmasi Terima
  const openConfirmAccept = (user: any) => {
    setSelectedUser(user)
    setIsConfirmMode(true)
    setIsRejectMode(false)
  }

  // Buka Modal Tolak
  const openRejectForm = (user: any) => {
    setSelectedUser(user)
    setIsRejectMode(true)
    setIsConfirmMode(false)
    setRejectReason('')
  }

  // Eksekusi Verifikasi
  const executeVerify = async (action: 'approve' | 'reject') => {
    if (!selectedUser) return
    setLoading(true)

    // Append pesan otomatis jika ditolak
    let finalReason = rejectReason
    if (action === 'reject') {
      finalReason += "\n\nSilakan klik tombol daftar lagi jika data sudah direvisi."
    }

    const formData = new FormData()
    formData.append('userId', selectedUser.id)
    formData.append('action', action)
    formData.append('reason', finalReason)

    await verifyUserAction(formData) // Panggil Server Action
    
    setLoading(false)
    setSelectedUser(null) // Tutup modal
    setIsConfirmMode(false)
    setIsRejectMode(false)
    window.location.reload() // Refresh data tabel
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
              <th className="px-6 py-3 text-center">Berkas</th>
              <th className="px-6 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
               <tr><td colSpan={4} className="text-center py-8 text-gray-500 italic">Tidak ada antrian verifikasi.</td></tr>
            ) : (
               users.map((u) => (
                 <tr key={u.id} className="bg-white border-b hover:bg-gray-50">
                   <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{u.full_name}</div>
                      <div className="text-xs text-gray-500">NIK: {u.nik}</div>
                   </td>
                   <td className="px-6 py-4 text-xs text-gray-500">
                      {new Date(u.created_at).toLocaleDateString()}
                   </td>
                   <td className="px-6 py-4 text-center">
                      <button onClick={() => handleView(u)} className="text-blue-600 hover:text-blue-800 text-xs font-bold flex items-center justify-center gap-1 mx-auto border border-blue-200 px-2 py-1 rounded">
                         <Eye size={12}/> Lihat Data
                      </button>
                   </td>
                   <td className="px-6 py-4 flex justify-center gap-2">
                      <button onClick={() => openConfirmAccept(u)} className="bg-green-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-green-700 flex items-center gap-1">
                         <CheckCircle size={14}/> Terima
                      </button>
                      <button onClick={() => openRejectForm(u)} className="bg-red-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-red-700 flex items-center gap-1">
                         <XCircle size={14}/> Tolak
                      </button>
                   </td>
                 </tr>
               ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- MODAL AREA --- */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
              
              {/* Header Modal */}
              <div className="bg-gray-100 px-6 py-4 flex justify-between items-center border-b">
                 <h3 className="font-bold text-gray-800">
                    {isConfirmMode ? 'Konfirmasi Verifikasi' : isRejectMode ? 'Tolak Verifikasi' : 'Detail Pencaker'}
                 </h3>
                 <button onClick={() => setSelectedUser(null)} className="text-gray-500 hover:text-gray-700"><X size={20}/></button>
              </div>

              {/* Isi Modal */}
              <div className="p-6">
                 
                 {/* 1. MODE LIHAT DATA */}
                 {!isConfirmMode && !isRejectMode && (
                    <div className="space-y-4">
                       <div className="grid grid-cols-2 gap-4 text-sm">
                          <div><span className="text-gray-500 block text-xs">Nama Lengkap</span> <span className="font-bold">{selectedUser.full_name}</span></div>
                          <div><span className="text-gray-500 block text-xs">NIK</span> <span className="font-bold">{selectedUser.nik}</span></div>
                          <div><span className="text-gray-500 block text-xs">Tempat Lahir</span> <span>{selectedUser.pob}</span></div>
                          <div><span className="text-gray-500 block text-xs">Tanggal Lahir</span> <span>{selectedUser.dob}</span></div>
                          <div><span className="text-gray-500 block text-xs">Pendidikan</span> <span>{selectedUser.education}</span></div>
                          <div><span className="text-gray-500 block text-xs">No HP</span> <span>{selectedUser.phone}</span></div>
                       </div>
                       <div className="mt-4 border-t pt-4">
                          <h4 className="font-bold text-sm mb-2 flex items-center gap-2"><FileText size={16}/> Berkas Upload</h4>
                          <div className="grid grid-cols-3 gap-2">
                             {/* Simulasi File Preview */}
                             <div className="bg-gray-100 h-24 rounded flex items-center justify-center text-xs text-gray-500 border cursor-pointer hover:bg-gray-200">KTP.jpg</div>
                             <div className="bg-gray-100 h-24 rounded flex items-center justify-center text-xs text-gray-500 border cursor-pointer hover:bg-gray-200">Ijazah.pdf</div>
                             <div className="bg-gray-100 h-24 rounded flex items-center justify-center text-xs text-gray-500 border cursor-pointer hover:bg-gray-200">Foto.jpg</div>
                          </div>
                          <p className="text-[10px] text-blue-600 mt-1 italic">*Klik untuk memperbesar (Fitur Storage menyusul)</p>
                       </div>
                       <div className="flex justify-end gap-2 mt-6">
                          <button onClick={() => openRejectForm(selectedUser)} className="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-bold text-sm">Tolak</button>
                          <button onClick={() => openConfirmAccept(selectedUser)} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm">Terima Data</button>
                       </div>
                    </div>
                 )}

                 {/* 2. MODE KONFIRMASI TERIMA */}
                 {isConfirmMode && (
                    <div className="text-center">
                       <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CheckCircle className="text-green-600 w-8 h-8"/>
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

              </div>
           </div>
        </div>
      )}
    </>
  )
}