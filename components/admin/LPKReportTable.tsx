'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, FileText, X, Download, Building } from 'lucide-react'
import { verifyLpkReportAction } from '@/actions/dinas'
import Link from 'next/link'

export default function LPKReportTable({ reports }: { reports: any[] }) {
    // State untuk Modal
    const [selectedReport, setSelectedReport] = useState<any>(null)
    const [isRejectMode, setIsRejectMode] = useState(false)
    const [isConfirmMode, setIsConfirmMode] = useState(false)
    const [rejectReason, setRejectReason] = useState('')
    const [loading, setLoading] = useState(false)

    // Buka Modal Konfirmasi Terima
    const openConfirmAccept = (report: any) => {
        setSelectedReport(report)
        setIsConfirmMode(true)
        setIsRejectMode(false)
    }

    // Buka Modal Tolak
    const openRejectForm = (report: any) => {
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

        const res = await verifyLpkReportAction(formData) // Panggil Server Action

        if (res?.error) {
            alert(res.error)
            setLoading(false)
            return
        }

        setLoading(false)
        setSelectedReport(null) // Tutup modal
        setIsConfirmMode(false)
        setIsRejectMode(false)
        window.location.reload() // Refresh data tabel
    }

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
                            <tr><td colSpan={4} className="text-center py-8 text-gray-500 italic">Tidak ada laporan periodik baru.</td></tr>
                        ) : (
                            reports.map((item) => (
                                <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900">{item.nama_lpk}</div>
                                        <div className="text-xs text-gray-500">Reg: {item.no_reg}</div>
                                        <div className="text-xs text-blue-600 mt-1">{item.profiles?.phone}</div>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-bold text-gray-700">
                                        {item.semester} {item.tahun}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {/* Use the same Link logic as before */}
                                        <Link href={`/api/generate-word/lpk-report?id=${item.id}`} target="_blank" className="text-green-600 text-xs font-bold border border-green-200 px-3 py-1.5 rounded hover:bg-green-50 flex items-center justify-center gap-1 w-24 mx-auto">
                                            <Download size={12} /> Word
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 flex justify-center gap-2">
                                        <button onClick={() => openConfirmAccept(item)} className="bg-green-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-green-700 flex items-center gap-1">
                                            <CheckCircle size={14} /> Terima
                                        </button>
                                        <button onClick={() => openRejectForm(item)} className="bg-red-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-red-700 flex items-center gap-1">
                                            <XCircle size={14} /> Tolak
                                        </button>
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
                            <button onClick={() => setSelectedReport(null)} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
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
                                        <button onClick={() => setIsConfirmMode(false)} className="px-4 py-2 border rounded-lg text-gray-600 font-bold text-sm hover:bg-gray-50">Batal</button>
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
                                        <button onClick={() => setIsRejectMode(false)} className="px-4 py-2 border rounded-lg text-gray-600 font-bold text-sm hover:bg-gray-50">Batal</button>
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
