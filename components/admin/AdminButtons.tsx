'use client'

import { CheckCircle, XCircle } from 'lucide-react'
import { deleteTrainingAction, adminUpdateUserAction } from '@/actions/dinas'

// 1. Tombol Hapus Pelatihan dengan Konfirmasi
export function DeleteTrainingButton({ id }: { id: string }) {
    return (
        <form action={async (formData) => {
            const res = await deleteTrainingAction(formData)
            if (res?.error) alert(res.error)
        }}>
            <input type="hidden" name="id" value={id} />
            <button
                type="submit"
                className="text-red-600 text-xs font-bold border border-red-200 px-3 py-1 rounded hover:bg-red-50"
                onClick={(e) => {
                    if (!confirm('Apakah Anda yakin ingin MENGHAPUS pelatihan ini? Data tidak bisa dikembalikan.')) {
                        e.preventDefault()
                    }
                }}
            >
                Hapus
            </button>
        </form>
    )
}

// 2. Tombol Auto-Verify User dengan Konfirmasi
export function AutoVerifyButton({ userId }: { userId: string }) {
    return (
        <form action={async (formData) => {
            await adminUpdateUserAction(formData)
        }}>
            <input type="hidden" name="userId" value={userId} />
            <button
                className="text-blue-600 font-bold text-xs border border-blue-200 px-2 py-1 rounded hover:bg-blue-50"
                onClick={(e) => {
                    if (!confirm('Verifikasi Manual akun ini?')) e.preventDefault()
                }}
            >
                Auto-Verifikasi
            </button>
        </form>
    )
}

// 3. Tombol Aksi Admin (Approve/Reject) - Reused
export function AdminActionButtons({ id, actionFn, idName, extraId, extraIdName }: any) {
    return (
        <div className="flex justify-center gap-2">
            <form action={actionFn}>
                <input type="hidden" name={idName} value={id} />
                {extraId && <input type="hidden" name={extraIdName} value={extraId} />}
                <input type="hidden" name="action" value="approve" />
                <button className="bg-green-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-green-700 flex items-center gap-1 shadow-sm">
                    <CheckCircle size={14} /> Terima
                </button>
            </form>

            <form action={actionFn} className="flex items-center gap-1">
                <input type="hidden" name={idName} value={id} />
                {extraId && <input type="hidden" name={extraIdName} value={extraId} />}
                <input type="hidden" name="action" value="reject" />
                <input name="reason" placeholder="Alasan tolak..." className="border rounded px-2 py-1 text-xs w-24" required />
                <button className="bg-red-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-red-700 flex items-center gap-1 shadow-sm">
                    <XCircle size={14} />
                </button>
            </form>
        </div>
    )
}
