'use client'

import { CheckCircle, XCircle } from 'lucide-react'
import { deleteTrainingAction, adminUpdateUserAction } from '@/actions/dinas'
import { SwalAlert, SwalConfirm, SwalToast } from '@/utils/swal'
import Swal from 'sweetalert2'

// 1. Tombol Hapus Pelatihan dengan Konfirmasi
export function DeleteTrainingButton({ id }: { id: string }) {
    const handleDelete = async () => {
        const result = await SwalConfirm.fire({
            title: 'Hapus Pelatihan?',
            text: 'Data tidak bisa dikembalikan!',
            confirmButtonText: 'Ya, Hapus',
            confirmButtonColor: '#d33'
        })

        if (!result.isConfirmed) return

        const formData = new FormData()
        formData.append('id', id)
        const res = await deleteTrainingAction(formData)

        if (res?.error) {
            SwalAlert.fire({ icon: 'error', title: 'Gagal', text: res.error })
        } else {
            SwalToast.fire({ icon: 'success', title: 'Pelatihan Dihapus' })
        }
    }

    return (
        <button
            type="button"
            className="text-red-600 text-xs font-bold border border-red-200 px-3 py-1 rounded hover:bg-red-50"
            onClick={handleDelete}
        >
            Hapus
        </button>
    )
}

// 2. Tombol Auto-Verify User dengan Konfirmasi
export function AutoVerifyButton({ userId }: { userId: string }) {
    const handleVerify = async () => {
        const result = await SwalConfirm.fire({
            title: 'Verifikasi User Manual?',
            text: 'Akun ini akan langsung berstatus VALID.',
            icon: 'question'
        })

        if (!result.isConfirmed) return

        const formData = new FormData()
        formData.append('userId', userId)
        await adminUpdateUserAction(formData)
        SwalToast.fire({ icon: 'success', title: 'User Diverifikasi' })
    }

    return (
        <button
            type="button"
            className="text-blue-600 font-bold text-xs border border-blue-200 px-2 py-1 rounded hover:bg-blue-50"
            onClick={handleVerify}
        >
            Auto-Verifikasi
        </button>
    )
}

// 3. Tombol Aksi Admin (Approve/Reject) - Reused
export function AdminActionButtons({ id, actionFn, idName, extraId, extraIdName }: any) {
    const handleApprove = async () => {
        const formData = new FormData()
        formData.append(idName, id)
        if (extraId) formData.append(extraIdName, extraId)
        formData.append('action', 'approve')

        const res = await actionFn(formData)
        if (res?.error) SwalAlert.fire({ icon: 'error', title: 'Gagal', text: res.error })
        else SwalToast.fire({ icon: 'success', title: 'Berhasil Diterima' })
    }

    const handleReject = async () => {
        const { value: reason } = await Swal.fire({
            title: 'Tolak Pengajuan',
            input: 'text',
            inputPlaceholder: 'Alasan penolakan...',
            showCancelButton: true
        })

        if (!reason) return

        const formData = new FormData()
        formData.append(idName, id)
        if (extraId) formData.append(extraIdName, extraId)
        formData.append('action', 'reject')
        formData.append('reason', reason)

        const res = await actionFn(formData)
        if (res?.error) SwalAlert.fire({ icon: 'error', title: 'Gagal', text: res.error })
        else SwalToast.fire({ icon: 'success', title: 'Berhasil Ditolak' })
    }

    return (
        <div className="flex justify-center gap-2">
            <button onClick={handleApprove} className="bg-green-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-green-700 flex items-center gap-1 shadow-sm">
                <CheckCircle size={14} /> Terima
            </button>

            <button onClick={handleReject} className="bg-red-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-red-700 flex items-center gap-1 shadow-sm">
                <XCircle size={14} />
            </button>
        </div>
    )
}
