'use client'

import { Undo2 } from 'lucide-react'
import { unarchiveTrainingAction } from '@/actions/dinas'
import { SwalAlert, SwalConfirm, SwalToast } from '@/utils/swal'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RestoreTrainingButton({ id, title }: { id: string, title: string }) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleRestore = async () => {
        const result = await SwalConfirm.fire({
            title: 'Kembalikan Pelatihan?',
            text: `Pelatihan "${title}" akan dikembalikan ke daftar aktif (Status: OPEN).`,
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
