'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Eye, Trash2, X } from 'lucide-react'
import { verifyImJapanAction, deleteImJapanHistoryAction } from '@/actions/dinas'
import Link from 'next/link'

export default function ImJapanTable({ data, viewOnly = false }: { data: any[], viewOnly?: boolean }) {
    const router = useRouter()
    const [selectedItem, setSelectedItem] = useState<any>(null)
    const [isRejectMode, setIsRejectMode] = useState(false)
    const [isConfirmMode, setIsConfirmMode] = useState(false)
    const [rejectReason, setRejectReason] = useState('')
    const [loading, setLoading] = useState(false)

    // Open Accept Modal
    const openConfirmAccept = (item: any) => {
        setSelectedItem(item)
        setIsConfirmMode(true)
        setIsRejectMode(false)
    }

    // Open Reject Modal
    const openRejectForm = (item: any) => {
        setSelectedItem(item)
        setIsRejectMode(true)
        setIsConfirmMode(false)
        setRejectReason('')
    }

    // Execute Action
    const executeVerify = async (action: 'approve' | 'reject') => {
        if (!selectedItem) return
        setLoading(true)

        const formData = new FormData()
        formData.append('regId', selectedItem.id)
        formData.append('action', action)
        formData.append('reason', rejectReason)

        try {
            await verifyImJapanAction(formData)

            setLoading(false)
            setSelectedItem(null)
            setIsConfirmMode(false)
            setIsRejectMode(false)
            router.refresh()
        } catch (e: any) {
            alert(e.message)
            setLoading(false)
        }
    }

    return (
        <>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border rounded-lg">
                    <thead className="bg-gray-100 text-xs font-bold uppercase text-gray-700">
                        <tr>
                            <th className="px-4 py-3">Pelamar</th>
                            <th className="px-4 py-3">Batch</th>
                            <th className="px-4 py-3">Dokumen</th>
                            <th className="px-4 py-3 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item: any) => (
                            <tr key={item.id} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-3">
                                    <div className="font-bold">{item.profiles?.full_name}</div>
                                    <div className="text-xs text-gray-500">{item.profiles?.nik}</div>
                                </td>
                                <td className="px-4 py-3">{item.batch || '-'}</td>
                                <td className="px-4 py-3">
                                    <span className="text-xs text-gray-500">
                                        {item.documents ? Object.keys(item.documents).length : 0} Dokumen
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-center gap-2">
                                        {/* 1. LIHAT DATA (Blue) */}
                                        <Link
                                            href={`/dashboard/dinas/im-japan/${item.id}`}
                                            className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-blue-700 flex items-center gap-1 shadow-sm transition"
                                        >
                                            <Eye size={14} /> Lihat Data
                                        </Link>

                                        {!viewOnly ? (
                                            <>
                                                {/* 2. TERIMA (Green) */}
                                                <button
                                                    onClick={() => openConfirmAccept(item)}
                                                    className="bg-green-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-green-700 flex items-center gap-1 shadow-sm transition"
                                                    title="Terima"
                                                >
                                                    <CheckCircle size={14} />
                                                </button>

                                                {/* 3. TOLAK (Red) */}
                                                <button
                                                    onClick={() => openRejectForm(item)}
                                                    className="bg-red-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-red-700 flex items-center gap-1 shadow-sm transition"
                                                    title="Tolak"
                                                >
                                                    <XCircle size={14} />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                {/* Trash for History */}
                                                <form action={deleteImJapanHistoryAction}>
                                                    <input type="hidden" name="regId" value={item.id} />
                                                    <button className="text-gray-400 hover:text-red-600 p-1.5 transition ml-2" title="Hapus Riwayat">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </form>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODALS */}
            {selectedItem && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
                        {/* Header */}
                        <div className="bg-gray-100 px-6 py-4 flex justify-between items-center border-b">
                            <h3 className="font-bold text-gray-800">
                                {isConfirmMode ? 'Verifikasi Penerimaan' : 'Tolak Permohonan'}
                            </h3>
                            <button onClick={() => setSelectedItem(null)} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
                        </div>

                        <div className="p-6">
                            {/* CONFIRM ACCEPT */}
                            {isConfirmMode && (
                                <div className="text-center">
                                    <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="text-green-600 w-8 h-8" />
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-800 mb-2">Terima Permohonan?</h4>
                                    <p className="text-sm text-gray-600 mb-6">
                                        Pastikan data <strong>{selectedItem.profiles?.full_name}</strong> sudah lengkap dan valid.
                                    </p>
                                    <div className="flex justify-center gap-3">
                                        <button onClick={() => setIsConfirmMode(false)} className="px-4 py-2 border rounded-lg text-gray-600 font-bold text-sm hover:bg-gray-50">Batal</button>
                                        <button onClick={() => executeVerify('approve')} disabled={loading} className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700">
                                            {loading ? '...' : 'Ya, Terima'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* REJECT FORM */}
                            {isRejectMode && (
                                <div>
                                    <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4 text-xs text-red-700">
                                        Berikan alasan penolakan yang jelas untuk peserta.
                                    </div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Alasan Penolakan:</label>
                                    <textarea
                                        className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none h-32"
                                        placeholder="Contoh: Dokumen KTP tidak terbaca..."
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                    ></textarea>
                                    <div className="flex justify-end gap-3 mt-6">
                                        <button onClick={() => setIsRejectMode(false)} className="px-4 py-2 border rounded-lg text-gray-600 font-bold text-sm hover:bg-gray-50">Batal</button>
                                        <button onClick={() => executeVerify('reject')} disabled={loading || !rejectReason} className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700">
                                            {loading ? '...' : 'Tolak'}
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
