'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Upload, FileText, CheckCircle, AlertTriangle, Download, ArrowLeft, Clock, Info } from 'lucide-react'
import Link from 'next/link'
import StatusModal from '@/components/ui/StatusModal'

import Modal from '@/components/ui/Modal'

export default function ImJapanPage() {
    const supabase = createClient()
    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [data, setData] = useState<any>(null) // Existing registration
    const [isEditing, setIsEditing] = useState(false)
    const [profile, setProfile] = useState<any>(null)
    const [requirements, setRequirements] = useState<any[]>([])
    // State for re-application mode
    const [isReapplying, setIsReapplying] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false) // Added for Modal

    // ... (Modal State and useEffect remain same)

    // ... (handleFileChange remains same)

    const handleReapply = () => {
        // Switch to "Reapply" mode:
        // 1. Standard form shows up
        // 2. Clear old data for fresh start
        setIsReapplying(true)
        setIsEditing(true)
        setUploadedUrls({}) // Clear uploaded URLs to force fresh upload
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // ... (Validation logic remains same)
        const missing = docList.filter(d => {
            // Check if document is present in uploadedUrls (new or pre-filled)
            return !(uploadedUrls[d.id] && uploadedUrls[d.id].length > 0)
        })

        if (missing.length > 0) {
            setStatusModal({ isOpen: true, type: 'error', message: `Mohon lengkapi dokumen: ${missing.map(d => d.label).join(', ')}` })
            return
        }

        if (!profile) return

        // REPLACEMENT: Open Modal instead of window.confirm
        setShowConfirm(true)
    }

    const executeSubmit = async () => {
        setShowConfirm(false)
        setSubmitting(true)

        const payload = {
            user_id: profile.id,
            document_path: 'see_documents_column',
            documents: uploadedUrls, // Use current state
            status: 'PENDING',
            admin_notes: null
        }

        let error;

        // LOGIC CHANGE:
        // If (data exist AND (Rejected or Verified)) OR isReapplying -> INSERT NEW
        // If (data exist AND Pending) -> UPDATE (Edit)

        const shouldInsert = !data || isReapplying || (data && (data.status === 'REJECTED' || data.status === 'VERIFIED' || data.status === 'DITERIMA'))

        if (shouldInsert) {
            const { error: err } = await supabase.from('im_japan_registrations').insert(payload)
            error = err
        } else {
            // Valid current pending application -> Update
            const { error: err } = await supabase.from('im_japan_registrations').update(payload).eq('id', data.id)
            error = err
        }

        if (error) {
            setStatusModal({ isOpen: true, type: 'error', message: "Gagal mengirim: " + error.message })
        } else {
            setStatusModal({ isOpen: true, type: 'success', message: 'Permohonan berhasil dikirim!' })
            setTimeout(() => window.location.reload(), 1500)
        }
        setSubmitting(false)
    }

    // ... (Loading check)

    // Helper boolean
    const showForm = !data || isEditing

    return (
        <div className="min-h-screen bg-gray-50 font-sans animate-fade-in pb-20">
            {/* ... Modal ... */}
            <StatusModal
                isOpen={statusModal.isOpen}
                type={statusModal.type}
                message={statusModal.message}
                onClose={() => setStatusModal(prev => ({ ...prev, isOpen: false }))}
            />

            {/* CONFIRMATION MODAL */}
            <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)} title="Konfirmasi Permohonan">
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-4 bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                            <Info size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800 text-sm">Permohonan Surat Rekomendasi</h4>
                            <p className="font-bold text-blue-700 text-lg">IM Japan</p>
                        </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                        Pastikan semua berkas yang diunggah sudah benar dan sesuai persyaratan.
                        Data yang dikirim akan diverifikasi oleh Admin Disnaker.
                        <br /><br />
                        Apakah Anda yakin ingin {isEditing ? 'menyimpan perubahan' : 'mengirim permohonan'} ini?
                    </p>
                    <div className="flex gap-3">
                        <button onClick={() => setShowConfirm(false)} className="flex-1 py-3 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-50 text-sm transition">
                            Batal
                        </button>
                        <button onClick={executeSubmit} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 text-sm shadow-lg shadow-blue-200 transition">
                            Ya, {isEditing ? 'Simpan' : 'Kirim'}
                        </button>
                    </div>
                </div>
            </Modal>

            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* ... Header ... */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/dashboard/pencaker" className="bg-white p-3 rounded-full shadow-sm border border-gray-100 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
                            Permohonan Surat Rekomendasi Tes IM Japan 🇯🇵
                        </h1>
                        <p className="text-gray-500 text-sm">Upload berkas persyaratan untuk mendapatkan Surat Rekomendasi.</p>
                    </div>
                </div>

                {/* REJECTED STATE - Latest */}
                {data?.status === 'REJECTED' && !isEditing && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-xl mb-8 shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className="bg-red-100 p-2 rounded-full text-red-600 shrink-0">
                                <AlertTriangle size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-red-800 text-lg">Permohonan Terakhir Ditolak</h3>
                                <p className="text-red-700 mt-1 font-medium bg-red-100/50 p-3 rounded-lg border border-red-200">
                                    &quot; {data.admin_notes || 'Tidak ada catatan.'} &quot;
                                </p>
                                <div className="mt-4 flex gap-3">
                                    <button
                                        onClick={handleReapply}
                                        className="bg-red-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-red-700 shadow-lg shadow-red-200 transition"
                                    >
                                        Ajukan Permohonan Lagi
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* VERIFIED STATE - Latest */}
                {(data?.status === 'VERIFIED' || data?.status === 'DITERIMA') && !isEditing && (
                    <div className="bg-white border border-green-200 rounded-2xl p-8 mb-8 shadow-sm text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="text-green-600 w-10 h-10" />
                        </div>
                        <h3 className="font-bold text-gray-900 text-2xl mb-2">Permohonan Disetujui</h3>
                        <p className="text-gray-600 mb-8 max-w-lg mx-auto">
                            Berkas Anda telah diverifikasi. Silakan download Surat Rekomendasi, atau ajukan permohonan baru jika diperlukan.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <a href="#" className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-200 transition-transform hover:-translate-y-1">
                                <Download size={20} /> Download Surat Rekomendasi
                            </a>
                            <button
                                onClick={handleReapply}
                                className="inline-flex items-center gap-2 bg-white border-2 border-green-600 text-green-700 px-6 py-3 rounded-xl font-bold hover:bg-green-50 transition"
                            >
                                Ajukan Permohonan Lagi
                            </button>
                        </div>
                    </div>
                )}

                {/* PENDING STATE */}
                {data?.status === 'PENDING' && !isEditing && (
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-12 text-center animate-fade-in-up">
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <Clock className="text-blue-600 w-10 h-10 animate-pulse" />
                        </div>
                        <h3 className="font-bold text-blue-900 text-2xl mb-3">Menunggu Verifikasi Admin</h3>
                        <p className="text-blue-700 max-w-xl mx-auto leading-relaxed mb-6">
                            Terima kasih telah mengajukan permohonan. Data dan berkas Anda sedang dalam proses pemeriksaan.
                        </p>
                        <button
                            onClick={() => { setIsEditing(true); setIsReapplying(false); setUploadedUrls(data.documents || {}) }}
                            className="bg-white border border-blue-200 text-blue-600 px-6 py-2 rounded-lg font-bold hover:bg-blue-100 transition shadow-sm"
                        >
                            Edit Berkas Pembaharuan
                        </button>
                    </div>
                )}

                {/* FORM AREA (Show if New OR Editing) */}
                {(!data || isEditing) && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in">

                        <div className="p-6 border-b bg-gray-50/50 flex justify-between items-center">
                            <div className="flex items-center gap-2 text-sm text-blue-800 bg-blue-50 px-4 py-3 rounded-lg">
                                <Info size={16} />
                                <span className="font-bold">
                                    {isEditing && !isReapplying ? 'Silakan upload ulang berkas yang perlu diperbaiki.' : 'Silakan lengkapi berkas di bawah ini.'}
                                </span>
                            </div>
                            {isEditing && (
                                <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-gray-700 text-sm font-bold">
                                    Batal {isReapplying ? 'Permohonan' : 'Edit'}
                                </button>
                            )}
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-100 text-gray-800 font-bold uppercase text-xs tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4 w-12 text-center">No</th>
                                        <th className="px-6 py-4">Keterangan Dokumen</th>
                                        <th className="px-6 py-4 w-48 text-center">Template</th>
                                        <th className="px-6 py-4 w-64 text-center">Upload File (PDF)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {docList.map((doc, idx) => (
                                        <tr key={doc.id} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="px-6 py-4 text-center font-bold text-gray-400">{idx + 1}</td>
                                            <td className="px-6 py-4 font-medium text-gray-800">{doc.label}</td>
                                            <td className="px-6 py-4 text-center">
                                                {doc.hasTemplate && doc.templateUrl ? (
                                                    <a
                                                        href={doc.templateUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-800 text-xs font-bold border border-blue-200 bg-blue-50 px-3 py-1.5 rounded-lg flex items-center justify-center gap-1 mx-auto hover:bg-blue-100 transition"
                                                    >
                                                        <Download size={14} /> Download
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-300">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="relative space-y-2">
                                                    {/* HIDE "Sudah Terupload" IF REAPPLYING */}
                                                    {((!isReapplying && data?.documents?.[doc.id]) || uploadedUrls[doc.id]) ? (
                                                        <div className="flex items-center justify-between gap-2 text-xs text-green-600 font-bold bg-green-50 p-2 rounded border border-green-100">
                                                            <div className="flex items-center gap-2">
                                                                <CheckCircle size={14} />
                                                                <span>Sudah Terupload</span>
                                                            </div>
                                                            {/* Preview Link */}
                                                            <a href={uploadedUrls[doc.id] || (!isReapplying ? data?.documents?.[doc.id] : '')} target="_blank" className="text-blue-600 hover:underline">Lihat</a>
                                                        </div>
                                                    ) : null}

                                                    <input
                                                        type="file"
                                                        accept=".pdf"
                                                        onChange={(e) => handleFileChange(doc.id, e.target.files?.[0] || null)}
                                                        className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                                                    />
                                                    <p className="text-[10px] text-gray-400">*Maks 5MB (PDF)</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-6 bg-gray-50 border-t flex justify-end">
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 disabled:bg-gray-300 disabled:shadow-none flex items-center gap-2"
                            >
                                {submitting ? (
                                    <><span>Mengirim...</span></>
                                ) : (
                                    <><Upload size={18} /> {isEditing ? 'Simpan Perubahan' : 'Ajukan Permohonan'}</>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
