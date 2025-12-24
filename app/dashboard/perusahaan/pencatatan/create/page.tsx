'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Plus, Trash2, Users } from 'lucide-react'
import Link from 'next/link'
import { submitMagangRecord } from '@/actions/magang'

export default function CreateMagangRecordPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

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
        for (const row of rows) {
            if (!row.nik || !row.name) {
                alert("Mohon lengkapi NIK dan Nama untuk semua baris.")
                return
            }
        }

        if (!confirm(`Simpan ${rows.length} data pencatatan?`)) return

        setLoading(true)
        const res = await submitMagangRecord(rows)

        if (res.error) {
            alert(res.error)
            setLoading(false)
        } else {
            alert(res.success)
            router.push('/dashboard/perusahaan/pencatatan/riwayat')
        }
    }

    const inputClass = "w-full border-0 bg-transparent text-sm focus:ring-0 outline-none p-2 min-w-[150px]"
    const cellClass = "border border-gray-200 p-0"
    const headerClass = "bg-gray-100 font-bold text-xs text-gray-600 uppercase tracking-wider px-3 py-3 border border-gray-200 min-w-[150px] whitespace-nowrap"

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-8 animate-fade-in pb-24">
            <div className="max-w-[95vw] mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
                    <div>
                        <Link href="/dashboard/perusahaan" className="inline-flex items-center text-gray-500 hover:text-orange-600 mb-2 transition">
                            <ArrowLeft size={16} className="mr-1" /> Kembali ke Dashboard
                        </Link>
                        <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
                            <Users className="text-orange-600" /> Pencatatan Peserta Magang
                        </h1>
                        <p className="text-gray-500 mt-1 max-w-2xl">
                            Isi tabel di bawah ini untuk melaporkan data peserta pemagangan. Anda dapat menambahkan banyak baris sekaligus.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={handleAddRow} className="px-4 py-2 bg-blue-50 text-blue-700 font-bold rounded-lg hover:bg-blue-100 flex items-center gap-2 text-sm border border-blue-200">
                            <Plus size={16} /> Tambah Baris
                        </button>
                        <button onClick={handleSubmit} disabled={loading} className="px-6 py-2 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 shadow-md flex items-center gap-2 text-sm disabled:bg-gray-300">
                            <Save size={16} /> {loading ? 'Menyimpan...' : 'Simpan Data'}
                        </button>
                    </div>
                </div>

                {/* TABLE CONTAINER */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col h-[70vh]">
                    <div className="overflow-auto flex-1 relative">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="bg-gray-100 border border-gray-200 w-12 text-center py-3 text-xs font-bold text-gray-500">No</th>
                                    <th className="bg-gray-100 border border-gray-200 w-12 text-center py-3 text-xs font-bold text-gray-500">Aksi</th>
                                    <th className={headerClass}>NIK Peserta <span className="text-red-500">*</span></th>
                                    <th className={headerClass}>Nama Lengkap <span className="text-red-500">*</span></th>
                                    <th className={headerClass}>L/P</th>
                                    <th className={headerClass}>Tempat Lahir</th>
                                    <th className={headerClass}>Tanggal Lahir</th>
                                    <th className={headerClass}>No. HP / WA</th>
                                    <th className={headerClass}>Email</th>
                                    <th className={headerClass}>Alamat Domisili</th>
                                    <th className={headerClass}>Bagian / Divisi</th>
                                    <th className={headerClass}>Durasi</th>
                                    <th className={headerClass}>Tgl Mulai</th>
                                    <th className={headerClass}>Tgl Selesai</th>
                                    <th className={headerClass}>Rencana Pasca Magang</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, index) => (
                                    <tr key={index} className="hover:bg-orange-50/30 transition-colors">
                                        <td className="border border-gray-200 text-center text-xs text-gray-400 bg-gray-50">{index + 1}</td>
                                        <td className="border border-gray-200 text-center">
                                            <button onClick={() => handleRemoveRow(index)} className="text-red-400 hover:text-red-600 p-2 rounded hover:bg-red-50 transition">
                                                <Trash2 size={14} />
                                            </button>
                                        </td>

                                        <td className={cellClass}><input type="number" value={row.nik} onChange={(e) => handleChange(index, 'nik', e.target.value)} className={inputClass} placeholder="16 Digit..." /></td>
                                        <td className={cellClass}><input value={row.name} onChange={(e) => handleChange(index, 'name', e.target.value)} className={inputClass} placeholder="Nama Peserta..." /></td>

                                        <td className={cellClass}>
                                            <select value={row.gender} onChange={(e) => handleChange(index, 'gender', e.target.value)} className="w-full border-0 bg-transparent text-sm focus:ring-0 outline-none p-2 cursor-pointer">
                                                <option value="L">L</option>
                                                <option value="P">P</option>
                                            </select>
                                        </td>

                                        <td className={cellClass}><input value={row.place_of_birth} onChange={(e) => handleChange(index, 'place_of_birth', e.target.value)} className={inputClass} /></td>
                                        <td className={cellClass}><input type="date" value={row.date_of_birth} onChange={(e) => handleChange(index, 'date_of_birth', e.target.value)} className={inputClass} /></td>

                                        <td className={cellClass}><input value={row.phone} onChange={(e) => handleChange(index, 'phone', e.target.value)} className={inputClass} /></td>
                                        <td className={cellClass}><input type="email" value={row.email} onChange={(e) => handleChange(index, 'email', e.target.value)} className={inputClass} /></td>
                                        <td className={cellClass}><input value={row.address} onChange={(e) => handleChange(index, 'address', e.target.value)} className={inputClass} /></td>

                                        <td className={cellClass}><input value={row.division} onChange={(e) => handleChange(index, 'division', e.target.value)} className={inputClass} /></td>
                                        <td className={cellClass}><input value={row.duration} onChange={(e) => handleChange(index, 'duration', e.target.value)} className={inputClass} /></td>

                                        <td className={cellClass}><input type="date" value={row.start_date} onChange={(e) => handleChange(index, 'start_date', e.target.value)} className={inputClass} /></td>
                                        <td className={cellClass}><input type="date" value={row.end_date} onChange={(e) => handleChange(index, 'end_date', e.target.value)} className={inputClass} /></td>

                                        <td className={cellClass}><input value={row.post_activity} onChange={(e) => handleChange(index, 'post_activity', e.target.value)} className={inputClass} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <p className="text-xs text-gray-400 mt-2 italic">* Tekan "Tambah Baris" untuk menambahkan peserta lain.</p>
            </div>
        </div>
    )
}
