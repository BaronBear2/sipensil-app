'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { ArrowLeft, Download, AlertCircle, RefreshCcw, FileText, CheckCircle, XCircle } from 'lucide-react'
import Modal from '@/components/ui/Modal' // Assuming we have a Modal component, if not I'll inline it or generic UI

export default function ImJapanHistoryPage() {
    const supabase = createClient()
    const [loading, setLoading] = useState(true)
    const [registrations, setRegistrations] = useState<any[]>([])
    // Modal State
    const [isReasonOpen, setIsReasonOpen] = useState(false)
    const [selectedReason, setSelectedReason] = useState('')

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data } = await supabase
                .from('im_japan_registrations')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (data) setRegistrations(data)
            setLoading(false)
        }
        fetchData()
    }, [])

    const accepted = registrations.filter(r => r.status === 'VERIFIED')
    const rejected = registrations.filter(r => r.status === 'REJECTED')
    const pending = registrations.filter(r => r.status === 'PENDING')

    return (
        <div className="min-h-screen bg-gray-50 font-sans animate-fade-in pb-20">
            {/* Navbar removed */}
            <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">

                <div className="mb-8">
                    <Link href="/dashboard/pencaker" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold mb-4 transition">
                        <ArrowLeft size={20} /> Kembali ke Dashboard
                    </Link>
                    <h1 className="text-3xl font-extrabold text-slate-800">
                        Riwayat Permohonan IM Japan
                    </h1>
                    <p className="text-slate-500 mt-1">Status pengajuan Surat Rekomendasi Tes IM Japan.</p>
                </div>

                {/* Section Pending (NEW V4) */}
                {pending.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
                        <div className="p-6 border-b bg-blue-50/50 flex items-center gap-3">
                            <RefreshCcw className="text-blue-600 animate-spin-slow" />
                            <h2 className="text-lg font-bold text-slate-800">Menunggu Verifikasi</h2>
                        </div>
                        <div className="divide-y">
                            {pending.map(item => (
                                <div key={item.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <div className="font-bold text-slate-800 mb-1">Permohonan Surat Rekomendasi Tes IM Japan</div>
                                        <div className="text-xs text-slate-500">Diajukan: {new Date(item.created_at).toLocaleDateString('id-ID')}</div>
                                    </div>
                                    {/* Action to Edit */}
                                    <Link href="/dashboard/pencaker/im-japan" className="flex items-center gap-2 bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 px-5 py-2.5 rounded-lg text-sm font-bold transition">
                                        Edit Berkas
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Section Accepted */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
                    <div className="p-6 border-b bg-green-50/50 flex items-center gap-3">
                        <CheckCircle className="text-green-600" />
                        <h2 className="text-lg font-bold text-slate-800">Permohonan Diterima</h2>
                    </div>

                    {accepted.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-sm">Belum ada permohonan yang diterima.</div>
                    ) : (
                        <div className="divide-y">
                            {accepted.map(item => (
                                <div key={item.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <div className="font-bold text-slate-800 mb-1">Surat Rekomendasi Tes IM Japan</div>
                                        <div className="text-xs text-slate-500">Disetujui: {new Date(item.updated_at).toLocaleDateString('id-ID')}</div>
                                    </div>
                                    <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-green-100 shadow-lg transition">
                                        <Download size={16} /> Download Surat
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Section Rejected */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b bg-red-50/50 flex items-center gap-3">
                        <XCircle className="text-red-600" />
                        <h2 className="text-lg font-bold text-slate-800">Permohonan Ditolak</h2>
                    </div>

                    {rejected.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-sm">Tidak ada permohonan yang ditolak.</div>
                    ) : (
                        <div className="divide-y">
                            {rejected.map(item => (
                                <div key={item.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-red-50/10">
                                    <div>
                                        <div className="font-bold text-slate-800 mb-1">Surat Rekomendasi Tes IM Japan</div>
                                        <div className="text-xs text-slate-500">Ditolak: {new Date(item.updated_at).toLocaleDateString('id-ID')}</div>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => { setSelectedReason(item.admin_notes || 'Tidak ada catatan.'); setIsReasonOpen(true) }}
                                            className="flex items-center gap-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-bold transition"
                                        >
                                            <AlertCircle size={16} /> Alasan Penolakan
                                        </button>
                                        <Link
                                            href="/dashboard/pencaker/im-japan"
                                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition shadow-blue-100 shadow-md"
                                        >
                                            <RefreshCcw size={16} /> Ajukan Ulang
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

            {/* Simple Modal for Reason */}
            {isReasonOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl scale-100 animate-scale-in">
                        <div className="flex items-center gap-3 mb-4 text-red-600">
                            <AlertCircle size={24} />
                            <h3 className="font-bold text-lg">Alasan Penolakan</h3>
                        </div>
                        <p className="text-slate-600 bg-red-50 p-4 rounded-xl border border-red-100 italic">
                            &quot;{selectedReason}&quot;
                        </p>
                        <button
                            onClick={() => setIsReasonOpen(false)}
                            className="mt-6 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
