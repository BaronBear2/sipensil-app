'use client'

import { Undo2 } from 'lucide-react'
import { unarchiveTrainingAction } from '@/actions/dinas'
import { SwalAlert, SwalConfirm, SwalToast } from '@/utils/swal'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RestoreTrainingButton({ id, title, startDate, endDate }: { id: string, title: string, startDate?: string, endDate?: string }) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleRestore = async () => {
        // 1. Validation: Check if training is expired
        if (endDate) {
            const end = new Date(endDate)
            const now = new Date()
            // Reset time to compare dates only effectively, or just compare timestamps
            if (end < now) {
                await SwalAlert.fire({
                    icon: 'warning',
                    title: 'Tidak Dapat Mengembalikan',
                    text: `Pelatihan ini sudah berakhir pada ${end.toLocaleDateString('id-ID')}. Harap ubah tanggal berakhir terlebih dahulu melalui tombol Edit.`
                })
                return
            }
        }

        const dateRangeText = startDate && endDate
            ? `Periode: ${new Date(startDate).toLocaleDateString('id-ID')} s/d ${new Date(endDate).toLocaleDateString('id-ID')}`
            : 'Periode tidak ditentukan'

        const result = await SwalConfirm.fire({
            title: 'Kembalikan Pelatihan?',
            html: `Pelatihan "<b>${title}</b>" akan dikembalikan ke daftar aktif.<br/><br/><span class="text-sm text-gray-500">${dateRangeText}</span>`,
            confirmButtonText: 'Ya, Kembalikan',
            icon: 'question'
        })

        if (!result.isConfirmed) return

        setIsLoading(true)
        const formData = new FormData()
        formData.append('id', id)

        try {
            const res = await unarchiveTrainingAction(formData)
            if (res?.error) {
                SwalAlert.fire({ icon: 'error', title: 'Gagal', text: res.error })
            } else {
                SwalToast.fire({ icon: 'success', title: 'Pelatihan Dikembalikan' })
                router.refresh()
            }
        } catch (e: any) {
            SwalAlert.fire({ icon: 'error', title: 'Error', text: e.message })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <button
            onClick={handleRestore}
            disabled={isLoading}
            className="flex items-center gap-1 px-3 py-1 bg-white border border-blue-200 text-blue-600 rounded-full text-xs font-bold hover:bg-blue-50 transition disabled:opacity-50"
            title="Kembalikan ke Aktif"
        >
            <Undo2 size={14} /> {isLoading ? '...' : 'Kembalikan'}
        </button>
    )
}
