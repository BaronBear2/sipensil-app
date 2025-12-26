'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle } from 'lucide-react'
import { verifyImJapanAction } from '@/actions/dinas'

export default function ImJapanActionPanel({ id, status }: { id: string, status: string }) {
    const router = useRouter()
    const [isRejectMode, setIsRejectMode] = useState(false)
    const [isConfirmMode, setIsConfirmMode] = useState(false)
    const [rejectReason, setRejectReason] = useState('')
    const [loading, setLoading] = useState(false)

    const executeVerify = async (action: 'approve' | 'reject') => {
        setLoading(true)

        const formData = new FormData()
        formData.append('regId', id)
        formData.append('action', action)
        formData.append('reason', rejectReason)

        try {
            await verifyImJapanAction(formData)

            setLoading(false)
            setIsConfirmMode(false)
            setIsRejectMode(false)
            router.push('/dashboard/dinas/im-japan') // Go back to list
            router.refresh()
        } catch (e: any) {
            alert(e.message || "Gagal memproses.")
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
                        <XCircle size={18} /> Tolak / Revisi
                    </button>
                </div>
            )}

            {/* CONFIRM APPROVE */}
            {isConfirmMode && (
                <div className="animate-fade-in text-center">
                    <p className="text-sm text-gray-600 mb-4">Pastikan semua dokumen lengkap dan valid.</p>
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
                        placeholder="Contoh: KTP tidak jelas, Surat izin kurang lengkap..."
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
