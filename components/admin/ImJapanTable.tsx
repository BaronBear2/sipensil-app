'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Eye, Trash2 } from 'lucide-react'
import { verifyImJapanAction, deleteImJapanHistoryAction } from '@/actions/dinas'
import Link from 'next/link'
import { SwalAlert, SwalConfirm, SwalToast } from '@/utils/swal'
import Swal from 'sweetalert2'

export default function ImJapanTable({ data, viewOnly = false }: { data: any[], viewOnly?: boolean }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    // Execute Action
    const executeVerify = async (item: any, action: 'approve' | 'reject') => {
        let reason = ''

        if (action === 'approve') {
            const confirm = await SwalConfirm.fire({
                title: 'Terima Permohonan?',
                text: `Pastikan data ${item.profiles?.full_name} sudah lengkap dan valid.`,
                confirmButtonText: 'Ya, Terima'
            })
            if (!confirm.isConfirmed) return
        }

        if (action === 'reject') {
            const { value: text, isDismissed } = await Swal.fire({
                title: 'Tolak Permohonan',
                input: 'textarea',
                inputLabel: 'Alasan Penolakan',
                inputPlaceholder: 'Contoh: Dokumen KTP tidak terbaca...',
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
        formData.append('regId', item.id)
        formData.append('action', action)
        formData.append('reason', reason)

        try {
            await verifyImJapanAction(formData)

            SwalToast.fire({
                icon: 'success',
                title: action === 'approve' ? 'Permohonan Diterima' : 'Permohonan Ditolak'
            })
            router.refresh()
        } catch (e: any) {
            SwalAlert.fire({ icon: 'error', title: 'Gagal Memproses', text: e.message })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="overflow-x-auto w-full">
            <table className="w-full text-sm text-left border rounded-lg min-w-[600px]">
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
                                                onClick={() => executeVerify(item, 'approve')}
                                                className="bg-green-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-green-700 flex items-center gap-1 shadow-sm transition"
                                                title="Terima"
                                                disabled={loading}
                                            >
                                                <CheckCircle size={14} />
                                            </button>

                                            {/* 3. TOLAK (Red) */}
                                            <button
                                                onClick={() => executeVerify(item, 'reject')}
                                                className="bg-red-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-red-700 flex items-center gap-1 shadow-sm transition"
                                                title="Tolak"
                                                disabled={loading}
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
    )
}
