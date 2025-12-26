'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { FileText, Calendar, MapPin, Clock, Download, ExternalLink, ArrowLeft, AlertCircle, CheckCircle, XCircle, History } from 'lucide-react'
import Link from 'next/link'

// Helper to format date
const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function MyTrainingsPage() {
    const supabase = createClient()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [activeRegistrations, setActiveRegistrations] = useState<any[]>([])
    const [historyRegistrations, setHistoryRegistrations] = useState<any[]>([])
    const [rejectedRegistrations, setRejectedRegistrations] = useState<any[]>([])

    useEffect(() => {
        const getData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.push('/auth/login'); return }

            const { data, error } = await supabase
                .from('training_registrations')
                .select('*, blk_trainings(*)')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (data) {
                const now = new Date()

                const active = []
                const history = []
                const rejected = []

                for (const reg of data) {
                    const status = reg.status

                    if (status === 'DITOLAK' || status === 'REJECTED') {
                        rejected.push(reg)
                    } else if (status === 'SELESAI') {
                        // Already marked finished by system
                        history.push(reg)
                    } else if (status === 'DITERIMA' || status === 'APPROVED' || status === 'VERIFIED') {
                        // Double check if training ended but cron hasn't run yet?
                        // Optional: rely on status. If status is DITERIMA, it is active.
                        active.push(reg)
                    } else {
                        // Pending
                        active.push(reg)
                    }
                }

                setActiveRegistrations(active)
                setHistoryRegistrations(history)
                setRejectedRegistrations(rejected)
            }
            setLoading(false)
        }
        getData()
    }, [])

    const handlePrint = (reg: any) => {
        const printWindow = window.open('', '_blank')
        if (printWindow) {
            printWindow.document.write(`
                <html>
                <head>
                    <title>Tanda Daftar Pelatihan - SIPENSIL</title>
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
                        <h2>TANDA BUKTI PENDAFTARAN</h2>
                        <h3>SIPENSIL - Dinas Ketenagakerjaan Kab. Bekasi</h3>
                    </div>
                    <div class="content">
                        <p>Terima kasih telah mendaftar pada program pelatihan BLK. Simpan dokumen ini sebagai bukti pendaftaran.</p>
                        
                        <div class="box">
                            <p><strong>Nama Peserta:</strong> ${reg.full_name || '-'}</p>
                            <p><strong>NIK:</strong> ${reg.nik || '-'}</p>
                            <p><strong>No. Pendaftaran:</strong> #${reg.id.slice(0, 8).toUpperCase()}</p>
                            <p><strong>Tanggal Daftar:</strong> ${formatDate(reg.created_at)}</p>
                        </div>

                        <h3>Detail Pelatihan</h3>
                        <div class="box">
                            <p><strong>Program:</strong> ${reg.blk_trainings.title}</p>
                            <p><strong>Penyelenggara:</strong> ${reg.blk_trainings.provider}</p>
                            <p><strong>Lokasi:</strong> ${reg.blk_trainings.location || 'UPTD BLK Kabupaten Bekasi'}</p>
                            <p><strong>Pelaksanaan:</strong> ${formatDate(reg.blk_trainings.training_start_date)} s/d ${formatDate(reg.blk_trainings.training_end_date)}</p>
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
                    {isHistory ? (
                        <div className="px-3 py-1 rounded-full text-xs font-bold border bg-gray-100 text-gray-600 border-gray-200 flex items-center gap-1">
                            <CheckCircle size={12} /> Selesai
                        </div>
                    ) : isRejected ? (
                        <div className="px-3 py-1 rounded-full text-xs font-bold border bg-red-100 text-red-700 border-red-200 flex items-center gap-1">
                            <XCircle size={12} /> Ditolak
                        </div>
                    ) : (
                        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${reg.status === 'DITERIMA' || reg.status === 'APPROVED' || reg.status === 'VERIFIED'
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                            }`}>
                            {reg.status === 'PENDING' ? 'Menunggu Verifikasi' : reg.status}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 mb-6 border-y py-3 bg-gray-50/50 px-4 -mx-6">
                    <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-blue-500" />
                        <div>
                            <span className="text-[10px] text-gray-400 block">Tanggal Daftar</span>
                            {formatDate(reg.created_at)}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock size={14} className="text-orange-500" />
                        <div>
                            <span className="text-[10px] text-gray-400 block">Selesai Pelatihan</span>
                            {reg.blk_trainings?.training_end_date ? formatDate(reg.blk_trainings.training_end_date) : '-'}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                        <Calendar size={14} className="text-teal-500" />
                        <div>
                            <span className="text-[10px] text-gray-400 block">Mulai Pelatihan</span>
                            {formatDate(reg.blk_trainings?.training_start_date)}
                        </div>
                    </div>
                </div>

                {isRejected && (
                    <div className="bg-red-50 p-4 rounded-lg border border-red-100 mb-4 flex items-start gap-3">
                        <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                        <div>
                            <h4 className="font-bold text-red-800 text-sm">Alasan Penolakan</h4>
                            <p className="text-red-600 text-sm mt-1">"{reg.admin_notes || 'Tidak ada catatan admin.'}"</p>
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                    {/* Only show buttons for non-rejected, active items or if history details needed */}
                    {!isRejected && (
                        <Link href={`/dashboard/pencaker/training/${reg.blk_trainings?.id}`} className="px-4 py-2 border rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-2">
                            <ExternalLink size={16} /> Detail
                        </Link>
                    )}

                    {!isRejected && !isHistory && (reg.status === 'DITERIMA' || reg.status === 'APPROVED' || reg.status === 'VERIFIED') && (
                        <button onClick={() => handlePrint(reg)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 flex items-center gap-2 shadow-sm">
                            <Download size={16} /> Unduh Bukti
                        </button>
                    )}
                </div>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20 animate-fade-in">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/dashboard/pencaker" className="bg-white p-2 rounded-full border border-gray-200 hover:text-blue-600 transition">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Pelatihan Saya</h1>
                        <p className="text-gray-500 text-sm">Kelola pendaftaran dan riwayat pelatihan Anda.</p>
                    </div>
                </div>

                {activeRegistrations.length === 0 && historyRegistrations.length === 0 && rejectedRegistrations.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
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
                    <div className="space-y-10">
                        {/* SECTION 1: ACTIVE */}
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                    <Clock size={16} />
                                </span>
                                <h2 className="text-lg font-bold text-gray-800">Pelatihan Saya Saat Ini</h2>
                            </div>
                            {activeRegistrations.length > 0 ? (
                                <div className="space-y-4">
                                    {activeRegistrations.map(reg => <TrainingCard key={reg.id} reg={reg} />)}
                                </div>
                            ) : (
                                <p className="text-gray-400 text-sm italic ml-10">Tidak ada pelatihan aktif.</p>
                            )}
                        </section>

                        {/* SECTION 2: HISTORY */}
                        {(historyRegistrations.length > 0) && (
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                        <History size={16} />
                                    </span>
                                    <h2 className="text-lg font-bold text-gray-800">Riwayat Pelatihan</h2>
                                </div>
                                <div className="space-y-4">
                                    {historyRegistrations.map(reg => <TrainingCard key={reg.id} reg={reg} isHistory={true} />)}
                                </div>
                            </section>
                        )}

                        {/* SECTION 3: REJECTED */}
                        {(rejectedRegistrations.length > 0) && (
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                                        <XCircle size={16} />
                                    </span>
                                    <h2 className="text-lg font-bold text-gray-800">Pelatihan Ditolak</h2>
                                </div>
                                <div className="space-y-4">
                                    {rejectedRegistrations.map(reg => <TrainingCard key={reg.id} reg={reg} isRejected={true} />)}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

