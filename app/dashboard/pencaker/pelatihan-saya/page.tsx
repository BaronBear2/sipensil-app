'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { FileText, Calendar, MapPin, Clock, Download, ExternalLink, ArrowLeft, AlertCircle, CheckCircle, XCircle, History, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'
import PageHeader from '@/components/ui/PageHeader'

// Helper to format date
const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

import { cancelRegistrationAction } from '@/actions/cancel_registration'
import { qaDeleteRejectionAction, qaDeleteFinishedTrainingAction } from '@/actions/qa'
import { SwalConfirm, SwalToast, SwalAlert } from '@/utils/swal'

export default function MyTrainingsPage() {
    const supabase = createClient()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [activeRegistrations, setActiveRegistrations] = useState<any[]>([])
    const [passedRegistrations, setPassedRegistrations] = useState<any[]>([])
    const [historyRegistrations, setHistoryRegistrations] = useState<any[]>([])
    const [rejectedRegistrations, setRejectedRegistrations] = useState<any[]>([])

    // Drawer state replaced with Tab state
    const [activeTab, setActiveTab] = useState<'aktif' | 'selesai' | 'gagal'>('aktif')

    // For Cancelling
    const [isCancelling, setIsCancelling] = useState(false)

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        const getData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.push('/auth/login'); return }

            // Lazy evaluate time-based progression first
            await supabase.rpc('update_time_based_progress')

            const { data, error } = await supabase
                .from('training_registrations')
                .select('*, blk_trainings(*)')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (data) {
                const now = new Date()

                const active = []
                const passed = []
                const history = []
                const rejected = []

                for (const reg of data) {
                    const status = reg.status
                    const trainingEnd = reg.blk_trainings?.training_end_date ? new Date(reg.blk_trainings.training_end_date) : null
                    const isFinishedDate = trainingEnd && trainingEnd < now

                    if (status === 'DITOLAK' || status === 'REJECTED') {
                        rejected.push(reg)
                    } else if (reg.progress_step >= 4 || status === 'LULUS' || status === 'SELESAI') {
                        passed.push(reg)
                    } else if (status === 'DITERIMA' || status === 'APPROVED' || status === 'VERIFIED') {
                        // Check if training period has passed
                        if (isFinishedDate) {
                            history.push(reg)
                        } else {
                            active.push(reg)
                        }
                    } else {
                        // Pending
                        active.push(reg)
                    }
                }

                setActiveRegistrations(active)
                setPassedRegistrations(passed)
                setHistoryRegistrations(history)
                setRejectedRegistrations(rejected)
            }
            setLoading(false)
        }
        getData()
    }, [isCancelling]) // Refresh when cancelling state changes (trigger re-fetch)

    const handlePrint = (reg: any, type: 'registration' | 'acceptance') => {
        const title = type === 'registration' ? 'TANDA BUKTI PENDAFTARAN' : 'TANDA BUKTI DITERIMA PELATIHAN'
        const printWindow = window.open('', '_blank')
        if (printWindow) {
            printWindow.document.write(`
                <html>
                <head>
                    <title>${title} - SIPENSIL</title>
                    <style>
                        body { font-family: sans-serif; padding: 40px; }
                        .header { text-align: center; border-bottom: 2px solid black; padding-bottom: 20px; margin-bottom: 30px; }
                        .content { line-height: 1.6; }
                        .box { border: 1px solid #ccc; padding: 15px; margin: 20px 0; border-radius: 8px; }
                        .status { font-weight: bold; padding: 5px 10px; border-radius: 4px; background: #eee; display: inline-block; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h2>${title}</h2>
                        <h3>SIPENSIL - Dinas Ketenagakerjaan Kab. Bekasi</h3>
                    </div>
                    <div class="content">
                        <p>${type === 'registration'
                    ? 'Terima kasih telah mendaftar pada program pelatihan BLK. Simpan dokumen ini sebagai bukti pendaftaran.'
                    : 'Selamat! Pendaftaran Anda telah DITERIMA/VERIFIKASI oleh Dinas. Silakan bawa bukti ini saat daftar ulang.'}
                        </p>
                        
                        <div class="box">
                            <p><strong>Nama Peserta:</strong> ${reg.full_name || '-'}</p>
                            <p><strong>NIK:</strong> ${reg.nik || '-'}</p>
                            <p><strong>Tanggal Daftar:</strong> ${formatDate(reg.created_at)}</p>
                        </div>

                        <h3>Detail Pelatihan</h3>
                        <div class="box">
                            <p><strong>Program:</strong> ${reg.blk_trainings.title}</p>
                            <p><strong>Penyelenggara:</strong> ${reg.blk_trainings.provider}</p>
                            <p><strong>Lokasi:</strong> ${reg.blk_trainings.location || 'UPTD BLK Kabupaten Bekasi'}</p>
                            <p><strong>Pelaksanaan:</strong> ${formatDate(reg.blk_trainings.training_start_date)} s/d ${formatDate(reg.blk_trainings.training_end_date)}</p>
                            <p><strong>Pendaftaran:</strong> ${formatDate(reg.blk_trainings.registration_start)} s/d ${formatDate(reg.blk_trainings.registration_end)}</p>
                        </div>

                        <div style="margin-top: 40px; text-align: center;">
                            <p class="status">STATUS: ${reg.status}</p>
                            <p style="font-size: 12px; margin-top: 10px;">Dokumen ini dicetak otomatis oleh sistem SIPENSIL.</p>
                        </div>
                    </div>
                    <script>window.print();</script>
                </body>
                </html>
            `)
            printWindow.document.close()
        }
    }

    const handleCancel = async (reg: any) => {
        if (isCancelling) return

        const result = await SwalConfirm.fire({
            title: 'Batalkan Pendaftaran?',
            text: 'Apakah anda yakin ingin membatalkan pendaftaran ini? Status akun anda akan kembali menjadi belum diverifikasi.',
            icon: 'warning',
            confirmButtonText: 'Ya, Batalkan',
            confirmButtonColor: '#d33',
            cancelButtonText: 'Kembali'
        })

        if (result.isConfirmed) {
            setIsCancelling(true)
            const formData = new FormData()
            formData.append('regId', reg.id)

            try {
                const res = await cancelRegistrationAction(formData)
                if (res.error) {
                    SwalAlert.fire({ title: 'Gagal', text: res.error, icon: 'error' })
                } else {
                    await SwalToast.fire({ title: 'Pendaftaran Berhasil Dibatalkan', icon: 'success' })
                    // Force refresh data locally
                    router.refresh()
                    // Manually trigger re-fetching is pointless if page is SSC, but this is client component so useEffect will rerun if we toggle something or just router.refresh() might be enough
                    // But we used useEffect with [isCancelling], so toggling it off later will re-trigger
                }
            } catch (err) {
                console.error(err)
                SwalAlert.fire({ title: 'Error', text: 'Terjadi kesalahan sistem', icon: 'error' })
            } finally {
                setIsCancelling(false)
            }
        }
    }

    const handleQADeleteRejection = async (reg: any) => {
        if (isCancelling) return

        const result = await SwalConfirm.fire({
            title: 'Fitur QA: Hapus Penolakan?',
            text: 'Ini akan menghapus riwayat penolakan Anda sepenuhnya, sehingga Anda bisa mendaftar ulang di pelatihan ini. Lanjutkan?',
            icon: 'warning',
            confirmButtonText: 'Ya, Hapus',
            confirmButtonColor: '#d33',
            cancelButtonText: 'Batal'
        })

        if (result.isConfirmed) {
            setIsCancelling(true)
            const formData = new FormData()
            formData.append('regId', reg.id)

            try {
                const res = await qaDeleteRejectionAction(formData)
                if (res.error) {
                    SwalAlert.fire({ title: 'Gagal', text: res.error, icon: 'error' })
                } else {
                    await SwalToast.fire({ title: 'Penolakan Berhasil Dihapus', icon: 'success' })
                    router.refresh()
                }
            } catch (err) {
                console.error(err)
                SwalAlert.fire({ title: 'Error', text: 'Terjadi kesalahan sistem', icon: 'error' })
            } finally {
                setIsCancelling(false)
            }
        }
    }

    const handleQADeleteFinished = async (reg: any) => {
        if (isCancelling) return

        const result = await SwalConfirm.fire({
            title: 'Fitur QA: Hapus Pelatihan Selesai?',
            text: 'Ini akan menghapus riwayat pelatihan ini sepenuhnya dari daftar pelatihan yang sudah lulus/selesai. Lanjutkan?',
            icon: 'warning',
            confirmButtonText: 'Ya, Hapus',
            confirmButtonColor: '#d33',
            cancelButtonText: 'Batal'
        })

        if (result.isConfirmed) {
            setIsCancelling(true)
            const formData = new FormData()
            formData.append('regId', reg.id)

            try {
                const res = await qaDeleteFinishedTrainingAction(formData)
                if (res.error) {
                    SwalAlert.fire({ title: 'Gagal', text: res.error, icon: 'error' })
                } else {
                    await SwalToast.fire({ title: 'Riwayat Berhasil Dihapus', icon: 'success' })
                    router.refresh()
                }
            } catch (err) {
                console.error(err)
                SwalAlert.fire({ title: 'Error', text: 'Terjadi kesalahan sistem', icon: 'error' })
            } finally {
                setIsCancelling(false)
            }
        }
    }

    // Check if cancellation is allowed (date valid)
    const canCancel = (reg: any) => {
        if (!reg.blk_trainings?.registration_end) return true // If no end date, assume cancellable? Or false? Let's assume true for open-ended, or usually there is a date.

        const today = new Date()
        const endDate = new Date(reg.blk_trainings.registration_end)
        endDate.setHours(23, 59, 59, 999)

        return today <= endDate
    }

    if (loading) return <div className="p-10 text-center text-gray-500 animate-pulse">Memuat riwayat pelatihan...</div>

    const TrainingCard = ({ reg, isHistory = false, isRejected = false }: { reg: any, isHistory?: boolean, isRejected?: boolean }) => (
        <div key={reg.id} className={`bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow ${isRejected ? 'border-red-100' : 'border-gray-100'}`}>
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase mb-1 block">Program Pelatihan</span>
                        <h3 className="text-lg font-bold text-gray-800">{reg.blk_trainings?.title}</h3>
                        <p className="text-sm text-gray-500 font-medium flex items-center gap-1 mt-1">
                            <MapPin size={14} /> {reg.blk_trainings?.provider}
                        </p>
                    </div>
                    {/* Status Badges */}
                    {isHistory ? (
                        <div className="px-3 py-1 rounded-full text-xs font-bold border bg-gray-100 text-gray-600 border-gray-200 flex items-center gap-1">
                            <CheckCircle size={12} /> Selesai / Pernah Diikuti
                        </div>
                    ) : isRejected ? (
                        <div className="px-3 py-1 rounded-full text-xs font-bold border bg-red-100 text-red-700 border-red-200 flex items-center gap-1">
                            <XCircle size={12} /> {reg.progress_step === 1 ? 'Ditolak' : 'Gagal'}
                        </div>
                    ) : (
                        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${reg.status === 'DITERIMA' || reg.status === 'APPROVED' || reg.status === 'VERIFIED' || reg.status === 'LULUS' || reg.status === 'SELESAI'
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                            }`}>
                            {reg.status === 'DITOLAK' || reg.status === 'REJECTED' ? (reg.progress_step === 1 ? 'Ditolak' : 'Gagal') : reg.status === 'LULUS' || reg.status === 'SELESAI' ? 'Tahap 4 : Sudah Lulus' : reg.progress_step === 1 ? 'Tahap 1 : Administrasi' : reg.progress_step === 2 ? 'Tahap 2 : Seleksi' : reg.progress_step === 3 ? 'Tahap 3 : Pelatihan & Uji Kompetensi' : reg.progress_step >= 4 ? 'Tahap 4 : Sudah Lulus' : reg.status}
                        </div>
                    )}
                </div>

                {/* INFO GRID - Responsive Fix (1 col on mobile, 2 on larger) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500 mb-6 border-y py-3 bg-gray-50/50 px-4 -mx-6">
                    {/* New Field: Registration Period */}
                    <div className="flex items-center gap-2 md:col-span-2">
                        <FileText size={14} className="text-purple-500" />
                        <div>
                            <span className="text-[10px] text-gray-400 block">Masa Pendaftaran</span>
                            {reg.blk_trainings?.registration_start ? formatDate(reg.blk_trainings.registration_start) : '-'} s/d {reg.blk_trainings?.registration_end ? formatDate(reg.blk_trainings.registration_end) : '-'}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-blue-500" />
                        <div>
                            <span className="text-[10px] text-gray-400 block">Tanggal Daftar</span>
                            {formatDate(reg.created_at)}
                        </div>
                    </div>
                    {/* Reordered: Start Date first */}
                    <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-teal-500" />
                        <div>
                            <span className="text-[10px] text-gray-400 block">Mulai Pelatihan</span>
                            {formatDate(reg.blk_trainings?.training_start_date)}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock size={14} className="text-orange-500" />
                        <div>
                            <span className="text-[10px] text-gray-400 block">Selesai Pelatihan</span>
                            {reg.blk_trainings?.training_end_date ? formatDate(reg.blk_trainings.training_end_date) : '-'}
                        </div>
                    </div>
                </div>

                {isRejected && (
                    <div className="bg-red-50 p-4 rounded-lg border border-red-100 mb-4 flex items-start gap-3">
                        <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                        <div>
                            <h4 className="font-bold text-red-800 text-sm">{reg.progress_step === 1 ? 'Alasan Penolakan' : 'Alasan Gagal'}</h4>
                            <p className="text-red-600 text-sm mt-1">"{reg.admin_notes || 'Tidak ada catatan admin.'}"</p>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end flex-wrap gap-2 pt-2">
                    {/* Only show DETAIL if NOT Rejected */}
                    {!isRejected && (
                        <Link
                            href={`/dashboard/pencaker/pelatihan-saya/${reg.id}`}
                            className="w-full md:w-auto justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2.5 cursor-pointer"
                        >
                            <ExternalLink size={16} className="animate-pulse" />
                            <span>Lacak Status Pelatihan</span>
                        </Link>
                    )}

                    {/* Pending Buttons */}
                    {!isRejected && !isHistory && reg.status === 'PENDING' && (
                        <>
                            {/* Cancel Button - Only if Registration Period is Valid */}
                            {canCancel(reg) && (
                                <button
                                    onClick={() => handleCancel(reg)}
                                    className="px-3 py-2 border border-red-200 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 flex items-center gap-2 shadow-sm"
                                    disabled={isCancelling}
                                >
                                    {isCancelling ? 'Memproses...' : (
                                        <>
                                            <XCircle size={14} /> Batalkan Pendaftaran
                                        </>
                                    )}
                                </button>
                            )}

                            <button onClick={() => handlePrint(reg, 'registration')} className="px-3 py-2 border border-blue-200 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100 flex items-center gap-2 shadow-sm">
                                <FileText size={14} /> Tanda Daftar
                            </button>
                        </>
                    )}

                    {/* Accepted Buttons (Active or History) - If History, maybe they still want proofs? Usually yes. */}
                    {!isRejected && (reg.status === 'DITERIMA' || reg.status === 'APPROVED' || reg.status === 'VERIFIED' || reg.status === 'LULUS' || reg.status === 'SELESAI') && (
                        <>
                            <button onClick={() => handlePrint(reg, 'registration')} className="px-3 py-2 border border-blue-200 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100 flex items-center gap-2 shadow-sm">
                                <FileText size={14} /> Tanda Daftar
                            </button>
                            <button onClick={() => handlePrint(reg, 'acceptance')} className="px-3 py-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 flex items-center gap-2 shadow-sm">
                                <Download size={14} /> Download Bukti
                            </button>
                        </>
                    )}

                    {/* Rejected QA Button */}
                    {isRejected && (
                        <button
                            onClick={() => handleQADeleteRejection(reg)}
                            className="px-3 py-2 border border-orange-200 bg-orange-50 text-orange-600 rounded-lg text-xs font-bold hover:bg-orange-100 flex items-center gap-2 shadow-sm"
                            disabled={isCancelling}
                        >
                            {isCancelling ? 'Memproses...' : (
                                <>
                                    <XCircle size={14} /> Fitur QA: Hapus Penolakan
                                </>
                            )}
                        </button>
                    )}

                    {/* Finished QA Button */}
                    {(reg.status === 'LULUS' || reg.status === 'SELESAI') && (
                        <button
                            onClick={() => handleQADeleteFinished(reg)}
                            className="px-3 py-2 border border-orange-200 bg-orange-50 text-orange-600 rounded-lg text-xs font-bold hover:bg-orange-100 flex items-center gap-2 shadow-sm"
                            disabled={isCancelling}
                        >
                            {isCancelling ? 'Memproses...' : (
                                <>
                                    <XCircle size={14} /> Fitur QA: Hapus Riwayat Lulus
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20 animate-fade-in">
            <PageHeader 
                title="Pelatihan Saya" 
                description="Kelola pendaftaran dan riwayat pelatihan Anda." 
                backLink="/dashboard/pencaker" 
            />

            <div className="max-w-4xl mx-auto px-4 py-4">

                {activeRegistrations.length === 0 && historyRegistrations.length === 0 && passedRegistrations.length === 0 && rejectedRegistrations.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
                        {/* Empty State */}
                        <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <FileText size={40} />
                        </div>
                        <h3 className="text-gray-600 font-bold mb-2 text-lg">Belum Ada Pelatihan</h3>
                        <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">Anda belum mendaftar program pelatihan apapun. Mulai tingkatkan kompetensi Anda sekarang.</p>
                        <Link href="/dashboard/pencaker/programs" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                            <ExternalLink size={18} /> Cari Pelatihan
                        </Link>
                    </div>
                ) : (
                    <div>
                        {/* Tabs UI */}
                        <div className="flex overflow-x-auto no-scrollbar gap-2 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 sticky top-20 z-20">
                            <button 
                                onClick={() => setActiveTab('aktif')}
                                className={`flex-1 min-w-[120px] whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === 'aktif' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                <Clock size={16} /> Sedang Berjalan ({activeRegistrations.length})
                            </button>
                            <button 
                                onClick={() => setActiveTab('selesai')}
                                className={`flex-1 min-w-[120px] whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === 'selesai' ? 'bg-green-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                <CheckCircle size={16} /> Selesai ({passedRegistrations.length + historyRegistrations.length})
                            </button>
                            <button 
                                onClick={() => setActiveTab('gagal')}
                                className={`flex-1 min-w-[120px] whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === 'gagal' ? 'bg-red-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                <XCircle size={16} /> Ditolak / Gagal ({rejectedRegistrations.length})
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="space-y-4 animate-fade-in">
                            {activeTab === 'aktif' && (
                                activeRegistrations.length > 0 ? (
                                    activeRegistrations.map(reg => <TrainingCard key={reg.id} reg={reg} />)
                                ) : (
                                    <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-200 text-gray-400">
                                        <p>Tidak ada pelatihan yang sedang berjalan.</p>
                                    </div>
                                )
                            )}

                            {activeTab === 'selesai' && (
                                passedRegistrations.length > 0 || historyRegistrations.length > 0 ? (
                                    <>
                                        {passedRegistrations.map(reg => <TrainingCard key={reg.id} reg={reg} />)}
                                        {historyRegistrations.map(reg => <TrainingCard key={reg.id} reg={reg} isHistory={true} />)}
                                    </>
                                ) : (
                                    <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-200 text-gray-400">
                                        <p>Belum ada riwayat pelatihan selesai.</p>
                                    </div>
                                )
                            )}

                            {activeTab === 'gagal' && (
                                rejectedRegistrations.length > 0 ? (
                                    rejectedRegistrations.map(reg => <TrainingCard key={reg.id} reg={reg} isRejected={true} />)
                                ) : (
                                    <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-200 text-gray-400">
                                        <p>Tidak ada riwayat pelatihan ditolak atau gagal.</p>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

