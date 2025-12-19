'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Upload, FileText, CheckCircle, AlertTriangle, Download, ArrowLeft, Building, Clock, Plus, Trash2, Save, Send } from 'lucide-react'
import Link from 'next/link'

export default function MagangPage() {
    const supabase = createClient()
    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [data, setData] = useState<any>(null)
    const [profile, setProfile] = useState<any>(null)

    // Excel-like Grid State
    const [participants, setParticipants] = useState<any[]>([])

    // Fetch Data
    useEffect(() => {
        const getData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.push('/auth/login'); return }

            const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()

            if (prof.role !== 'ADMIN_PERUSAHAAN' && prof.role !== 'PERUSAHAAN') {
                alert(`AKSES DITOLAK: Akun Anda terdaftar sebagai '${prof.role}', bukan 'ADMIN_PERUSAHAAN'.`)
                router.push('/dashboard')
                return
            }

            setProfile(prof)

            // Cek Existing
            const { data: reg } = await supabase.from('magang_permits').select('*').eq('company_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle()

            if (reg) {
                setData(reg)
                // Load participants if exists
                if (reg.participants_data && Array.isArray(reg.participants_data)) {
                    setParticipants(reg.participants_data)
                } else {
                    // Initialize empty row
                    setParticipants([{ name: '', nik: '', gender: 'L', position: '' }])
                }
            } else {
                setParticipants([{ name: '', nik: '', gender: 'L', position: '' }])
            }

            setLoading(false)
        }
        getData()
    }, [])

    // Grid Handlers
    const handleGridChange = (index: number, field: string, value: string) => {
        const newP = [...participants]
        newP[index] = { ...newP[index], [field]: value }
        setParticipants(newP)
    }

    const addRow = () => {
        setParticipants([...participants, { name: '', nik: '', gender: 'L', position: '' }])
    }

    const removeRow = (index: number) => {
        const newP = [...participants]
        newP.splice(index, 1)
        setParticipants(newP)
    }

    const handleSave = async (isDraft: boolean) => {
        if (!profile) return

        // Validation for Submission
        if (!isDraft) {
            if (participants.length === 0 || !participants[0].name) {
                alert("Mohon isi data peserta minimal 1 orang.")
                return
            }
            if (!confirm("Kirim Permohonan ke Dinas? Data tidak dapat diubah setelah dikirim.")) return
        }

        setSubmitting(true)

        // Mock Document (In real app, handle file upload separately or here)
        // For Draft, document might be optional. For Submit, mandatory (we'll check usage).
        const form = document.querySelector('#magangForm') as HTMLFormElement
        const formData = new FormData(form)
        const mockFileUrl = `https://example.com/berkas_magang_${profile.company_name}.pdf` // Reuse logic
        // If file input has file, ideally upload. Skipping for speed/mock.

        const payload = {
            company_id: profile.id,
            start_date: formData.get('start_date'),
            end_date: formData.get('end_date'),
            participant_count: participants.length,
            participants_data: participants, // JSONB
            document_path: mockFileUrl,
            status: isDraft ? 'DRAFT' : 'PENDING', // If Save Draft -> DRAFT.
            rejection_reason: null
        }

        let error;
        // Upsert Logic
        if (data && data.status !== 'APPROVED') {
            // Update existing ID
            const { error: err } = await supabase.from('magang_permits').update(payload).eq('id', data.id)
            error = err
        } else {
            // Insert New
            const { error: err } = await supabase.from('magang_permits').insert(payload)
            error = err
        }

        if (error) {
            alert("Gagal: " + error.message)
        } else {
            alert(isDraft ? "Draft berhasil disimpan." : "Permohonan berhasil dikirim!")
            window.location.reload()
        }
        setSubmitting(false)
    }

    if (loading) return <div className="p-10 text-center text-gray-400">Memuat Pemagangan...</div>

    const isLocked = data?.status === 'PENDING' || data?.status === 'APPROVED'

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 font-sans animate-fade-in">
            <div className="max-w-5xl mx-auto">

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
                                <h3 className="font-bold text-red-800 text-lg">Permohonan Ditolak / Perlu Revisi</h3>
                                <p className="text-red-700 mt-1 font-medium">Catatan: "{data.rejection_reason}"</p>
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

                {/* FORM AREA */}
                {(!isLocked) && (
                    <form id="magangForm" onSubmit={(e) => e.preventDefault()} className="bg-white rounded-xl shadow-lg border p-8 space-y-8">

                        {/* 1. DATA UMUM */}
                        <div>
                            <h3 className="font-bold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2"><FileText size={18} /> Detail Program</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Tanggal Mulai</label>
                                    <input type="date" name="start_date" defaultValue={data?.start_date} className="w-full border rounded-lg p-2.5 bg-gray-50 focus:ring-2 focus:ring-purple-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Tanggal Selesai</label>
                                    <input type="date" name="end_date" defaultValue={data?.end_date} className="w-full border rounded-lg p-2.5 bg-gray-50 focus:ring-2 focus:ring-purple-500 outline-none" />
                                </div>
                            </div>
                        </div>

                        {/* 2. DATA PESERTA (EXCEL LIKE UI) */}
                        <div>
                            <div className="flex justify-between items-center border-b pb-2 mb-4">
                                <h3 className="font-bold text-gray-800 flex items-center gap-2"><Building size={18} /> Data Peserta Magang</h3>
                                <span className="text-xs font-bold bg-purple-100 text-purple-700 px-2 py-1 rounded">Total: {participants.length} Orang</span>
                            </div>

                            <div className="overflow-x-auto border rounded-xl">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-100 text-xs text-gray-700 uppercase font-bold">
                                        <tr>
                                            <th className="px-4 py-3 w-10 text-center">No</th>
                                            <th className="px-4 py-3 min-w-[200px]">Nama Lengkap</th>
                                            <th className="px-4 py-3 w-40">NIK</th>
                                            <th className="px-4 py-3 w-32">Gender</th>
                                            <th className="px-4 py-3 min-w-[150px]">Jabatan / Posisi</th>
                                            <th className="px-4 py-3 w-16 text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {participants.map((p, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-2 text-center text-gray-500">{idx + 1}</td>
                                                <td className="px-4 py-2">
                                                    <input
                                                        value={p.name}
                                                        onChange={(e) => handleGridChange(idx, 'name', e.target.value)}
                                                        placeholder="Nama Peserta"
                                                        className="w-full bg-transparent border-gray-300 focus:bg-white focus:ring-1 focus:ring-purple-500 rounded px-2 py-1 outline-none"
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input
                                                        value={p.nik}
                                                        onChange={(e) => handleGridChange(idx, 'nik', e.target.value)}
                                                        placeholder="16 Digit NIK"
                                                        maxLength={16}
                                                        className="w-full bg-transparent border-gray-300 focus:bg-white focus:ring-1 focus:ring-purple-500 rounded px-2 py-1 outline-none"
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <select
                                                        value={p.gender}
                                                        onChange={(e) => handleGridChange(idx, 'gender', e.target.value)}
                                                        className="w-full bg-transparent border-gray-300 focus:bg-white focus:ring-1 focus:ring-purple-500 rounded px-2 py-1 outline-none appearance-none"
                                                    >
                                                        <option value="L">Laki-laki</option>
                                                        <option value="P">Perempuan</option>
                                                    </select>
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input
                                                        value={p.position}
                                                        onChange={(e) => handleGridChange(idx, 'position', e.target.value)}
                                                        placeholder="Posisi Magang"
                                                        className="w-full bg-transparent border-gray-300 focus:bg-white focus:ring-1 focus:ring-purple-500 rounded px-2 py-1 outline-none"
                                                    />
                                                </td>
                                                <td className="px-4 py-2 text-center">
                                                    <button type="button" onClick={() => removeRow(idx)} className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded transition">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <button type="button" onClick={addRow} className="mt-3 text-sm font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 hover:bg-purple-50 px-3 py-2 rounded-lg transition self-start w-fit">
                                <Plus size={16} /> Tamah Baris Peserta
                            </button>
                        </div>

                        {/* 3. DOKUMEN & SUBMIT */}
                        <div className="pt-4 border-t">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Upload Dokumen Perjanjian (PDF)</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50 text-center cursor-pointer hover:bg-purple-50 hover:border-purple-300 transition-colors group">
                                <Upload size={32} className="mx-auto text-gray-400 group-hover:text-purple-500 mb-2 transition-colors" />
                                <span className="text-sm font-bold text-gray-500 group-hover:text-purple-600 transition-colors">Klik untuk upload dokumen perjanjian yang telah ditandatangani</span>
                                <input type="file" name="document" className="hidden" />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => handleSave(true)}
                                disabled={submitting}
                                className="px-6 py-3 rounded-xl border-2 border-gray-200 font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-300 flex items-center gap-2 transition disabled:opacity-50"
                            >
                                <Save size={20} /> Simpan Draft
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSave(false)}
                                disabled={submitting}
                                className="px-6 py-3 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 shadow-lg hover:shadow-purple-500/30 flex items-center gap-2 transition disabled:opacity-50"
                            >
                                <Send size={20} /> Kirim Permohonan
                            </button>
                        </div>

                    </form>
                )}
            </div>
        </div>
    )
}
