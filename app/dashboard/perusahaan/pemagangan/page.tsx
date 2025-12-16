'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Upload, FileText, CheckCircle, AlertTriangle, Download, ArrowLeft, Building, Clock } from 'lucide-react'
import Link from 'next/link'

export default function MagangPage() {
    const supabase = createClient()
    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [data, setData] = useState<any>(null) // Existing application
    const [profile, setProfile] = useState<any>(null)

    // Fetch Data
    useEffect(() => {
        const getData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.push('/auth/login'); return }

            // 1. Cek User Profile
            // Check if user is Perusahaan
            const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()

            if (prof.role !== 'ADMIN_PERUSAHAAN' && prof.role !== 'PERUSAHAAN') {
                // Fallback verify for robustness
                alert(`AKSES DITOLAK: Akun Anda terdaftar sebagai '${prof.role}', bukan 'ADMIN_PERUSAHAAN'.`)
                router.push('/dashboard')
                return
            }

            setProfile(prof)

            // 2. Cek Existing Magang Registration (Last one or active one)
            // For simplicity, we assume 1 active application for now or sort by latest
            const { data: reg } = await supabase.from('magang_permits').select('*').eq('company_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle()
            if (reg) setData(reg)

            setLoading(false)
        }
        getData()
    }, [])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!profile) return

        if (!confirm("Ajukan Permohonan Pencatatan Perjanjian Pemagangan?")) return

        setSubmitting(true)
        const form = new FormData(e.currentTarget)

        // Mock Upload
        const mockFileUrl = `https://example.com/berkas_magang_${profile.company_name}.pdf`

        const payload = {
            company_id: profile.id,
            start_date: form.get('start_date'),
            end_date: form.get('end_date'),
            participant_count: form.get('participant_count'),
            document_path: mockFileUrl,
            status: 'PENDING',
            rejection_reason: null
        }

        let error;

        // Logic: If previous was REJECTED, we can update it OR insert new. 
        // Usually resubmission updates the record to keep history clean or creates new.
        // Let's UPDATE if data exists and is REJECTED to "Revising".
        if (data && data.status === 'REJECTED') {
            const { error: err } = await supabase.from('magang_permits').update(payload).eq('id', data.id)
            error = err
        } else {
            // Insert Baru
            const { error: err } = await supabase.from('magang_permits').insert(payload)
            error = err
        }

        if (error) {
            alert("Gagal mengirim: " + error.message)
        } else {
            alert("Permohonan berhasil dikirim! Menunggu verifikasi Dinas.")
            window.location.reload()
        }
        setSubmitting(false)
    }

    if (loading) return <div className="p-10 text-center">Memuat...</div>

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 font-sans animate-fade-in">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm border p-6 mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <Building className="text-purple-600" /> Perjanjian Pemagangan
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">Layanan Pencatatan Perjanjian Pemagangan Dalam Negeri</p>
                    </div>
                    <Link href="/dashboard/perusahaan" className="bg-gray-100 p-2 rounded-full hover:bg-gray-200"><ArrowLeft /></Link>
                </div>

                {/* STATUS CARDS */}
                {data?.status === 'REJECTED' && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-r-xl mb-6 shadow-sm">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="text-red-500 mt-1" size={24} />
                            <div>
                                <h3 className="font-bold text-red-800 text-lg">Permohonan Ditolak</h3>
                                <p className="text-red-700 mt-1 font-medium">Alasan: "{data.rejection_reason}"</p>
                                <p className="text-sm text-red-600 mt-2">Silakan perbaiki data dan ajukan ulang.</p>
                            </div>
                        </div>
                    </div>
                )}

                {data?.status === 'APPROVED' && (
                    <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-xl mb-6 shadow-sm text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="text-green-600 w-8 h-8" />
                        </div>
                        <h3 className="font-bold text-green-800 text-xl mb-2">Permohonan Disetujui</h3>
                        <p className="text-green-700 mb-6">Surat Tanda Bukti Pencatatan Perjanjian Pemagangan telah terbit.</p>

                        <a href={`/api/generate-word/magang-agreement?id=${data.id}`} target="_blank" className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 shadow-md transition-transform hover:scale-105">
                            <Download size={20} /> Download Surat (Word)
                        </a>
                    </div>
                )}

                {data?.status === 'PENDING' && (
                    <div className="bg-purple-50 border-l-4 border-purple-500 p-6 rounded-r-xl mb-6 shadow-sm flex items-center gap-4">
                        <Clock className="text-purple-500 w-10 h-10" />
                        <div>
                            <h3 className="font-bold text-purple-800 text-lg">Menunggu Verifikasi</h3>
                            <p className="text-purple-600">Permohonan Anda sedang diperiksa oleh Dinas Ketenagakerjaan.</p>
                        </div>
                    </div>
                )}

                {/* FORM PERMOHONAN (Hanya muncul jika Belum Ada atau Ditolak) */}
                {(!data || data.status === 'REJECTED') && (
                    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border p-8">
                        <h3 className="font-bold text-gray-800 text-lg mb-6 border-b pb-2">Formulir Pengajuan</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Tanggal Mulai Magang</label>
                                <input type="date" name="start_date" required defaultValue={data?.start_date} className="w-full border rounded-lg p-3 bg-gray-50 focus:ring-2 focus:ring-purple-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Tanggal Selesai</label>
                                <input type="date" name="end_date" required defaultValue={data?.end_date} className="w-full border rounded-lg p-3 bg-gray-50 focus:ring-2 focus:ring-purple-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Jumlah Peserta</label>
                                <input type="number" name="participant_count" placeholder="0" required defaultValue={data?.participant_count} className="w-full border rounded-lg p-3 bg-gray-50 focus:ring-2 focus:ring-purple-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Dokumen Perjanjian (.pdf)</label>
                                <div className="border border-dashed border-gray-300 rounded-lg p-3 bg-gray-50 text-center cursor-pointer hover:bg-gray-100">
                                    <span className="text-sm text-gray-500 flex items-center justify-center gap-2"><Upload size={16} /> Upload File</span>
                                </div>
                            </div>
                        </div>

                        <button disabled={submitting} type="submit" className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-purple-700 transition disabled:bg-gray-400">
                            {submitting ? 'Mengirim Data...' : (data ? 'Kirim Revisi Permohonan' : 'Kirim Permohonan')}
                        </button>

                        {data && (
                            <p className="text-xs text-gray-400 mt-4 text-center">Mengirim ulang akan mengupdate data permohonan sebelumnya.</p>
                        )}
                    </form>
                )}

                {/* HISTORY JIKA ADA (Optional future feature, current request implies simple flow) */}
            </div>
        </div>
    )
}
