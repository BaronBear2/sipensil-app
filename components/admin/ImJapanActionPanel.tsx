import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle } from 'lucide-react'
import { verifyImJapanAction } from '@/actions/dinas'
import { SwalAlert, SwalConfirm, SwalToast } from '@/utils/swal'
import Swal from 'sweetalert2'

export default function ImJapanActionPanel({ id, status }: { id: string, status: string }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const executeVerify = async (action: 'approve' | 'reject') => {
        let reason = ''

        if (action === 'approve') {
            const confirm = await SwalConfirm.fire({
                title: 'Validasi Permohonan?',
                text: 'Pastikan semua dokumen lengkap dan valid.',
                confirmButtonText: 'Ya, Terima'
            })
            if (!confirm.isConfirmed) return
        }

        if (action === 'reject') {
            const { value: text, isDismissed } = await Swal.fire({
                title: 'Tolak Permohonan',
                input: 'textarea',
                inputLabel: 'Alasan Penolakan',
                inputPlaceholder: 'Contoh: KTP tidak jelas, Surat izin kurang lengkap...',
                showCancelButton: true,
                confirmButtonText: 'Tolak',
                confirmButtonColor: '#d33',
                preConfirm: (text) => {
                    if (!text) Swal.showValidationMessage('Alasan harus diisi')
                    return text
                }
            })

            if (isDismissed || !text) return
            reason = text
        }

        setLoading(true)

        const formData = new FormData()
        formData.append('regId', id)
        formData.append('action', action)
        formData.append('reason', reason)

        try {
            await verifyImJapanAction(formData)

            SwalToast.fire({
                icon: 'success',
                title: action === 'approve' ? 'Permohonan Divalidasi' : 'Permohonan Ditolak'
            })
            router.push('/dashboard/dinas/im-japan') // Go back to list
            router.refresh()
        } catch (e: any) {
            SwalAlert.fire({ icon: 'error', title: 'Gagal', text: e.message || "Gagal memproses." })
        } finally {
            setLoading(false)
        }
    }

    if (status !== 'PENDING') {
        return (
            <div className={`p-6 rounded-xl border ${status === 'VERIFIED' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <h3 className={`font-bold text-center ${status === 'VERIFIED' ? 'text-green-800' : 'text-red-800'}`}>
                    Sudah {status === 'VERIFIED' ? 'Diterima' : 'Ditolak'}
                </h3>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-6">
            <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Aksi Verifikasi</h3>

            <div className="space-y-3">
                <button
                    onClick={() => executeVerify('approve')}
                    disabled={loading}
                    className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                    <CheckCircle size={18} /> Validasi / Terima
                </button>
                <button
                    onClick={() => executeVerify('reject')}
                    disabled={loading}
                    className="w-full py-3 bg-white border border-red-200 text-red-600 rounded-lg font-bold hover:bg-red-50 flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                    <XCircle size={18} /> Tolak / Revisi
                </button>
            </div>
        </div>
    )
}
