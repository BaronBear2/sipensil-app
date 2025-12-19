'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { FileText, Calendar, MapPin, Clock, Download, ExternalLink, ArrowLeft, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function MyTrainingsPage() {
    const supabase = createClient()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [registrations, setRegistrations] = useState<any[]>([])

    useEffect(() => {
        const getData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.push('/auth/login'); return }

            const { data, error } = await supabase
                .from('training_registrations')
                .select('*, blk_trainings(*)')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (data) setRegistrations(data)
            setLoading(false)
        }
        getData()
    }, [])

    const handlePrint = (reg: any) => {
        // Simple Print Logic: Open a new window with print content
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
                            <p><strong>Tanggal Daftar:</strong> ${new Date(reg.created_at).toLocaleDateString()}</p>
                        </div>

                        <h3>Detail Pelatihan</h3>
                        <div class="box">
                            <p><strong>Program:</strong> ${reg.blk_trainings.title}</p>
                            <p><strong>Penyelenggara:</strong> ${reg.blk_trainings.provider}</p>
                            <p><strong>Lokasi:</strong> ${reg.blk_trainings.location || 'UPTD BLK Kabupaten Bekasi'}</p>
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

    if (loading) return <div className="p-10 text-center">Memuat riwayat pelatihan...</div>

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20 animate-fade-in">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/dashboard/pencaker" className="bg-white p-2 rounded-full border border-gray-200 hover:text-blue-600 transition">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Pelatihan Saya</h1>
                        <p className="text-gray-500 text-sm">Riwayat pendaftaran dan status seleksi.</p>
                    </div>
                </div>

                {registrations.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                        <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <FileText size={32} />
                        </div>
                        <h3 className="text-gray-600 font-bold mb-2">Belum ada pelatihan</h3>
                        <p className="text-gray-400 text-sm mb-4">Anda belum mendaftar program pelatihan apapun.</p>
                        <Link href="/dashboard/pencaker/programs" className="text-blue-600 font-bold text-sm hover:underline">
                            Cari Pelatihan
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {registrations.map((reg) => (
                            <div key={reg.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase mb-1 block">Program Pelatihan</span>
                                            <h3 className="text-lg font-bold text-gray-800">{reg.blk_trainings?.title}</h3>
                                            <p className="text-sm text-gray-500 font-medium flex items-center gap-1 mt-1">
                                                <MapPin size={14} /> {reg.blk_trainings?.provider}
                                            </p>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${reg.status === 'APPROVED' ? 'bg-green-100 text-green-700 border-green-200' :
                                                reg.status === 'REJECTED' ? 'bg-red-100 text-red-700 border-red-200' :
                                                    'bg-yellow-100 text-yellow-700 border-yellow-200'
                                            }`}>
                                            {reg.status}
                                        </div>
                                    </div>

                                    {/* Dates Info (V5.1-04) - Checking schema dynamically next step if needed, but assuming standard display for now */}
                                    <div className="flex gap-4 text-sm text-gray-500 mb-6 border-y py-3 bg-gray-50/50 px-4 -mx-6">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-blue-500" />
                                            Daftar: {new Date(reg.created_at).toLocaleDateString()}
                                        </div>
                                        {/* TODO: Add Reg Start/End from training data if available */}
                                    </div>

                                    {/* REJECTION MESSAGE */}
                                    {reg.status === 'REJECTED' && (
                                        <div className="bg-red-50 p-4 rounded-lg border border-red-100 mb-4 flex items-start gap-3">
                                            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                                            <div>
                                                <h4 className="font-bold text-red-800 text-sm">Pendaftaran Ditolak</h4>
                                                <p className="text-red-600 text-sm mt-1">"{reg.admin_notes || 'Tidak ada catatan admin.'}"</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-3 pt-2">
                                        <Link href={`/dashboard/pencaker/training/${reg.blk_trainings?.id}`} className="px-4 py-2 border rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-2">
                                            <ExternalLink size={16} /> Detail Info
                                        </Link>

                                        {(reg.status === 'PENDING' || reg.status === 'APPROVED') && (
                                            <button onClick={() => handlePrint(reg)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 flex items-center gap-2 shadow-sm">
                                                <Download size={16} /> Download Tanda Daftar
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
