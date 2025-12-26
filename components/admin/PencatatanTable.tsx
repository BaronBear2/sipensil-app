
'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, FileText, X, FolderSymlink, Building, Trash2, Calendar, Users, FileSpreadsheet } from 'lucide-react'
import { verifyMagangPermitAction } from '@/actions/dinas'
import Link from 'next/link'

export default function PencatatanTable({ permits, viewOnly = false, onDelete }: { permits: any[], viewOnly?: boolean, onDelete?: (formData: FormData) => Promise<void> }) {
    // State untuk Modal
    const [selectedPermit, setSelectedPermit] = useState<any>(null)
    const [isRejectMode, setIsRejectMode] = useState(false)
    const [isConfirmMode, setIsConfirmMode] = useState(false)
    const [rejectReason, setRejectReason] = useState('')
    const [loading, setLoading] = useState(false)

    // Reset modal when data changes
    useEffect(() => {
        closeModal()
    }, [permits])

    // Helper: Reset State & Close Modal
    const closeModal = () => {
        setSelectedPermit(null)
        setIsConfirmMode(false)
        setIsRejectMode(false)
        setRejectReason('')
        setLoading(false)
    }

    // Buka Modal Konfirmasi Terima
    const openConfirmAccept = (permit: any) => {
        setLoading(false)
        setSelectedPermit(permit)
        setIsConfirmMode(true)
        setIsRejectMode(false)
    }

    // Buka Modal Tolak
    const openRejectForm = (permit: any) => {
        setLoading(false)
        setSelectedPermit(permit)
        setIsRejectMode(true)
        setIsConfirmMode(false)
        setRejectReason('')
    }

    // Eksekusi Verifikasi
    const executeVerify = async (action: 'approve' | 'reject') => {
        if (!selectedPermit) return
        setLoading(true)

        const formData = new FormData()
        formData.append('permitId', selectedPermit.id)
        formData.append('action', action)
        formData.append('reason', rejectReason)

        const res = await verifyMagangPermitAction(formData)

        // @ts-expect-error: Server action error handling
        if (res?.error) {
            // @ts-expect-error
            alert(res.error)
            setLoading(false)
            return
        }

        closeModal()
    }

    return (
        <>
            {/* TABEL DATA */}
            <div className="overflow-x-auto min-h-[500px]">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                        <tr>
                            <th className="px-6 py-3">Perusahaan & Kontak</th>
                            <th className="px-6 py-3">Jadwal & Peserta</th>
                            <th className="px-6 py-3 text-center">Data Peserta</th>
                            <th className="px-6 py-3 text-center">Status</th>
                            <th className="px-6 py-3 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {permits.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-12 text-gray-500">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="p-3 bg-gray-50 rounded-full">
                                            <FileText size={32} className="text-gray-400" />
                                        </div>
                                        <p className="font-medium">Tidak ada data pencatatan baru.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            permits.map((item) => (
                                <tr key={item.id} className="bg-white border-b hover:bg-purple-50/20 transition duration-150">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900 text-sm">{item.profiles?.company_name}</div>
                                        <div className="text-xs text-gray-500 mt-0.5">NIB: <span className="font-mono">{item.profiles?.nib}</span></div>
                                        <div className="text-xs text-purple-600 mt-1 flex items-center gap-1">
                                            <Building size={10} />
                                            {item.profiles?.phone || 'No Phone'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="flex items-center gap-1 text-xs text-gray-600">
                                                <Calendar size={12} className="text-gray-400" />
                                                {item.start_date} s/d {item.end_date}
                                            </span>
                                            <span className="flex items-center gap-1 text-xs font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded w-fit">
                                                <Users size={12} />
                                                {item.participant_count} Peserta
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {item.document_path ? (
                                            <a href={item.document_path} target="_blank" className="text-green-600 text-xs font-bold border border-green-200 px-3 py-1.5 rounded hover:bg-green-50 hover:shadow-sm transition flex items-center justify-center gap-2 w-28 mx-auto group">
                                                <FileSpreadsheet size={16} className="group-hover:scale-110 transition" /> Excel
                                            </a>
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">No Excel</span>
                                        )}
                                    </td>

                                    {/* STATUS COLUMN (ViewOnly + Pending) */}
                                    <td className="px-6 py-4 text-center">
                                        {/* Pending Status Badge */}
                                        {!viewOnly ? (
                                            <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-bold border border-yellow-200">
                                                Menunggu
                                            </span>
                                        ) : (
                                            <>
                                                {item.status === 'APPROVED' && (
                                                    <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold border border-green-200">
                                                        Terverifikasi
                                                    </span>
                                                )}
                                                {item.status === 'REJECTED' && (
                                                    <span className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full font-bold border border-red-200">
                                                        Ditolak
                                                    </span>
                                                )}
                                            </>
                                        )}
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
                                                <span className="text-xs text-gray-400 font-bold italic mr-2">Selesai</span>

                                                {onDelete && (
                                                    <form
                                                        action={onDelete}
                                                    >
                                                        <input type="hidden" name="id" value={item.id} />
                                                        <button
                                                            type="submit"
                                                            className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition cursor-pointer"
                                                            title="Hapus Riwayat"
                                                            onClick={(e) => {
                                                                if (!confirm('Hapus riwayat ini secara permanen?')) {
                                                                    e.preventDefault()
                                                                }
                                                            }}
                                                        >
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
            {selectedPermit && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">

                        {/* Header Modal */}
                        <div className="bg-gray-100 px-6 py-4 flex justify-between items-center border-b">
                            <h3 className="font-bold text-gray-800">
                                {isConfirmMode ? 'Terima Pencatatan Magang' : 'Tolak Pencatatan Magang'}
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
                                    <h4 className="text-lg font-bold text-gray-800 mb-2">Terbitkan Tanda Bukti?</h4>
                                    <p className="text-sm text-gray-600 mb-6">Sistem akan men-generate Nomor SK Pencatatan secara otomatis dan status berubah menjadi DITERIMA.</p>
                                    <div className="flex justify-center gap-3">
                                        <button onClick={closeModal} className="px-4 py-2 border rounded-lg text-gray-600 font-bold text-sm hover:bg-gray-50">Batal</button>
                                        <button onClick={() => executeVerify('approve')} disabled={loading} className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700">
                                            {loading ? 'Memproses...' : 'Ya, Terbitkan'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* 3. MODE TOLAK + PESAN */}
                            {isRejectMode && (
                                <div>
                                    <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4 text-xs text-red-700">
                                        Perusahaan akan menerima notifikasi penolakan ini.
                                    </div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Alasan Penolakan / Revisi:</label>
                                    <textarea
                                        className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none h-32"
                                        placeholder="Contoh: Data peserta tidak sesuai format, Tanggal magang tidak valid..."
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
