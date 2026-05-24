'use client'

import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Users, Eye, AlertCircle } from 'lucide-react'
import { verifyTrainingRegistrationAction, uploadTrainingPdfAction, bulkRejectPendingAction } from '@/actions/dinas'
import { SwalAlert, SwalConfirm, SwalToast } from '@/utils/swal'
import Link from 'next/link'
import { Upload } from 'lucide-react'

import { useRouter, useSearchParams } from 'next/navigation'

export default function TrainingDetailV2({ training, registrations }: { training: any, registrations: any[] }) {
    const router = useRouter()
    const [loadingRegId, setLoadingRegId] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)
    const [activeTab, setActiveTab] = useState<'administrasi' | 'seleksi' | 'penilaian' | 'semua_peserta' | 'riwayat_peserta'>('administrasi')

    const accCount = registrations.filter(r => r.status !== 'PENDING' && r.status !== 'DITOLAK').length

    const searchParams = useSearchParams()

    useEffect(() => {
        if (searchParams.get('trigger_upload') === 'true') {
            document.getElementById('quota-upload-pdf-input')?.click()

            // Clean up the URL
            const url = new URL(window.location.href)
            url.searchParams.delete('trigger_upload')
            window.history.replaceState({}, '', url.toString())
        }
    }, [searchParams])

    useEffect(() => {
        const checkQuotaAndPending = async () => {
            const hasPending = registrations.some(r => r.status === 'PENDING')
            if (accCount >= training.quota && hasPending) {
                try {
                    const res = await bulkRejectPendingAction(training.id)
                    if (!res?.error) {
                        await SwalAlert.fire({
                            icon: 'info',
                            title: 'Verifikasi Telah Berhasil',
                            text: 'Kuota telah terpenuhi. Sistem otomatis menggagalkan sisa pendaftar. Silakan upload dokumen list pencaker yang sudah lulus.'
                        })
                        document.getElementById('quota-upload-pdf-input')?.click()
                    }
                } catch (e) {
                    console.error("Failed to auto reject", e)
                }
            }
        }

        checkQuotaAndPending()
    }, [registrations, accCount, training.quota, training.id])

    const handleVerify = async (regId: string, action: 'approve_admin' | 'approve_seleksi' | 'lulus' | 'tidak_lulus' | 'reject') => {
        if (action === 'reject' || action === 'tidak_lulus') {
            const { value: reason } = await SwalConfirm.fire({
                title: 'Tolak Pendaftar?',
                input: 'text',
                inputPlaceholder: 'Masukkan alasan penolakan...',
                showCancelButton: true,
                confirmButtonText: 'Ya, Tolak',
                cancelButtonText: 'Batal'
            })
            if (!reason) return
            executeVerify(regId, 'reject', reason)
        } else {
            const confirm = await SwalConfirm.fire({
                title: action === 'approve_admin' ? 'Terima Administrasi?' : action === 'approve_seleksi' ? 'Loloskan Seleksi?' : 'Luluskan Peserta?',
                text: 'Peserta ini akan maju ke tahap selanjutnya.',
                confirmButtonText: 'Ya, Lanjutkan'
            })
            if (confirm.isConfirmed) {
                executeVerify(regId, action)
            }
        }
    }

    const executeVerify = async (regId: string, action: string, reason?: string) => {
        setLoadingRegId(regId)
        try {
            const formData = new FormData()
            formData.append('regId', regId)
            formData.append('action', action)
            formData.append('trainingId', training.id)
            if (reason) formData.append('reason', reason)

            const res = await verifyTrainingRegistrationAction(formData)

            if (res?.error) {
                SwalAlert.fire({ icon: 'error', title: 'Error', text: res.error })
            } else {
                SwalToast.fire({ icon: 'success', title: 'Status Berhasil Diubah' })
                if (res?.autoFailTriggered) {
                    await SwalAlert.fire({
                        icon: 'info',
                        title: 'Verifikasi Telah Berhasil',
                        text: 'Kuota telah terpenuhi. Sistem otomatis menggagalkan sisa pendaftar. Silakan unggah dokumen list pencaker yang sudah lulus.'
                    })
                    document.getElementById('upload-pdf-input')?.click()
                }
                router.refresh()
            }
        } catch (err) {
            SwalAlert.fire({ icon: 'error', title: 'Error', text: 'Kesalahan sistem' })
        } finally {
            setLoadingRegId(null)
        }
    }

    const handleUploadPdf = async (e: React.ChangeEvent<HTMLInputElement>, phase: string) => {
        const file = e.target.files?.[0]
        if (!file) return

        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
        if (!allowedTypes.includes(file.type)) {
            SwalAlert.fire({ icon: 'error', title: 'Invalid File', text: 'Harap unggah file PDF, JPG, atau PNG.' })
            return
        }

        setUploading(true)
        try {
            const formData = new FormData()
            formData.append('trainingId', training.id)
            formData.append('phase', phase)
            formData.append('file', file)

            const res = await uploadTrainingPdfAction(formData)
            if (res.error) {
                SwalAlert.fire({ icon: 'error', title: 'Upload Gagal', text: res.error })
            } else {
                SwalToast.fire({ icon: 'success', title: 'PDF Berhasil Diunggah' })
            }
        } catch (err) {
            SwalAlert.fire({ icon: 'error', title: 'Error', text: 'Terjadi kesalahan sistem' })
        } finally {
            setUploading(false)
        }
    }

    // Helper for rendering 7-step tracker visually
    const renderStepBadge = (step: number, status: string) => {
        if (status === 'DITOLAK') return <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">Gagal/Ditolak</span>

        let label = 'Tahap 1: Verifikasi'
        if (step === 2) label = 'Tahap 2: Seleksi'
        if (step === 3) label = 'Tahap 3: Lolos Seleksi'
        if (step === 4) label = 'Tahap 4: Sedang Pelatihan'
        if (step === 5) label = 'Tahap 5: Ujian'
        if (step === 6) label = 'Tahap 6: Evaluasi'
        if (step === 7) label = 'Tahap 7: Lulus'

        return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold">{label}</span>
    }

    let filteredRegistrations = []
    let currentPhasePdfUrl = null
    let currentPhase = 'admin'

    if (activeTab === 'administrasi') {
        filteredRegistrations = registrations.filter(r => r.progress_step === 1 && r.status !== 'DITOLAK')
        currentPhasePdfUrl = training.admin_passed_pdf
        currentPhase = 'admin'
    } else if (activeTab === 'seleksi') {
        filteredRegistrations = registrations.filter(r => r.progress_step === 2 && r.status !== 'DITOLAK')
        currentPhasePdfUrl = training.selection_passed_pdf
        currentPhase = 'selection'
    } else if (activeTab === 'penilaian') {
        filteredRegistrations = registrations.filter(r => (r.progress_step >= 6 || r.status === 'LULUS') && r.status !== 'DITOLAK')
        currentPhasePdfUrl = training.final_passed_pdf
        currentPhase = 'final'
    } else if (activeTab === 'semua_peserta') {
        filteredRegistrations = registrations.filter(r => r.status !== 'DITOLAK')
        currentPhasePdfUrl = null
        currentPhase = 'admin' // default so it does not break, though upload is hidden
    } else if (activeTab === 'riwayat_peserta') {
        filteredRegistrations = registrations
        currentPhasePdfUrl = null
        currentPhase = 'admin'
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-gray-800">{training.title}</h1>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${training.status === 'FINISHED' ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'}`}>
                        {training.status}
                    </span>
                </div>
                <div className="flex flex-col gap-3 text-sm text-gray-600 mt-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold text-gray-700">
                            <Users size={16} className="text-blue-600" /> Progress Kuota: {accCount} / {training.quota} Orang
                        </div>
                        <div className="flex items-center gap-2">
                            <AlertCircle size={16} className="text-gray-400" /> Total Pendaftar: {registrations.length}
                        </div>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${Math.min((accCount / (training.quota || 1)) * 100, 100)}%` }}></div>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('administrasi')}
                    className={`px-6 py-3 font-bold text-sm border-b-2 transition ${activeTab === 'administrasi' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    1. Administrasi
                </button>
                <button
                    onClick={() => setActiveTab('seleksi')}
                    className={`px-6 py-3 font-bold text-sm border-b-2 transition ${activeTab === 'seleksi' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    2. Seleksi
                </button>
                <button
                    onClick={() => setActiveTab('penilaian')}
                    className={`px-6 py-3 font-bold text-sm border-b-2 transition ${activeTab === 'penilaian' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    3. Uji Kompetensi
                </button>
                <button
                    onClick={() => setActiveTab('semua_peserta')}
                    className={`px-6 py-3 font-bold text-sm border-b-2 transition ${activeTab === 'semua_peserta' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    4. Nama Peserta
                </button>
                <button
                    onClick={() => setActiveTab('riwayat_peserta')}
                    className={`px-6 py-3 font-bold text-sm border-b-2 transition ${activeTab === 'riwayat_peserta' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    5. Semua Riwayat
                </button>
            </div>

            {/* Participants Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-bold text-gray-700">Daftar Peserta - {activeTab === 'administrasi' ? 'Administrasi' : activeTab === 'seleksi' ? 'Tahap Seleksi (Tidak Gagal = Lulus)' : activeTab === 'penilaian' ? 'Uji Kompetensi (Tidak Gagal = Kompeten)' : activeTab === 'semua_peserta' ? 'Peserta Aktif' : 'Semua Pendaftar'}</h3>
                    <div className="flex items-center gap-3">
                        {currentPhasePdfUrl && (
                            <a href={currentPhasePdfUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-blue-600 hover:underline">
                                Lihat File Saat Ini
                            </a>
                        )}
                        {activeTab !== 'semua_peserta' && activeTab !== 'riwayat_peserta' && (
                            <label className="cursor-pointer bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold py-2 px-4 rounded-lg flex items-center gap-2 text-sm transition">
                                <Upload size={16} /> {uploading ? 'Mengunggah...' : 'Upload File'}
                                <input
                                    id="upload-pdf-input"
                                    type="file"
                                    accept="application/pdf,image/jpeg,image/png"
                                    className="hidden"
                                    onChange={(e) => handleUploadPdf(e, currentPhase)}
                                    disabled={uploading}
                                />
                            </label>
                        )}
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Nama Peserta</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Kontak</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Status & Progress</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredRegistrations.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-gray-400">
                                        Tidak ada pendaftar di tahap ini.
                                    </td>
                                </tr>
                            ) : (
                                filteredRegistrations.map((reg) => (
                                    <tr key={reg.id} className="hover:bg-gray-50/50 transition">
                                        <td className="p-4">
                                            <div className="font-bold text-gray-800">{reg.profiles?.full_name || 'Tanpa Nama'}</div>
                                            <div className="text-xs text-gray-500 mt-1">Umur: {reg.age} | Bekerja: {reg.is_unemployed ? 'Tidak' : 'Ya'}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm text-gray-600">{reg.profiles?.phone || '-'}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col items-start gap-1">
                                                {renderStepBadge(reg.progress_step, reg.status)}
                                                {reg.status === 'PENDING' && (
                                                    <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">Menunggu Verifikasi</span>
                                                )}
                                                {reg.status === 'DITOLAK' && reg.admin_notes && (
                                                    <span className="text-[10px] text-red-500 max-w-[200px] truncate" title={reg.admin_notes}>{reg.admin_notes}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">


                                                {reg.status !== 'DITOLAK' && activeTab === 'administrasi' && reg.progress_step === 1 && (
                                                    <Link
                                                        href={`/dashboard/dinas/pelatihan/${training.id}/verifikasi/${reg.id}`}
                                                        className="px-3 py-1.5 bg-blue-600 text-white rounded font-bold text-xs hover:bg-blue-700 transition"
                                                    >
                                                        Verifikasi
                                                    </Link>
                                                )}

                                                {reg.status !== 'DITOLAK' && activeTab === 'seleksi' && reg.progress_step === 2 && (
                                                    <>
                                                        <button
                                                            disabled={loadingRegId === reg.id}
                                                            onClick={() => handleVerify(reg.id, 'reject')}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                                                            title="Tidak Lolos Seleksi"
                                                        >
                                                            <XCircle size={18} />
                                                        </button>
                                                    </>
                                                )}

                                                {reg.status !== 'DITOLAK' && reg.status !== 'LULUS' && activeTab === 'penilaian' && reg.progress_step >= 6 && (
                                                    <>
                                                        <button
                                                            disabled={loadingRegId === reg.id}
                                                            onClick={() => handleVerify(reg.id, 'tidak_lulus')}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                                                            title="Tidak Lulus"
                                                        >
                                                            <XCircle size={18} />
                                                        </button>
                                                    </>
                                                )}

                                                {(activeTab === 'semua_peserta' || activeTab === 'riwayat_peserta') && reg.status !== 'DITOLAK' && (
                                                    <button
                                                        disabled={loadingRegId === reg.id}
                                                        onClick={() => handleVerify(reg.id, 'reject')}
                                                        className="px-3 py-1.5 bg-red-100 text-red-700 rounded font-bold text-xs hover:bg-red-200 transition flex items-center gap-1"
                                                        title="Gagalkan Peserta"
                                                    >
                                                        <XCircle size={14} /> Gagalkan
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <input
                id="quota-upload-pdf-input"
                type="file"
                accept="application/pdf,image/jpeg,image/png"
                className="hidden"
                onChange={(e) => handleUploadPdf(e, 'admin')}
                disabled={uploading}
            />
        </div>
    )
}
