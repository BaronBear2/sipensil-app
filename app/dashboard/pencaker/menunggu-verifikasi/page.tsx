'use client'

import { Clock, ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function MenungguVerifikasiPage() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 py-16 animate-fade-in">
                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-12 text-center relative overflow-hidden">

                    {/* Background Decoration */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-indigo-600"></div>
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner animate-pulse">
                            <Clock size={48} />
                        </div>

                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-4 tracking-tight">
                            Menunggu Verifikasi
                        </h1>

                        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
                            Terima kasih! Data pendaftaran Anda telah kami terima.
                            <br />
                            Saat ini, Tim Admin Dinas Ketenagakerjaan sedang melakukan verifikasi kelengkapan berkas dan persyaratan Anda.
                        </p>

                        <div className="bg-slate-50 rounded-2xl p-6 max-w-xl mx-auto border border-slate-200 mb-10">
                            <h3 className="font-bold text-slate-700 mb-4 border-b border-slate-200 pb-2">Estimasi Proses</h3>
                            <ul className="space-y-3 text-left max-w-sm mx-auto">
                                <li className="flex items-center gap-3 text-sm text-slate-600">
                                    <CheckCircle size={16} className="text-green-500" />
                                    <span>Verifikasi Administrasi (1-2 Hari Kerja)</span>
                                </li>
                                <li className="flex items-center gap-3 text-sm text-slate-600">
                                    <CheckCircle size={16} className="text-slate-300" />
                                    <span>Validasi Dokumen Fisik (Jika diperlukan)</span>
                                </li>
                                <li className="flex items-center gap-3 text-sm text-slate-600">
                                    <Clock size={16} className="text-blue-500" />
                                    <span>Penerbitan Bukti Pendaftaran</span>
                                </li>
                            </ul>
                        </div>

                        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                            <Link
                                href="/dashboard/pencaker"
                                className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                            >
                                <ArrowLeft size={18} /> Kembali ke Dashboard
                            </Link>
                            <Link
                                href="/dashboard/pencaker/profile"
                                className="px-8 py-3 bg-white text-slate-600 font-bold border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                            >
                                Cek Profil Saya
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
