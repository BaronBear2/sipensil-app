'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Plus, Trash2, Users, FileText, Info, ChevronRight, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { submitMagangRecord } from '@/actions/magang'
import { createClient } from '@/utils/supabase/client'
import Modal from '@/components/ui/Modal'
import StatusModal from '@/components/ui/StatusModal'

export default function CreateMagangRecordPage() {
    const supabase = createClient()
    const router = useRouter()
    const [loading, setLoading] = useState(false) // For Submit button
    const [pageLoading, setPageLoading] = useState(true) // For Profile Check
    const [title, setTitle] = useState('')

    // Modals
    const [statusModal, setStatusModal] = useState<{ isOpen: boolean, type: 'success' | 'error', message: string }>({
        isOpen: false, type: 'success', message: ''
    })
    const [confirmModal, setConfirmModal] = useState(false)

    // Initial Empty Row
    const emptyRow = {
        nik: '',
        name: '',
        phone: '',
        email: '',
        gender: 'L',
        address: '',
        place_of_birth: '',
        date_of_birth: '',
        division: '',
        duration: '',
        start_date: '',
        end_date: '',
        post_activity: ''
    }

    const [rows, setRows] = useState<any[]>([{ ...emptyRow }])
    const [currentRowToRemove, setCurrentRowToRemove] = useState<number | null>(null) // For delete confirmation if needed (optional, keeping simple delete for now or modal?) -> Let's keep simple delete for rows to be fast, but maybe confirm submit.

    // 1. CHECK PROFILE COMPLETENESS
    useEffect(() => {
        const checkProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.push('/auth/login'); return }

            const { data: profile } = await supabase.from('profiles').select('*, profile_perusahaan(*)').eq('id', user.id).single()

            if (profile) {
                const comp = profile.profile_perusahaan
                // List required fields
                const isComplete = comp && comp.company_name && comp.nib && comp.address_office && comp.phone

                if (!isComplete) {
                    // Redirect to profile with alert
                    router.push('/dashboard/perusahaan/profile?alert=complete_profile')
                    return
                }
            }
            setPageLoading(false)
        }
        checkProfile()
    }, [])

    const handleAddRow = () => {
        setRows([...rows, { ...emptyRow }])
    }

    const handleRemoveRow = (index: number) => {
        if (rows.length === 1) {
            setStatusModal({ isOpen: true, type: 'error', message: "Minimal satu baris data." })
            return
        }
        const newRows = [...rows]
        newRows.splice(index, 1)
        setRows(newRows)
    }

    const handleChange = (index: number, field: string, value: string) => {
        const newRows = [...rows]
        newRows[index][field] = value
        setRows(newRows)
    }

    const validateAndPrompt = () => {
        if (!title.trim()) {
            setStatusModal({ isOpen: true, type: 'error', message: "Mohon isi Judul Pencatatan (Contoh: Magang Batch 1 2024)" })
            return
        }

        for (const row of rows) {
            if (!row.nik || !row.name) {
                setStatusModal({ isOpen: true, type: 'error', message: "Mohon lengkapi NIK dan Nama untuk semua peserta." })
                return
            }
        }

        setConfirmModal(true)
    }

    const executeSubmit = async () => {
        setConfirmModal(false)
        setLoading(true)

        const res = await submitMagangRecord(rows, title)

        if (res.error) {
            setStatusModal({ isOpen: true, type: 'error', message: res.error })
            setLoading(false)
        } else {
            setStatusModal({ isOpen: true, type: 'success', message: res.success || 'Berhasil disimpan!' })
            setTimeout(() => {
                router.push('/dashboard/perusahaan/pencatatan/riwayat')
            }, 1500)
        }
    }

    const inputStyle = "border rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-orange-200 outline-none border-gray-300 transition-shadow min-w-[150px]"
    const labelStyle = "text-[10px] text-gray-500 font-bold mb-1 block uppercase tracking-wider"
    const groupStyle = "min-w-[180px] shrink-0 space-y-1"

    if (pageLoading) return <div className="p-10 text-center text-gray-400 animate-pulse">Memeriksa Profil Perusahaan...</div>

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-8 animate-fade-in pb-32">
            <StatusModal {...statusModal} onClose={() => setStatusModal(prev => ({ ...prev, isOpen: false }))} />

            {/* CONFIRMATION MODAL */}
            <Modal isOpen={confirmModal} onClose={() => setConfirmModal(false)} title="Konfirmasi Simpan">
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-4 bg-orange-50 p-4 rounded-xl border border-orange-100">
                        <div className="bg-orange-100 p-3 rounded-full text-orange-600">
                            <Save size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800 text-sm">Simpan Pencatatan</h4>
                            <p className="font-bold text-orange-700 text-lg">{rows.length} Peserta</p>
                        </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                        Pastikan data yang Anda masukkan sudah benar. Data ini akan dilaporkan ke Dinas Ketenagakerjaan.
                        <br /><br />
                        Apakah Anda yakin ingin menyimpan laporan ini?
                    </p>
                    <div className="flex gap-3">
                        <button onClick={() => setConfirmModal(false)} className="flex-1 py-3 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-50 text-sm transition">
                            Batal
                        </button>
                        <button onClick={executeSubmit} className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 text-sm shadow-lg shadow-orange-200 transition">
                            Ya, Simpan Laporan
                        </button>
                    </div>
                </div>
            </Modal>

            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div>
                    <Link href="/dashboard/perusahaan" className="inline-flex items-center text-gray-500 hover:text-orange-600 mb-2 transition font-medium text-sm">
                        <ArrowLeft size={16} className="mr-1" /> Kembali ke Dashboard
                    </Link>
                    <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
                        Buat Pencatatan Magang
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm">
                        Laporkan data peserta pemagangan baru.
                    </p>
                </div>

                {/* SECTION 1: INFORMASI */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-3">
                        <Info size={18} className="text-orange-500" />
                        Informasi Kegiatan
                    </h3>
                    <div>
                        <label className="text-xs font-bold text-gray-600 mb-1.5 block">Judul Kegiatan / Batch <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="border rounded-xl px-4 py-3 text-sm w-full max-w-lg focus:ring-2 focus:ring-orange-200 outline-none border-gray-300 transition-shadow"
                            placeholder="Contoh: Peserta Magang Batch 1 Tahun 2025"
                        />
                        <p className="text-[11px] text-gray-400 mt-2">Nama batch ini akan muncul di riwayat pencatatan.</p>
                    </div>
                </div>

                {/* SECTION 2: DATA PESERTA */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <Users size={18} className="text-orange-500" />
                            Daftar Peserta ({rows.length})
                        </h3>
                        <div className="text-xs text-orange-600 font-medium flex items-center gap-1 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                            <ChevronRight size={14} /> Geser ke samping untuk isi detail
                        </div>
                    </div>

                    {rows.map((row, index) => (
                        <div key={index} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow relative group">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-400 to-orange-600"></div>

                            <div className="p-4 bg-gray-50/50 border-b flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs ring-2 ring-white">
                                        {index + 1}
                                    </div>
                                    <span className="text-sm font-bold text-gray-700">Data Peserta ke-{index + 1}</span>
                                </div>
                                <button onClick={() => handleRemoveRow(index)} className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition" title="Hapus Baris">
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            {/* HORIZONTAL SCROLL AREA */}
                            <div className="p-6 overflow-x-auto custom-scrollbar">
                                <div className="flex gap-6 min-w-max pb-2">

                                    {/* CLUSTER 1: IDENTITAS */}
                                    <div className={`${groupStyle} border-r pr-6 border-blue-100`}>
                                        <div className="text-xs font-bold text-blue-600 mb-3 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded w-fit">
                                            Identitas Diri
                                        </div>
                                        <div>
                                            <label className={labelStyle}>NIK (KTP) <span className="text-red-500">*</span></label>
                                            <input value={row.nik} onChange={(e) => handleChange(index, 'nik', e.target.value)} className={inputStyle} placeholder="16 Digit NIK" maxLength={16} />
                                        </div>
                                        <div>
                                            <label className={labelStyle}>Nama Lengkap <span className="text-red-500">*</span></label>
                                            <input value={row.name} onChange={(e) => handleChange(index, 'name', e.target.value)} className={inputStyle} placeholder="Nama Sesuai KTP" />
                                        </div>
                                        <div>
                                            <label className={labelStyle}>Jenis Kelamin</label>
                                            <select value={row.gender} onChange={(e) => handleChange(index, 'gender', e.target.value)} className={inputStyle}>
                                                <option value="L">Laki-laki</option>
                                                <option value="P">Perempuan</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* CLUSTER 2: KONTAK & ALAMAT */}
                                    <div className={`${groupStyle} border-r pr-6 border-green-100`}>
                                        <div className="text-xs font-bold text-green-600 mb-3 flex items-center gap-1 bg-green-50 px-2 py-1 rounded w-fit">
                                            Kontak & Domisili
                                        </div>
                                        <div>
                                            <label className={labelStyle}>Tempat Lahir</label>
                                            <input value={row.place_of_birth} onChange={(e) => handleChange(index, 'place_of_birth', e.target.value)} className={inputStyle} />
                                        </div>
                                        <div>
                                            <label className={labelStyle}>Tanggal Lahir</label>
                                            <input type="date" value={row.date_of_birth} onChange={(e) => handleChange(index, 'date_of_birth', e.target.value)} className={inputStyle} />
                                        </div>
                                        <div>
                                            <label className={labelStyle}>Alamat Domisili</label>
                                            <input value={row.address} onChange={(e) => handleChange(index, 'address', e.target.value)} className={inputStyle} placeholder="Jalan, RT/RW..." />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className={labelStyle}>No. HP/WA</label>
                                                <input value={row.phone} onChange={(e) => handleChange(index, 'phone', e.target.value)} className={`${inputStyle} min-w-0`} />
                                            </div>
                                            <div>
                                                <label className={labelStyle}>Email</label>
                                                <input value={row.email} type="email" onChange={(e) => handleChange(index, 'email', e.target.value)} className={`${inputStyle} min-w-0`} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* CLUSTER 3: DATA MAGANG */}
                                    <div className={`${groupStyle} border-r pr-6 border-purple-100`}>
                                        <div className="text-xs font-bold text-purple-600 mb-3 flex items-center gap-1 bg-purple-50 px-2 py-1 rounded w-fit">
                                            Data Magang
                                        </div>
                                        <div>
                                            <label className={labelStyle}>Bagian / Divisi</label>
                                            <input value={row.division} onChange={(e) => handleChange(index, 'division', e.target.value)} className={inputStyle} placeholder="Dept. Marketing" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className={labelStyle}>Mulai Magang</label>
                                                <input type="date" value={row.start_date} onChange={(e) => handleChange(index, 'start_date', e.target.value)} className={`${inputStyle} min-w-0`} />
                                            </div>
                                            <div>
                                                <label className={labelStyle}>Selesai Magang</label>
                                                <input type="date" value={row.end_date} onChange={(e) => handleChange(index, 'end_date', e.target.value)} className={`${inputStyle} min-w-0`} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className={labelStyle}>Durasi (Bulan)</label>
                                            <input value={row.duration} onChange={(e) => handleChange(index, 'duration', e.target.value)} className={inputStyle} placeholder="6 Bulan" />
                                        </div>
                                    </div>

                                    {/* CLUSTER 4: LAINNYA */}
                                    <div className={`${groupStyle}`}>
                                        <div className="text-xs font-bold text-gray-500 mb-3 flex items-center gap-1 bg-gray-100 px-2 py-1 rounded w-fit">
                                            Pasca Magang
                                        </div>
                                        <div>
                                            <label className={labelStyle}>Rencana Pasca Magang</label>
                                            <textarea rows={3} value={row.post_activity} onChange={(e) => handleChange(index, 'post_activity', e.target.value)} className={`${inputStyle} h-full`} placeholder="Misal: Diangkat pegawai, atau selesai kontrak..." />
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    ))}

                    <button onClick={handleAddRow} className="w-full py-4 bg-orange-50 border-2 border-dashed border-orange-200 rounded-xl text-orange-600 font-bold flex items-center justify-center gap-2 hover:bg-orange-100 transition">
                        <Plus size={20} /> Tambah Baris Peserta
                    </button>
                </div>

                {/* FOOTER ACTION */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t z-10 md:static md:bg-transparent md:border-0 md:p-0 flex justify-end">
                    <button onClick={validateAndPrompt} disabled={loading} className="w-full md:w-auto bg-orange-600 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-orange-200 hover:bg-orange-700 flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:bg-gray-400">
                        <Save size={20} /> {loading ? 'Menyimpan...' : 'Simpan & Kirim Pencatatan'}
                    </button>
                </div>
            </div>
        </div>
    )
}
