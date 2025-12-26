'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Plus, Trash2, Users, FileText, Info } from 'lucide-react'
import Link from 'next/link'
import { submitMagangRecord } from '@/actions/magang'

export default function CreateMagangRecordPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [title, setTitle] = useState('')

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

    const handleAddRow = () => {
        setRows([...rows, { ...emptyRow }])
    }

    const handleRemoveRow = (index: number) => {
        if (rows.length === 1) {
            alert("Minimal satu baris data.")
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

    const handleSubmit = async () => {
        // Validate
        if (!title.trim()) {
            alert("Mohon isi Judul Pencatatan (Contoh: Magang Batch 1 2024)")
            return
        }

        for (const row of rows) {
            if (!row.nik || !row.name) {
                alert("Mohon lengkapi NIK dan Nama untuk semua baris.")
                return
            }
        }

        if (!confirm(`Simpan ${rows.length} data pencatatan?`)) return

        setLoading(true)
        const res = await submitMagangRecord(rows, title)

        if (res.error) {
            alert(res.error)
            setLoading(false)
        } else {
            alert(res.success)
            router.push('/dashboard/perusahaan/pencatatan/riwayat')
        }
    }

    const inputStyle = "border rounded p-2 text-xs w-full focus:ring-1 focus:ring-orange-500 outline-none border-gray-300"
    const sectionTitle = "font-bold text-gray-800 mb-4 pb-2 border-b flex items-center justify-between"

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-8 animate-fade-in pb-24">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div>
                    <Link href="/dashboard/perusahaan" className="inline-flex items-center text-gray-500 hover:text-orange-600 mb-2 transition">
                        <ArrowLeft size={16} className="mr-1" /> Kembali ke Dashboard
                    </Link>
                    <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
                        Pencatatan Peserta Magang
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Laporkan data peserta pemagangan dalam negeri.
                    </p>
                </div>

                {/* SECTION 1: INFORMASI */}
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <h3 className={sectionTitle}>
                        <div className="flex items-center gap-2">
                            <Info size={18} className="text-orange-500" />
                            Informasi Pencatatan
                        </div>
                    </h3>
                    <div>
                        <label className="text-xs font-bold text-gray-600 mb-1 block">Judul Pencatatan <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className={`${inputStyle} text-sm max-w-md`}
                            placeholder="Contoh: Batch Januari 2025"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">Berikan nama untuk kelompok data ini agar mudah dicari.</p>
                    </div>
                </div>

                {/* SECTION 2: DATA PESERTA */}
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <h3 className={sectionTitle}>
                        <div className="flex items-center gap-2">
                            <Users size={18} className="text-orange-500" />
                            Data Peserta Pemagangan ({rows.length})
                        </div>
                    </h3>

                    <div className="overflow-x-auto mb-4 border rounded-lg">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-gray-100 font-bold text-gray-700 uppercase tracking-wider">
                                <tr>
                                    <th className="p-3 border-b min-w-[50px] text-center">No</th>
                                    <th className="p-3 border-b min-w-[150px]">Identitas (NIK & Nama)</th>
                                    <th className="p-3 border-b min-w-[120px]">Kontak</th>
                                    <th className="p-3 border-b min-w-[300px]">Detail Magang</th>
                                    <th className="p-3 border-b min-w-[150px]">Lainnya</th>
                                    <th className="p-3 border-b text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {rows.map((row, index) => (
                                    <tr key={index} className="hover:bg-orange-50/20 transition-colors bg-white">
                                        <td className="p-3 text-center text-gray-400 bg-gray-50/50 align-top pt-4">{index + 1}</td>

                                        <td className="p-3 align-top space-y-2">
                                            <div>
                                                <label className="text-[10px] text-gray-400 font-bold">NIK</label>
                                                <input value={row.nik} onChange={(e) => handleChange(index, 'nik', e.target.value)} className={inputStyle} placeholder="16 Digit NIK" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-gray-400 font-bold">Nama Lengkap</label>
                                                <input value={row.name} onChange={(e) => handleChange(index, 'name', e.target.value)} className={inputStyle} placeholder="Nama Peserta" />
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="w-1/3">
                                                    <label className="text-[10px] text-gray-400 font-bold">L/P</label>
                                                    <select value={row.gender} onChange={(e) => handleChange(index, 'gender', e.target.value)} className={inputStyle}>
                                                        <option value="L">L</option>
                                                        <option value="P">P</option>
                                                    </select>
                                                </div>
                                                <div className="w-2/3">
                                                    <label className="text-[10px] text-gray-400 font-bold">Tgl Lahir</label>
                                                    <input type="date" value={row.date_of_birth} onChange={(e) => handleChange(index, 'date_of_birth', e.target.value)} className={inputStyle} />
                                                </div>
                                            </div>
                                        </td>

                                        <td className="p-3 align-top space-y-2">
                                            <div>
                                                <label className="text-[10px] text-gray-400 font-bold">No. HP / WA</label>
                                                <input value={row.phone} onChange={(e) => handleChange(index, 'phone', e.target.value)} className={inputStyle} />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-gray-400 font-bold">Email</label>
                                                <input type="email" value={row.email} onChange={(e) => handleChange(index, 'email', e.target.value)} className={inputStyle} />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-gray-400 font-bold">Domisili</label>
                                                <textarea rows={2} value={row.address} onChange={(e) => handleChange(index, 'address', e.target.value)} className={inputStyle} placeholder="Alamat lengkap..." />
                                            </div>
                                        </td>

                                        <td className="p-3 align-top space-y-2">
                                            <div className="flex gap-2">
                                                <div className="w-1/2">
                                                    <label className="text-[10px] text-gray-400 font-bold">Bagian / Divisi</label>
                                                    <input value={row.division} onChange={(e) => handleChange(index, 'division', e.target.value)} className={inputStyle} />
                                                </div>
                                                <div className="w-1/2">
                                                    <label className="text-[10px] text-gray-400 font-bold">Durasi</label>
                                                    <input value={row.duration} onChange={(e) => handleChange(index, 'duration', e.target.value)} className={inputStyle} placeholder="Cth: 6 Bulan" />
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="w-1/2">
                                                    <label className="text-[10px] text-gray-400 font-bold">Mulai</label>
                                                    <input type="date" value={row.start_date} onChange={(e) => handleChange(index, 'start_date', e.target.value)} className={inputStyle} />
                                                </div>
                                                <div className="w-1/2">
                                                    <label className="text-[10px] text-gray-400 font-bold">Selesai</label>
                                                    <input type="date" value={row.end_date} onChange={(e) => handleChange(index, 'end_date', e.target.value)} className={inputStyle} />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-gray-400 font-bold">Rencana Pasca Magang</label>
                                                <input value={row.post_activity} onChange={(e) => handleChange(index, 'post_activity', e.target.value)} className={inputStyle} placeholder="Cth: Diangkat pegawai tetap" />
                                            </div>
                                        </td>

                                        <td className="p-3 align-top">
                                            <div>
                                                <label className="text-[10px] text-gray-400 font-bold">Tempat Lahir</label>
                                                <input value={row.place_of_birth} onChange={(e) => handleChange(index, 'place_of_birth', e.target.value)} className={inputStyle} />
                                            </div>
                                        </td>

                                        <td className="p-3 text-center align-top pt-4">
                                            <button onClick={() => handleRemoveRow(index)} className="text-red-400 hover:text-red-600 bg-red-50 p-2 rounded-lg hover:bg-red-100 transition">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <button onClick={handleAddRow} className="text-xs text-orange-600 font-bold flex items-center gap-1 hover:underline px-2">
                        <Plus size={16} /> Tambah Baris Peserta
                    </button>
                </div>

                {/* FOOTER ACTION */}
                <div className="flex justify-end pt-4">
                    <button onClick={handleSubmit} disabled={loading} className="bg-orange-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-orange-700 flex items-center gap-2 transition-transform active:scale-95 disabled:bg-gray-400 border border-orange-700">
                        <Save size={20} /> {loading ? 'Menyimpan...' : 'Simpan & Kirim Pencatatan'}
                    </button>
                </div>
            </div>
        </div>
    )
}
