'use client'
// Force re-compile

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle } from 'lucide-react'
import { verifyProfileAction } from '@/actions/dinas'
import StatusModal from '@/components/ui/StatusModal'

export default function VerificationActionPanelV2({ user, status }: { user: any, status: string }) {
    const router = useRouter()
    const [isRejectMode, setIsRejectMode] = useState(false)
    const [isConfirmMode, setIsConfirmMode] = useState(false)
    const [rejectReason, setRejectReason] = useState('')
    const [loading, setLoading] = useState(false)
    const [statusModal, setStatusModal] = useState<{
        isOpen: boolean, type: 'success' | 'error', message: string, title?: string
    }>({ isOpen: false, type: 'success', message: '' })

    const executeVerify = async (action: 'approve' | 'reject') => {
        setLoading(true)
        let finalReason = rejectReason
        if (action === 'reject') {
            finalReason += "\n\nSilakan klik tombol daftar lagi jika data sudah direvisi."
        }

        const formData = new FormData()
        formData.append('userId', user.id)
        formData.append('regId', user.training_reg_id)
        formData.append('action', action)
        formData.append('reason', finalReason)

        const res = await verifyProfileAction(formData)

        setLoading(false)

        if (res?.error) {
            setStatusModal({
                isOpen: true,
                type: 'error',
                title: 'Gagal',
                message: res.error
            })
            return
        }

        // Success
        setStatusModal({
            isOpen: true,
            type: 'success',
            title: action === 'approve' ? 'Verifikasi Berhasil' : 'Pencaker Ditolak',
            message: action === 'approve'
                ? 'Data pencaker berhasil diverifikasi. Status pendaftaran diperbarui menjadi DITERIMA.'
                : 'Pendaftaran pencaker telah ditolak.'
        })

        // Close logic handles redirect
    }

    const handleCloseModal = () => {
        setStatusModal(prev => ({ ...prev, isOpen: false }))
        // Request: Redirect to previous page (list)
        router.push('/dashboard/dinas/verifikasi-pencaker')
        router.refresh()
    }

    if (status !== 'PENDING') {
        return (
            <div className={`p-6 rounded-xl border ${status === 'DITERIMA' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <h3 className={`font-bold text-center ${status === 'DITERIMA' ? 'text-green-800' : 'text-red-800'}`}>
                    Sudah {status === 'DITERIMA' ? 'Diverifikasi' : 'Ditolak'}
                </h3>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border p-6">
            <StatusModal
                isOpen={statusModal.isOpen}
                onClose={handleCloseModal}
                type={statusModal.type}
                title={statusModal.title}
                message={statusModal.message}
            />

            <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Aksi Verifikasi</h3>

            {!isConfirmMode && !isRejectMode && (
                <div className="space-y-3">
                    <button
                        onClick={() => setIsConfirmMode(true)}
                        className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 flex items-center justify-center gap-2 transition"
                    >
                        <CheckCircle size={18} /> Validasi / Terima
                    </button>
                    <button
                        onClick={() => setIsRejectMode(true)}
                        className="w-full py-3 bg-white border border-red-200 text-red-600 rounded-lg font-bold hover:bg-red-50 flex items-center justify-center gap-2 transition"
                    >
                        <XCircle size={18} /> Tolak
                    </button>
                </div>
            )}

            {/* CONFIRM APPROVE */}
            {isConfirmMode && (
                <div className="animate-fade-in text-center">
                    <p className="text-sm text-gray-600 mb-4">Pastikan data sudah valid.</p>
                    <div className="flex gap-2">
                        <button onClick={() => setIsConfirmMode(false)} className="flex-1 py-2 border rounded-lg text-sm font-bold text-gray-500">Batal</button>
                        <button onClick={() => executeVerify('approve')} disabled={loading} className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700">
                            {loading ? '...' : 'Ya, Terima'}
                        </button>
                    </div>
                </div>
            )}

            {/* REJECT FORM */}
            {isRejectMode && (
                <div className="animate-fade-in">
                    <label className="text-xs font-bold text-gray-500 mb-2 block">Alasan Penolakan</label>
                    <textarea
                        className="w-full border rounded-lg p-2 text-sm h-24 mb-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Alasan..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                    ></textarea>
                    <div className="flex gap-2">
                        <button onClick={() => setIsRejectMode(false)} className="flex-1 py-2 border rounded-lg text-sm font-bold text-gray-500">Batal</button>
                        <button onClick={() => executeVerify('reject')} disabled={loading || !rejectReason} className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700">
                            {loading ? '...' : 'Tolak'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
