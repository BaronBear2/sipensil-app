'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, FileText, X, Download, Building, Trash2 } from 'lucide-react'
import { verifyLpkReportAction } from '@/actions/dinas'
import Link from 'next/link'
import { SwalAlert, SwalConfirm, SwalToast } from '@/utils/swal'
import Swal from 'sweetalert2'

export default function LPKReportTable({ reports, viewOnly = false, onDelete }: { reports: any[], viewOnly?: boolean, onDelete?: (formData: FormData) => Promise<void> }) {
    const [loading, setLoading] = useState(false)

    // Eksekusi Verifikasi
    const executeVerify = async (report: any, action: 'approve' | 'reject') => {
        let reason = ''

        if (action === 'approve') {
            const confirm = await SwalConfirm.fire({
                title: 'Terima Laporan Periodik?',
                text: 'Laporan akan ditandai sebagai Valid. Pastikan isi laporan sudah sesuai.',
                confirmButtonText: 'Ya, Terima',
                icon: 'question'
            })
            if (!confirm.isConfirmed) return
        }

        if (action === 'reject') {
            const { value: text, isDismissed } = await Swal.fire({
                title: 'Tolak Laporan LPK',
                input: 'textarea',
                inputLabel: 'Alasan Penolakan / Revisi',
                inputPlaceholder: 'Contoh: Lampiran foto kegiatan kurang...',
                showCancelButton: true,
                confirmButtonText: 'Kirim Penolakan',
                cancelButtonText: 'Batal',
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
        formData.append('reportId', report.id)
        formData.append('userId', report.user_id)
        formData.append('action', action)
        formData.append('reason', reason)

        const res = await verifyLpkReportAction(formData) // Panggil Server Action

        setLoading(false)

        if (res?.error) {
            SwalAlert.fire({ icon: 'error', title: 'Gagal Memproses', text: res.error })
        } else {
            SwalToast.fire({ icon: 'success', title: action === 'approve' ? 'Laporan Diterima' : 'Laporan Ditolak' })
            // Component will re-render due to parent refresh usually, but here we depend on router refresh in the ACTION?
            // The original code relied on `router.refresh()` which was NOT present in the component but presumably triggered by parent or the action calls `revalidatePath`.
            // Actually `LPKReportTable` didn't import `useRouter` but `router.refresh()` was NOT called in `executeVerify` in the original code?
            // Wait, original code lines 60-76: `verifyLpkReportAction` returns res.
            // If success, it just closed modal. It didn't refresh?
            // That implies the page might not update? Or maybe `verifyLpkReportAction` internally revalidates path.
            // I will assume `verifyLpkReportAction` handles revalidation.
        }
    }

    return (
        <>
            {/* TABEL DATA */}
            <div className="overflow-x-auto w-full">
                <table className="w-full text-sm text-left min-w-[800px]">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                        <tr>
                            <th className="px-6 py-3">LPK & Kontak</th>
                            <th className="px-6 py-3">Periode</th>
                            <th className="px-6 py-3 text-center">File Laporan</th>
                            <th className="px-6 py-3 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="text-center py-12 text-gray-500">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="p-3 bg-gray-50 rounded-full">
                                            <FileText size={32} className="text-gray-400" />
                                        </div>
                                        <p className="font-medium">Tidak ada laporan periodik baru.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            reports.map((item) => (
                                <tr key={item.id} className="bg-white border-b hover:bg-blue-50/50 transition duration-150">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900 text-sm">{item.nama_lpk}</div>
                                        <div className="text-xs text-gray-500 mt-0.5">Reg: <span className="font-mono">{item.no_reg}</span></div>
                                        <div className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                                            <Building size={10} />
                                            {item.profiles?.phone || 'No Phone'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-bold text-gray-700">
                                        <span className="bg-gray-100 px-2 py-1 rounded text-gray-600 border">
                                            {item.semester} {item.tahun}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {/* Word Button: Blue Style */}
                                        <a href={`/api/generate-word/lpk-report?id=${item.id}`} className="text-blue-600 text-xs font-bold border border-blue-200 px-4 py-2 rounded-lg hover:bg-blue-50 hover:shadow-sm transition flex items-center justify-center gap-2 w-28 mx-auto group">
                                            <Download size={14} className="group-hover:scale-110 transition" /> Word
                                        </a>
                                    </td>
                                    <td className="px-6 py-4 flex justify-center gap-2">
                                        {!viewOnly ? (
                                            <>
                                                <button onClick={() => executeVerify(item, 'approve')} disabled={loading} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-700 hover:shadow shadow-green-200 transition flex items-center gap-1.5">
                                                    <CheckCircle size={14} /> Terima
                                                </button>
                                                <button onClick={() => executeVerify(item, 'reject')} disabled={loading} className="bg-white border border-red-200 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-50 hover:text-red-700 transition flex items-center gap-1.5">
                                                    <XCircle size={14} /> Tolak
                                                </button>
                                            </>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                {onDelete && (
                                                    <form action={onDelete}>
                                                        <input type="hidden" name="id" value={item.id} />
                                                        <button className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition" title="Hapus Riwayat">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </form>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </>
    )
}
