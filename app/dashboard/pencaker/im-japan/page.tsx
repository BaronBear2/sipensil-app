'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Upload, FileText, CheckCircle, AlertTriangle, Download, ArrowLeft, Clock, Info } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function ImJapanPage() {
    const supabase = createClient()
    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [data, setData] = useState<any>(null) // Existing registration
    const [profile, setProfile] = useState<any>(null)

    // Fetch Data
    useEffect(() => {
        const getData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.push('/auth/login'); return }

            // 1. Cek Profile
            const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
            setProfile(prof)

            // 2. Cek Existing Registration
            const { data: reg } = await supabase.from('im_japan_registrations').select('*').eq('user_id', user.id).maybeSingle()
            if (reg) setData(reg)

            setLoading(false)
        }
        getData()
    }, [])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!profile) return

        // Validasi Profil Basic
        if (profile.account_status !== 'verified') {
            alert("Mohon verifikasi profil akun Anda terlebih dahulu sebelum mendaftar IM Japan.")
            return
        }

        if (!confirm("Pastikan data & berkas sudah benar. Ajukan pendaftaran?")) return

        setSubmitting(true)
        const form = new FormData(e.currentTarget)
        // Upload Mock (Simulasi Path)
        // Real implementation needs storage bucket upload
        const mockFileUrl = `https://example.com/berkas_imjapan_${profile.nik}.pdf`

        const payload = {
            user_id: profile.id,
            batch: form.get('batch'),
            document_path: mockFileUrl,
            status: 'PENDING',
            admin_notes: null
        }

        let error;
        if (data) {
            // Update (Revisi)
            const { error: err } = await supabase.from('im_japan_registrations').update(payload).eq('id', data.id)
            error = err
        } else {
            // Insert Baru
            const { error: err } = await supabase.from('im_japan_registrations').insert(payload)
            error = err
        }

        if (error) {
            alert("Gagal mengirim: " + error.message)
        } else {
            alert("Berhasil mendaftar Program IM Japan! Menunggu verifikasi admin.")
            window.location.reload()
        }
        setSubmitting(false)
    }

    if (loading) return <div className="p-10 text-center">Memuat...</div>

    return (
        <div className="min-h-screen bg-gray-50 font-sans animate-fade-in pb-20">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 py-8">

                {/* Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
                            <span className="text-3xl">🇯🇵</span> Program IM Japan
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">Program Pemagangan ke Jepang (Kerjasama Pemerintah)</p>
                    </div>
                    <Link href="/dashboard/pencaker" className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-blue-600 bg-gray-100 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors">
                        <ArrowLeft size={16} /> Kembali ke Dashboard
                    </Link>
                </div>

                {/* ERROR / REJECTION CARD */}
                {data?.status === 'REJECTED' && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-xl mb-8 shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className="bg-red-100 p-2 rounded-full text-red-600 shrink-0">
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-red-800 text-lg">Pendaftaran Ditolak</h3>
                                <p className="text-red-700 mt-1 font-medium bg-red-100/50 p-3 rounded-lg border border-red-200">
                                    &quot; {data.admin_notes} &quot;
                                </p>
                                <p className="text-sm text-red-600 mt-3 font-bold flex items-center gap-1">
                                    <Info size={14} /> Silakan perbaiki berkas Anda sesuai catatan dan ajukan ulang di bawah ini.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* SUCCESS / VERIFIED CARD */}
                {data?.status === 'VERIFIED' && (
                    <div className="bg-white border border-green-200 rounded-2xl p-8 mb-8 shadow-sm text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="text-green-600 w-10 h-10" />
                        </div>
                        <h3 className="font-bold text-gray-900 text-2xl mb-2">Selamat! Pendaftaran Diterima</h3>
                        <p className="text-gray-600 mb-8 max-w-lg mx-auto">
                            Anda telah lolos verifikasi administrasi. Langkah selanjutnya adalah mengikuti tes fisik dan matematika.
                            Silakan unduh Surat Pengantar di bawah ini untuk dibawa saat tes.
                        </p>

                        <a href="#" className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-200 transition-transform hover:-translate-y-1">
                            <Download size={20} /> Download Surat Pengantar Tes
                        </a>
                    </div>
                )}

                {/* PENDING STATUS */}
                {data?.status === 'PENDING' && (
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 mb-8 text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock className="text-blue-600 w-8 h-8" />
                        </div>
                        <h3 className="font-bold text-blue-900 text-xl mb-2">Pendaftaran Sedang Diverifikasi</h3>
                        <p className="text-blue-700">Data dan berkas Anda sedang diperiksa oleh Admin Dinas. Mohon menunggu 3-5 hari kerja.</p>
                    </div>
                )}

                {/* FORM PENDAFTARAN (Hanya muncul jika Belum Daftar atau Ditolak) */}
                {(!data || data.status === 'REJECTED') && (
                    <div className="grid md:grid-cols-3 gap-8 items-start">

                        {/* SIDEBAR: INFORMASI SYARAT */}
                        <div className="md:col-span-1">
                            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm sticky top-24">
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <FileText size={18} className="text-blue-600" /> Dokumen Syarat
                                </h3>
                                <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                                    Mohon siapkan hasil <strong>SCAN ASLI</strong> dari dokumen berikut ini. Jika dokumen asli hilang, boleh gunakan legalisir.
                                </p>
                                <ul className="space-y-3 text-xs font-medium text-gray-700">
                                    {[
                                        "KTP (Kartu Tanda Penduduk)",
                                        "Ijazah Terakhir",
                                        "Akta Kelahiran",
                                        "Kartu Keluarga (KK)",
                                        "Surat Rekomendasi LPK",
                                        "Surat Rekomendasi Kementrian",
                                        "Surat Keterangan RT/RW",
                                        "Surat Izin Orang Tua"
                                    ].map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <div className="mt-0.5 bg-blue-100 text-blue-600 rounded-full w-4 h-4 flex items-center justify-center text-[10px] shrink-0">{idx + 1}</div>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-6 pt-4 border-t border-gray-100">
                                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                                        <p className="text-[10px] text-yellow-800 font-bold mb-1 flex items-center gap-1">
                                            <Info size={10} /> PENTING
                                        </p>
                                        <p className="text-[10px] text-yellow-700 leading-tight">
                                            Satukan semua dokumen di atas menjadi <strong>1 File PDF</strong>. Ukuran maksimal 5MB.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* FORM AREA */}
                        <div className="md:col-span-2">
                            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                                <h3 className="font-bold text-gray-800 text-xl mb-6">Formulir Pendaftaran</h3>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Pilih Batch Seleksi</label>
                                        <div className="relative">
                                            <select name="batch" defaultValue={data?.batch} required className="w-full appearance-none border border-gray-300 rounded-xl p-4 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-700">
                                                <option value="">-- Pilih Batch Keberangkatan --</option>
                                                <option value="Batch 1/2025">Batch 1 / 2025 (Januari - Maret)</option>
                                                <option value="Batch 2/2025">Batch 2 / 2025 (April - Juni)</option>
                                            </select>
                                            <div className="absolute right-4 top-4 pointer-events-none text-gray-500">▼</div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Upload Berkas Lengkap (PDF)</label>

                                        <div className="relative border-2 border-dashed border-blue-200 rounded-xl p-8 text-center bg-blue-50/50 hover:bg-blue-50 transition cursor-pointer group">
                                            <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                                                <Upload className="text-blue-500" size={28} />
                                            </div>
                                            <p className="text-base font-bold text-blue-900 mb-1">Klik untuk upload berkas</p>
                                            <p className="text-sm text-gray-500">Format PDF. Maksimal 5MB.</p>
                                            <input type="file" required={!data} accept=".pdf" className="opacity-0 absolute inset-0 cursor-pointer w-full h-full" />
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2 text-center">
                                            *Pastikan semua 8 dokumen sudah tergabung dalam file ini.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-gray-100">
                                    <button disabled={submitting} type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-200 hover:bg-blue-700 transition active:scale-95 disabled:bg-gray-300 disabled:shadow-none disabled:pointer-events-none">
                                        {submitting ? 'Sedang Mengirim...' : (data ? 'Kirim Revisi Pendaftaran' : 'Ajukan Pendaftaran')}
                                    </button>
                                </div>
                            </form>
                        </div>

                    </div>
                )}

            </div>
        </div>
    )
}
