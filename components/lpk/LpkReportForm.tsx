'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Save, FileText, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'
import { submitLpkReport } from '@/actions/organization'

// Props menerima 'initialData' jika ini adalah revisi
export default function LpkReportForm({ profile, initialData }: { profile: any, initialData?: any }) {
    const [loading, setLoading] = useState(false)

    // Default State matching 9 Sections
    const defaultState = {
        semester: 'Ganjil', tahun: new Date().getFullYear().toString(),
        namaLpk: profile.company_name || '',
        noReg: profile.vin || '', // Read only usually

        // 1. Status Akreditasi
        data_akreditasi: { no_sk: '', ruang_lingkup: '' },

        // 2. Jumlah Karyawan
        data_karyawan: {
            laki: { pelatih_tetap: 0, pelatih_tidak_tetap: 0, instruktur_tetap: 0, instruktur_tidak_tetap: 0, asesor: 0, berwenang: 0 },
            perempuan: { pelatih_tetap: 0, pelatih_tidak_tetap: 0, instruktur_tetap: 0, instruktur_tidak_tetap: 0, asesor: 0, berwenang: 0 },
            ket: { pelatih_tetap: '', pelatih_tidak_tetap: '', instruktur_tetap: '', instruktur_tidak_tetap: '', asesor: '', berwenang: '' }
        },

        // 3. Pengembangan Program Pelatihan
        data_pengembangan_program: [{ nama: '', inisiator: '', durasi: '', standar: '', ket: '' }],

        // 4. Penyelenggaraan Pelatihan
        data_penyelenggaraan: [{ nama: '', jadwal: '', peserta: 0, lulusan: 0, ket: '' }],

        // 5. Sebagai TUK
        data_tuk: { is_tuk: false, kejuruan: '', skema: '', kapasitas: '', lsp_lisensi: '' },

        // 6. Penyelenggaraan Uji Kompetensi
        data_uji_kompetensi: [{ lsp: '', skema: '', jadwal: '', peserta: 0, kompeten: 0, ket: '' }],

        // 7. Pengembangan Kelembagaan & SDM
        data_pengembangan_kelembagaan: [{ nama: '', jadwal: '', lokasi: '', penyelenggara: '', ket: '' }],

        // 8. Kerjasama Mitra
        data_mitra: [{ nama: '', alamat: '', bentuk: '' }],

        // 9. Kendala & Solusi
        data_kendala: [{ masalah: '', solusi: '', ket: '' }]
    }

    const [reportData, setReportData] = useState(defaultState)

    // EFFECT: Jika ada initialData (Draft/Revisi), masukkan ke state
    useEffect(() => {
        if (initialData) {
            setReportData({
                ...defaultState,
                semester: initialData.semester || 'Ganjil',
                tahun: initialData.tahun || new Date().getFullYear().toString(),
                namaLpk: initialData.nama_lpk,
                noReg: initialData.no_reg,

                // Map keys from DB to State (handling existing data if any)
                data_akreditasi: initialData.data_akreditasi || defaultState.data_akreditasi,

                // Handle Karyawan Structure Change safely
                data_karyawan: initialData.data_karyawan ? {
                    ...defaultState.data_karyawan,
                    ...initialData.data_karyawan // Merge if compatible, or manual map if needed
                } : defaultState.data_karyawan,

                data_pengembangan_program: initialData.data_pengembangan_program || defaultState.data_pengembangan_program,
                data_penyelenggaraan: initialData.data_penyelenggaraan || defaultState.data_penyelenggaraan,
                data_tuk: initialData.data_tuk || defaultState.data_tuk,
                data_uji_kompetensi: initialData.data_uji_kompetensi || defaultState.data_uji_kompetensi,
                data_pengembangan_kelembagaan: initialData.data_pengembangan_kelembagaan || defaultState.data_pengembangan_kelembagaan,
                data_mitra: initialData.data_mitra || defaultState.data_mitra,
                data_kendala: initialData.data_kendala || defaultState.data_kendala // DB uses data_kendala or just kendala? Previously was 'kendala' in script but let's standardize
            })
        }
    }, [initialData])

    // --- HANDLERS ---
    const handleChange = (e: any) => {
        setReportData({ ...reportData, [e.target.name]: e.target.value })
    }

    // Generic Nested Object Handler
    const handleNestedChange = (parent: string, field: string, val: any) => {
        setReportData({ ...reportData, [parent]: { ...reportData[parent as keyof typeof reportData] as any, [field]: val } })
    }

    // Handler Karyawan (Deep Nested)
    const handleKaryawanChange = (category: 'laki' | 'perempuan' | 'ket', field: string, val: string) => {
        setReportData({
            ...reportData,
            data_karyawan: {
                ...reportData.data_karyawan,
                [category]: {
                    ...reportData.data_karyawan[category],
                    [field]: category === 'ket' ? val : (parseInt(val) || 0)
                }
            }
        })
    }

    // Handler Array
    const handleArrayChange = (index: number, field: string, val: any, section: string) => {
        const newData = [...(reportData[section as keyof typeof reportData] as any[])]
        newData[index][field] = val
        setReportData({ ...reportData, [section]: newData })
    }

    const addRow = (section: string, template: any) => {
        setReportData({ ...reportData, [section]: [...(reportData[section as keyof typeof reportData] as any[]), template] })
    }

    const removeRow = (index: number, section: string) => {
        const newData = [...(reportData[section as keyof typeof reportData] as any[])]
        newData.splice(index, 1)
        setReportData({ ...reportData, [section]: newData })
    }

    const handleSubmit = async () => {
        if (!confirm("Apakah data laporan sudah benar? Data akan dikirim ke Dinas untuk verifikasi.")) return
        setLoading(true)

        // Clean up empty rows if necessary? No, just send as is.
        const res = await submitLpkReport(reportData)
        if (res.error) alert(res.error)
        else {
            alert(res.success)
            window.location.reload()
        }
        setLoading(false)
    }

    const sectionTitle = "font-bold text-gray-800 mb-4 pb-2 border-b flex items-center justify-between"
    const inputStyle = "border rounded p-2 text-xs w-full focus:ring-1 focus:ring-blue-500 outline-none"
    const labelStyle = "text-xs font-bold text-gray-600 mb-1 block"

    return (
        <div className="space-y-8 animate-fade-in pb-10">

            {/* PESAN JIKA REVISI */}
            {initialData && initialData.status === 'REJECTED' && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-start gap-3">
                    <AlertTriangle className="text-red-500 mt-1" />
                    <div>
                        <h4 className="font-bold text-red-800">Laporan Perlu Revisi</h4>
                        <p className="text-sm text-red-700 mt-1">Laporan sebelumnya ditolak. Data lama telah dimuat, silakan perbaiki dan kirim ulang.</p>
                    </div>
                </div>
            )}

            {/* 0. DATA UMUM */}
            <div className="bg-white p-6 rounded-xl border shadow-sm">
                <h3 className={sectionTitle}>Data Laporan</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div><label className={labelStyle}>Semester</label>
                        <select name="semester" value={reportData.semester} onChange={handleChange} className={inputStyle} disabled={!!initialData}>
                            <option value="Ganjil">Ganjil</option><option value="Genap">Genap</option>
                        </select></div>
                    <div><label className={labelStyle}>Tahun</label><input name="tahun" value={reportData.tahun} onChange={handleChange} className={inputStyle} disabled={!!initialData} /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className={labelStyle}>Nama LPK</label><input value={reportData.namaLpk} disabled className={`${inputStyle} bg-gray-100`} /></div>
                    <div><label className={labelStyle}>No. VIN / Registrasi</label><input value={reportData.noReg} disabled className={`${inputStyle} bg-gray-100`} /></div>
                </div>
            </div>

            {/* 1. STATUS AKREDITASI */}
            <div className="bg-white p-6 rounded-xl border shadow-sm">
                <h3 className={sectionTitle}>A. Status Akreditasi</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelStyle}>Nomor SK Akreditasi</label>
                        <input value={reportData.data_akreditasi.no_sk} onChange={(e) => handleNestedChange('data_akreditasi', 'no_sk', e.target.value)} className={inputStyle} placeholder="Isi Nomor SK" />
                    </div>
                    <div>
                        <label className={labelStyle}>Ruang Lingkup LPK (Program)</label>
                        <input value={reportData.data_akreditasi.ruang_lingkup} onChange={(e) => handleNestedChange('data_akreditasi', 'ruang_lingkup', e.target.value)} className={inputStyle} placeholder="Program kegiatan dan pelatihan yang ditawarkan" />
                    </div>
                </div>
            </div>

            {/* 2. JUMLAH KARYAWAN */}
            <div className="bg-white p-6 rounded-xl border shadow-sm overflow-hidden">
                <h3 className={sectionTitle}>Jumlah Karyawan</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs text-center border">
                        <thead className="bg-gray-100 font-bold text-gray-700">
                            <tr>
                                <th className="p-3 border text-left min-w-[150px]">Kategori</th>
                                <th className="p-3 border w-24">Laki-laki</th>
                                <th className="p-3 border w-24">Perempuan</th>
                                <th className="p-3 border min-w-[200px]">Keterangan</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { id: 'pelatih_tetap', label: 'a. Tenaga pelatihan tetap' },
                                { id: 'pelatih_tidak_tetap', label: 'b. Tenaga pelatihan tidak tetap' },
                                { id: 'instruktur_tetap', label: 'c. Instruktur tetap' },
                                { id: 'instruktur_tidak_tetap', label: 'd. Instruktur tidak tetap' },
                                { id: 'asesor', label: 'e. Asesor kompetensi' },
                                { id: 'berwenang', label: 'f. Instruktur/asesor berwenang' },
                            ].map((row) => (
                                <tr key={row.id}>
                                    <td className="p-2 border text-left font-medium">{row.label}</td>
                                    <td className="p-2 border"><input type="number" value={reportData.data_karyawan.laki[row.id as keyof typeof reportData.data_karyawan.laki]} onChange={(e) => handleKaryawanChange('laki', row.id, e.target.value)} className={`${inputStyle} text-center`} /></td>
                                    <td className="p-2 border"><input type="number" value={reportData.data_karyawan.perempuan[row.id as keyof typeof reportData.data_karyawan.perempuan]} onChange={(e) => handleKaryawanChange('perempuan', row.id, e.target.value)} className={`${inputStyle} text-center`} /></td>
                                    <td className="p-2 border"><input type="text" value={reportData.data_karyawan.ket[row.id as keyof typeof reportData.data_karyawan.ket]} onChange={(e) => handleKaryawanChange('ket', row.id, e.target.value)} className={inputStyle} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 3. PENGEMBANGAN PROGRAM */}
            <div className="bg-white p-6 rounded-xl border shadow-sm">
                <h3 className={sectionTitle}>B. Kegiatan Pengembangan Program Pelatihan</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs mb-3">
                        <thead className="text-left font-bold text-gray-500 bg-gray-50">
                            <tr>
                                <th className="p-2">Nama Program (1)</th>
                                <th className="p-2">Inisiator (2)</th>
                                <th className="p-2 w-20">Durasi (JP) (3)</th>
                                <th className="p-2">Standar Komp (4)</th>
                                <th className="p-2">Ket (5)</th>
                                <th className="p-2 w-10"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.data_pengembangan_program.map((item, idx) => (
                                <tr key={idx} className="border-b last:border-0">
                                    <td className="p-1"><input value={item.nama} onChange={(e) => handleArrayChange(idx, 'nama', e.target.value, 'data_pengembangan_program')} className={inputStyle} /></td>
                                    <td className="p-1"><input value={item.inisiator} onChange={(e) => handleArrayChange(idx, 'inisiator', e.target.value, 'data_pengembangan_program')} className={inputStyle} /></td>
                                    <td className="p-1"><input value={item.durasi} onChange={(e) => handleArrayChange(idx, 'durasi', e.target.value, 'data_pengembangan_program')} className={inputStyle} /></td>
                                    <td className="p-1"><input value={item.standar} onChange={(e) => handleArrayChange(idx, 'standar', e.target.value, 'data_pengembangan_program')} className={inputStyle} /></td>
                                    <td className="p-1"><input value={item.ket} onChange={(e) => handleArrayChange(idx, 'ket', e.target.value, 'data_pengembangan_program')} className={inputStyle} /></td>
                                    <td className="p-1 text-center"><button onClick={() => removeRow(idx, 'data_pengembangan_program')} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <button onClick={() => addRow('data_pengembangan_program', { nama: '', inisiator: '', durasi: '', standar: '', ket: '' })} className="text-xs text-blue-600 font-bold flex items-center gap-1 hover:underline"><Plus size={14} /> Tambah Baris</button>
            </div>

            {/* 4. PENYELENGGARAAN PELATIHAN */}
            <div className="bg-white p-6 rounded-xl border shadow-sm">
                <h3 className={sectionTitle}>C. Kegiatan Penyelenggaraan Pelatihan</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs mb-3">
                        <thead className="text-left font-bold text-gray-500 bg-gray-50">
                            <tr>
                                <th className="p-2">Nama Program (1)</th>
                                <th className="p-2">Jadwal (2)</th>
                                <th className="p-2 w-24">Jml Peserta (3)</th>
                                <th className="p-2 w-24">Jml Lulus (4)</th>
                                <th className="p-2">Ket (5)</th>
                                <th className="p-2 w-10"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.data_penyelenggaraan.map((item, idx) => (
                                <tr key={idx} className="border-b last:border-0">
                                    <td className="p-1"><input value={item.nama} onChange={(e) => handleArrayChange(idx, 'nama', e.target.value, 'data_penyelenggaraan')} className={inputStyle} /></td>
                                    <td className="p-1"><input value={item.jadwal} onChange={(e) => handleArrayChange(idx, 'jadwal', e.target.value, 'data_penyelenggaraan')} className={inputStyle} /></td>
                                    <td className="p-1"><input type="number" value={item.peserta} onChange={(e) => handleArrayChange(idx, 'peserta', e.target.value, 'data_penyelenggaraan')} className={inputStyle} /></td>
                                    <td className="p-1"><input type="number" value={item.lulusan} onChange={(e) => handleArrayChange(idx, 'lulusan', e.target.value, 'data_penyelenggaraan')} className={inputStyle} /></td>
                                    <td className="p-1"><input value={item.ket} onChange={(e) => handleArrayChange(idx, 'ket', e.target.value, 'data_penyelenggaraan')} className={inputStyle} /></td>
                                    <td className="p-1 text-center"><button onClick={() => removeRow(idx, 'data_penyelenggaraan')} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <button onClick={() => addRow('data_penyelenggaraan', { nama: '', jadwal: '', peserta: 0, lulusan: 0, ket: '' })} className="text-xs text-blue-600 font-bold flex items-center gap-1 hover:underline"><Plus size={14} /> Tambah Baris</button>
            </div>

            {/* 5. SEBAGAI TUK */}
            <div className="bg-white p-6 rounded-xl border shadow-sm">
                <h3 className={sectionTitle}>
                    <div className="flex items-center gap-2">
                        <input type="checkbox" checked={reportData.data_tuk.is_tuk} onChange={(e) => handleNestedChange('data_tuk', 'is_tuk', e.target.checked)} className="w-4 h-4" />
                        <span>Sebagai TUK (Tempat Uji Kompetensi)</span>
                    </div>
                </h3>
                {reportData.data_tuk.is_tuk && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in mt-4">
                        <div><label className={labelStyle}>Kejuruan</label><input value={reportData.data_tuk.kejuruan} onChange={(e) => handleNestedChange('data_tuk', 'kejuruan', e.target.value)} className={inputStyle} placeholder="Contoh: Garmen, TIK" /></div>
                        <div><label className={labelStyle}>Skema Sertifikasi</label><input value={reportData.data_tuk.skema} onChange={(e) => handleNestedChange('data_tuk', 'skema', e.target.value)} className={inputStyle} placeholder="Contoh: Operator Mesin Jahit" /></div>
                        <div><label className={labelStyle}>Kapasitas</label><input value={reportData.data_tuk.kapasitas} onChange={(e) => handleNestedChange('data_tuk', 'kapasitas', e.target.value)} className={inputStyle} placeholder="Contoh: 10 orang/angkatan" /></div>
                        <div><label className={labelStyle}>LSP Pemberi Lisensi</label><input value={reportData.data_tuk.lsp_lisensi} onChange={(e) => handleNestedChange('data_tuk', 'lsp_lisensi', e.target.value)} className={inputStyle} placeholder="Nama LSP" /></div>
                    </div>
                )}
                {!reportData.data_tuk.is_tuk && <p className="text-xs text-gray-400 italic">Centang jika LPK berfungsi sebagai TUK.</p>}
            </div>

            {/* 6. UJI KOMPETENSI */}
            <div className="bg-white p-6 rounded-xl border shadow-sm">
                <h3 className={sectionTitle}>D. Kegiatan Penyelenggaraan Uji Kompetensi</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs mb-3">
                        <thead className="text-left font-bold text-gray-500 bg-gray-50">
                            <tr>
                                <th className="p-2">Nama LSP (1)</th>
                                <th className="p-2">Skema (2)</th>
                                <th className="p-2">Jadwal (3)</th>
                                <th className="p-2 w-20">Peserta (4)</th>
                                <th className="p-2 w-20">Kompeten (5)</th>
                                <th className="p-2">Ket (6)</th>
                                <th className="p-2 w-10"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.data_uji_kompetensi.map((item, idx) => (
                                <tr key={idx} className="border-b last:border-0">
                                    <td className="p-1"><input value={item.lsp} onChange={(e) => handleArrayChange(idx, 'lsp', e.target.value, 'data_uji_kompetensi')} className={inputStyle} /></td>
                                    <td className="p-1"><input value={item.skema} onChange={(e) => handleArrayChange(idx, 'skema', e.target.value, 'data_uji_kompetensi')} className={inputStyle} /></td>
                                    <td className="p-1"><input value={item.jadwal} onChange={(e) => handleArrayChange(idx, 'jadwal', e.target.value, 'data_uji_kompetensi')} className={inputStyle} /></td>
                                    <td className="p-1"><input type="number" value={item.peserta} onChange={(e) => handleArrayChange(idx, 'peserta', e.target.value, 'data_uji_kompetensi')} className={inputStyle} /></td>
                                    <td className="p-1"><input type="number" value={item.kompeten} onChange={(e) => handleArrayChange(idx, 'kompeten', e.target.value, 'data_uji_kompetensi')} className={inputStyle} /></td>
                                    <td className="p-1"><input value={item.ket} onChange={(e) => handleArrayChange(idx, 'ket', e.target.value, 'data_uji_kompetensi')} className={inputStyle} /></td>
                                    <td className="p-1 text-center"><button onClick={() => removeRow(idx, 'data_uji_kompetensi')} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <button onClick={() => addRow('data_uji_kompetensi', { lsp: '', skema: '', jadwal: '', peserta: 0, kompeten: 0, ket: '' })} className="text-xs text-blue-600 font-bold flex items-center gap-1 hover:underline"><Plus size={14} /> Tambah Baris</button>
            </div>

            {/* 7. PENGEMBANGAN KELEMBAGAAN */}
            <div className="bg-white p-6 rounded-xl border shadow-sm">
                <h3 className={sectionTitle}>E. Kegiatan Pengembangan Kelembagaan & SDM</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs mb-3">
                        <thead className="text-left font-bold text-gray-500 bg-gray-50">
                            <tr>
                                <th className="p-2">Nama Kegiatan (1)</th>
                                <th className="p-2">Jadwal (2)</th>
                                <th className="p-2">Lokasi (3)</th>
                                <th className="p-2">Penyelenggara (4)</th>
                                <th className="p-2">Ket (5)</th>
                                <th className="p-2 w-10"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.data_pengembangan_kelembagaan.map((item, idx) => (
                                <tr key={idx} className="border-b last:border-0">
                                    <td className="p-1"><input value={item.nama} onChange={(e) => handleArrayChange(idx, 'nama', e.target.value, 'data_pengembangan_kelembagaan')} className={inputStyle} /></td>
                                    <td className="p-1"><input value={item.jadwal} onChange={(e) => handleArrayChange(idx, 'jadwal', e.target.value, 'data_pengembangan_kelembagaan')} className={inputStyle} /></td>
                                    <td className="p-1"><input value={item.lokasi} onChange={(e) => handleArrayChange(idx, 'lokasi', e.target.value, 'data_pengembangan_kelembagaan')} className={inputStyle} /></td>
                                    <td className="p-1"><input value={item.penyelenggara} onChange={(e) => handleArrayChange(idx, 'penyelenggara', e.target.value, 'data_pengembangan_kelembagaan')} className={inputStyle} /></td>
                                    <td className="p-1"><input value={item.ket} onChange={(e) => handleArrayChange(idx, 'ket', e.target.value, 'data_pengembangan_kelembagaan')} className={inputStyle} /></td>
                                    <td className="p-1 text-center"><button onClick={() => removeRow(idx, 'data_pengembangan_kelembagaan')} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <button onClick={() => addRow('data_pengembangan_kelembagaan', { nama: '', jadwal: '', lokasi: '', penyelenggara: '', ket: '' })} className="text-xs text-blue-600 font-bold flex items-center gap-1 hover:underline"><Plus size={14} /> Tambah Baris</button>
            </div>

            {/* 8. MITRA */}
            <div className="bg-white p-6 rounded-xl border shadow-sm">
                <h3 className={sectionTitle}>F. Kegiatan/Kerjasama dengan Stakeholder</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs mb-3">
                        <thead className="text-left font-bold text-gray-500 bg-gray-50">
                            <tr>
                                <th className="p-2">Nama Mitra (1)</th>
                                <th className="p-2">Alamat (2)</th>
                                <th className="p-2">Bentuk Kemitraan (3)</th>
                                <th className="p-2 w-10"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.data_mitra.map((item, idx) => (
                                <tr key={idx} className="border-b last:border-0">
                                    <td className="p-1"><input value={item.nama} onChange={(e) => handleArrayChange(idx, 'nama', e.target.value, 'data_mitra')} className={inputStyle} /></td>
                                    <td className="p-1"><input value={item.alamat} onChange={(e) => handleArrayChange(idx, 'alamat', e.target.value, 'data_mitra')} className={inputStyle} /></td>
                                    <td className="p-1"><input value={item.bentuk} onChange={(e) => handleArrayChange(idx, 'bentuk', e.target.value, 'data_mitra')} className={inputStyle} /></td>
                                    <td className="p-1 text-center"><button onClick={() => removeRow(idx, 'data_mitra')} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <button onClick={() => addRow('data_mitra', { nama: '', alamat: '', bentuk: '' })} className="text-xs text-blue-600 font-bold flex items-center gap-1 hover:underline"><Plus size={14} /> Tambah Baris</button>
            </div>

            {/* 9. KENDALA */}
            <div className="bg-white p-6 rounded-xl border shadow-sm">
                <h3 className={sectionTitle}>G. Kendala & Solusi</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs mb-3">
                        <thead className="text-left font-bold text-gray-500 bg-gray-50">
                            <tr>
                                <th className="p-2">Kendala (1)</th>
                                <th className="p-2">Solusi (2)</th>
                                <th className="p-2">Ket (3)</th>
                                <th className="p-2 w-10"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.data_kendala.map((item, idx) => (
                                <tr key={idx} className="border-b last:border-0">
                                    <td className="p-1"><input value={item.masalah} onChange={(e) => handleArrayChange(idx, 'masalah', e.target.value, 'data_kendala')} className={inputStyle} /></td>
                                    <td className="p-1"><input value={item.solusi} onChange={(e) => handleArrayChange(idx, 'solusi', e.target.value, 'data_kendala')} className={inputStyle} /></td>
                                    <td className="p-1"><input value={item.ket} onChange={(e) => handleArrayChange(idx, 'ket', e.target.value, 'data_kendala')} className={inputStyle} /></td>
                                    <td className="p-1 text-center"><button onClick={() => removeRow(idx, 'data_kendala')} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <button onClick={() => addRow('data_kendala', { masalah: '', solusi: '', ket: '' })} className="text-xs text-blue-600 font-bold flex items-center gap-1 hover:underline"><Plus size={14} /> Tambah Baris</button>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="flex justify-end pt-5">
                <button onClick={handleSubmit} disabled={loading} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-blue-700 flex items-center gap-2 transition-transform active:scale-95 disabled:bg-gray-400">
                    <Save size={20} /> {loading ? 'Mengirim...' : 'Simpan & Kirim Laporan'}
                </button>
            </div>
        </div>
    )
}