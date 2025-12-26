'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, FileText, X, Download, Building, Trash2 } from 'lucide-react'
import { verifyLpkReportAction } from '@/actions/dinas'
import Link from 'next/link'

export default function LPKReportTable({ reports, viewOnly = false, onDelete }: { reports: any[], viewOnly?: boolean, onDelete?: (formData: FormData) => Promise<void> }) {
    // State untuk Modal
    const [selectedReport, setSelectedReport] = useState<any>(null)
    const [isRejectMode, setIsRejectMode] = useState(false)
    const [isConfirmMode, setIsConfirmMode] = useState(false)
    const [rejectReason, setRejectReason] = useState('')
    const [loading, setLoading] = useState(false)

    // Reset modal when data changes (e.g. after successful verification)
    useEffect(() => {
        closeModal()
    }, [reports])

    // Helper: Reset State & Close Modal
    const closeModal = () => {
        setSelectedReport(null)
        setIsConfirmMode(false)
        setIsRejectMode(false)
        setRejectReason('')
        setLoading(false)
    }

    // Buka Modal Konfirmasi Terima
    const openConfirmAccept = (report: any) => {
        setLoading(false) // Reset loading state explicitely
        setSelectedReport(report)
        setIsConfirmMode(true)
        setIsRejectMode(false)
    }

    // Buka Modal Tolak
    const openRejectForm = (report: any) => {
        setLoading(false) // Reset loading state explicitely
        setSelectedReport(report)
        setIsRejectMode(true)
        setIsConfirmMode(false)
        setRejectReason('')
    }

    // Eksekusi Verifikasi
    const executeVerify = async (action: 'approve' | 'reject') => {
        if (!selectedReport) return
        setLoading(true)

        const formData = new FormData()
        formData.append('reportId', selectedReport.id)
        formData.append('userId', selectedReport.user_id)
        formData.append('action', action)
        formData.append('reason', rejectReason)

        // Optimistically close modal to prevent "stuck" feeling
        // The page will redirect anyway if success
        if (action === 'approve') {
            // For approve, we want it to feel instant
        }

        const res = await verifyLpkReportAction(formData) // Panggil Server Action

        if (res?.error) {
            alert(res.error)
            setLoading(false)
            // Re-open if error
            return
        }

        // Success flow
        // Success flow
        closeModal()
    }

    // Explicitly import Trash2 from lucide-react (needs to be added to imports at top of file, doing partial replace safely usually requires multi_replace but since default_api replaced everything let's try to match existing imports... actually wait)
    // The previous tool call view_file shows imports at top: CheckCircle, XCircle, FileText, X, Download, Building. Trash2 is MISSING.
    // I need to update imports AND the props.
    // It is better to do ONE big replace or TWO small ones.
    // I will do two small steps since I can't see the top of the file in this tool call's context (unless I assume it matches view_file).
    // Actually, I have the full view_file content in step 2052.
    // I will replace line 4 and line 8.

    return (
        <>
            {/* TABEL DATA */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
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
                                        <a href={`/api/export/lpk-report/${item.id}`} className="text-blue-600 text-xs font-bold border border-blue-200 px-4 py-2 rounded-lg hover:bg-blue-50 hover:shadow-sm transition flex items-center justify-center gap-2 w-28 mx-auto group">
                                            <Download size={14} className="group-hover:scale-110 transition" /> Word
                                        </a>
                                    </td>
                                    <td className="px-6 py-4 flex justify-center gap-2">
                                        {!viewOnly ? (
                                            <>
                                                <button onClick={() => openConfirmAccept(item)} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-700 hover:shadow shadow-green-200 transition flex items-center gap-1.5">
                                                    <CheckCircle size={14} /> Terima
                                                </button>
                                                <button onClick={() => openRejectForm(item)} className="bg-white border border-red-200 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-50 hover:text-red-700 transition flex items-center gap-1.5">
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

            {/* --- MODAL AREA --- */}
            {selectedReport && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">

                        {/* Header Modal */}
                        <div className="bg-gray-100 px-6 py-4 flex justify-between items-center border-b">
                            <h3 className="font-bold text-gray-800">
                                {isConfirmMode ? 'Terima Laporan LPK' : 'Tolak Laporan LPK'}
                            </h3>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
                        </div>

                        {/* Isi Modal */}
                        <div className="p-6">

                            {/* 2. MODE KONFIRMASI TERIMA */}
                            {isConfirmMode && (
                                <div className="text-center">
                                    <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="text-green-600 w-8 h-8" />
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-800 mb-2">Terima Laporan Periodik?</h4>
                                    <p className="text-sm text-gray-600 mb-6">Laporan akan ditandai sebagai Valid. Pastikan isi laporan sudah sesuai.</p>
                                    <div className="flex justify-center gap-3">
                                        <button onClick={closeModal} className="px-4 py-2 border rounded-lg text-gray-600 font-bold text-sm hover:bg-gray-50">Batal</button>
                                        <button onClick={() => executeVerify('approve')} disabled={loading} className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700">
                                            {loading ? 'Memproses...' : 'Ya, Terima'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* 3. MODE TOLAK + PESAN */}
                            {isRejectMode && (
                                <div>
                                    <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4 text-xs text-red-700">
                                        LPK akan diminta untuk merevisi laporan ini.
                                    </div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Alasan Penolakan / Revisi:</label>
                                    <textarea
                                        className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none h-32"
                                        placeholder="Contoh: Lampiran foto kegiatan kurang, Data peserta tidak sinkron..."
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                    ></textarea>
                                    <div className="flex justify-end gap-3 mt-6">
                                        <button onClick={closeModal} className="px-4 py-2 border rounded-lg text-gray-600 font-bold text-sm hover:bg-gray-50">Batal</button>
                                        <button onClick={() => executeVerify('reject')} disabled={loading || !rejectReason} className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 disabled:bg-gray-300">
                                            {loading ? 'Mengirim...' : 'Kirim Penolakan'}
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
