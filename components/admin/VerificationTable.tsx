import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Trash2 } from 'lucide-react'
import { verifyProfileAction, deleteRegistrationHistoryAction } from '@/actions/dinas'
import Link from 'next/link'
import { SwalAlert, SwalConfirm, SwalToast } from '@/utils/swal'
import Swal from 'sweetalert2'

export default function VerificationTable({ users, viewOnly = false }: { users: any[], viewOnly?: boolean }) {
   const router = useRouter()
   const [loading, setLoading] = useState(false)

   // Eksekusi Hapus Riwayat
   const onDelete = async (user: any) => {
      const result = await SwalConfirm.fire({
         title: 'Hapus Riwayat?',
         text: 'Data riwayat pendaftaran ini akan dihapus permanen.'
      })

      if (!result.isConfirmed) return

      setLoading(true)

      const formData = new FormData()
      formData.append('regId', user.training_reg_id)

      const res = await deleteRegistrationHistoryAction(formData) as any

      if (res?.error) {
         SwalAlert.fire({ icon: 'error', title: 'Gagal Menghapus', text: res.error })
      } else {
         SwalToast.fire({ icon: 'success', title: 'Riwayat berhasil dihapus' })
         router.refresh()
      }
      setLoading(false)
   }

   // Eksekusi Verifikasi (Approve/Reject)
   const onVerify = async (user: any, action: 'approve' | 'reject') => {
      let reason = ''

      if (action === 'approve') {
         const confirm = await SwalConfirm.fire({
            title: 'Terima Data Pencaker?',
            text: 'Pastikan semua data dan berkas sudah diperiksa dan valid. Status akun akan berubah menjadi VERIFIED.',
            confirmButtonText: 'Ya, Terima',
            icon: 'question'
         })
         if (!confirm.isConfirmed) return
      }

      if (action === 'reject') {
         const { value: text, isDismissed } = await Swal.fire({
            title: 'Tolak Verifikasi',
            input: 'textarea',
            inputLabel: 'Alasan Penolakan',
            inputPlaceholder: 'Contoh: Scan KTP buram...',
            inputAttributes: {
               'aria-label': 'reason'
            },
            showCancelButton: true,
            confirmButtonText: 'Kirim Penolakan',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#d33',
            showLoaderOnConfirm: true,
            preConfirm: (text) => {
               if (!text) {
                  Swal.showValidationMessage('Alasan penolakan harus diisi')
               }
               return text
            }
         })

         if (isDismissed || !text) return
         reason = text
      }

      setLoading(true)

      // OPTIMISTIC UPDATE UI (Optional, but good for UX)
      // For now we rely on router.refresh() after action

      const formData = new FormData()
      formData.append('regId', user.training_reg_id)
      formData.append('action', action)
      formData.append('reason', reason)

      try {
         await verifyProfileAction(formData)
         SwalToast.fire({
            icon: 'success',
            title: action === 'approve' ? 'Verifikasi Diterima' : 'Verifikasi Ditolak'
         })
         router.refresh()
      } catch (e: any) {
         SwalAlert.fire({ icon: 'error', title: 'Gagal Memproses', text: e.message })
      } finally {
         setLoading(false)
      }
   }

   return (
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
                           {/* The detail verification page contains Buttons to Approve/Reject. 
                               However, the original code had modal logic here too, implying quick actions were possible?
                               Ah, looking at original code, the 'Verifikasi' button was a Link to `/dashboard/dinas/verifikasi-pencaker/[id]`.
                               Wait, I see `isConfirmMode`, `isRejectMode` etc in the original code but NO buttons in the table calling them?
                               Wait, `executeVerify` was defined but WHERE WAS IT CALLED?
                               
                               Let's look at the original `return` block again.
                               Only `Link` to details and `onClick={() => openDeleteConfirm(u)}` were present in LOOP.
                               The Modals were rendered at the bottom.
                               
                               It seems the original `VerificationTable` MIGHT have been intended to have quick actions, OR I missed where `setIsConfirmMode` was called.
                               Actually, I missed reading some part of the file or the previous grep didn't show it.
                               
                               Re-reading lines 160-166:
                               <Link href=...> Verifikasi </Link>
                               
                               It seems the original file ONLY used the modal for DELETE (lines 169-175).
                               
                               Wait, lines 11-14 define `isRejectMode`, `isConfirmMode`.
                               But they are likely unused or used in a part I didn't see?
                               Ah, the `VerificationTable` might be sharing code with the detail page component? No, this is a table.
                               
                               If I look at `components/admin/VerificationTable.tsx`, I see `executeVerify`.
                               But I don't see any button in the table row that calls `setIsConfirmMode`.
                               The only button is `openDeleteConfirm(u)`.
                               
                               Wait, maybe `VerificationTable` is ALSO used inside the detail page? No, that would be weird.
                               
                               Re-reading the file content provided in Step 475.
                               There are NO buttons in the table rows that trigger `isConfirmMode` or `isRejectMode`.
                               Only `Link` to detail page.
                               AND `openDeleteConfirm` for `viewOnly` mode.
                               
                               So `executeVerify` and the confirm/reject modals might be DEAD CODE in this specific file, OR I am blind.
                               
                               However, I should keep the `onDelete` functionality which IS used.
                               And I'll keep the `onVerify` logic conceptually if I want to add quick actions later, or just remove the dead code to clean up.
                               
                               Let's assume the `Link` takes you to a page where verification happens.
                               So `VerificationTable` only needs `onDelete` (history deletion).
                               
                               Wait, the `Link` goes to `/dashboard/dinas/verifikasi-pencaker/${u.training_reg_id}`.
                               
                               I will remove the Dead Code related to Verification Modals if it's truly not used.
                               The original code had `isConfirmMode` etc. but no setters in the JSX loop.
                               So I will CLEAN UP this component to only handle what it actually renders + Swal for Delete.
                           */}
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
                                 onClick={() => onDelete(u)}
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
   )
}