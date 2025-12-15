'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Save, FileText, AlertTriangle } from 'lucide-react'
import { submitLpkReport } from '@/actions/organization'

// Props menerima 'initialData' jika ini adalah revisi
export default function LpkReportForm({ profile, initialData }: { profile: any, initialData?: any }) {
  const [loading, setLoading] = useState(false)
  
  // Default State (Kosong)
  const defaultState = {
    semester: 'Ganjil', tahun: new Date().getFullYear().toString(),
    namaLpk: profile.company_name || '', 
    noReg: profile.vin || '', 
    karyawan: {
        laki: { tetap: 0, tidakTetap: 0, instrukturTetap: 0, instrukturTidakTetap: 0, asesor: 0 },
        perempuan: { tetap: 0, tidakTetap: 0, instrukturTetap: 0, instrukturTidakTetap: 0, asesor: 0 }
    },
    penyelenggaraan: [{ nama: '', jadwal: '', peserta: 0, lulusan: 0 }],
    ujiKompetensi: [{ lsp: '', skema: '', jadwal: '', peserta: 0, kompeten: 0 }],
    mitra: [{ nama: '', alamat: '', bentuk: '' }],
    kendala: [{ masalah: '', solusi: '' }]
  }

  const [reportData, setReportData] = useState(defaultState)

  // EFFECT: Jika ada initialData (Draft/Revisi), masukkan ke state
  useEffect(() => {
    if (initialData) {
        setReportData({
            semester: initialData.semester,
            tahun: initialData.tahun,
            namaLpk: initialData.nama_lpk,
            noReg: initialData.no_reg,
            karyawan: initialData.data_karyawan || defaultState.karyawan,
            penyelenggaraan: initialData.data_penyelenggaraan || defaultState.penyelenggaraan,
            ujiKompetensi: initialData.data_uji_kompetensi || defaultState.ujiKompetensi,
            mitra: initialData.data_mitra || defaultState.mitra,
            kendala: initialData.data_kendala || defaultState.kendala
        })
    }
  }, [initialData])

  // --- HANDLERS (Sama seperti sebelumnya) ---
  const handleChange = (e: any) => {
    setReportData({ ...reportData, [e.target.name]: e.target.value })
  }

  // Handler Nested Karyawan (Karena struktur object dalam object)
  const handleKaryawanChange = (gender: 'laki'|'perempuan', type: string, val: string) => {
      setReportData({
          ...reportData,
          karyawan: {
              ...reportData.karyawan,
              [gender]: {
                  ...reportData.karyawan[gender],
                  [type]: parseInt(val) || 0
              }
          }
      })
  }

  const handleArrayChange = (index: number, field: string, val: any, section: 'penyelenggaraan' | 'ujiKompetensi' | 'mitra' | 'kendala') => {
    const newData = [...reportData[section]] as any
    newData[index][field] = val
    setReportData({ ...reportData, [section]: newData })
  }

  const addRow = (section: 'penyelenggaraan' | 'ujiKompetensi' | 'mitra' | 'kendala', template: any) => {
    setReportData({ ...reportData, [section]: [...reportData[section], template] })
  }

  const removeRow = (index: number, section: 'penyelenggaraan' | 'ujiKompetensi' | 'mitra' | 'kendala') => {
    const newData = [...reportData[section]]
    newData.splice(index, 1)
    setReportData({ ...reportData, [section]: newData })
  }

  const handleSubmit = async () => {
    if(!confirm("Apakah data laporan sudah benar? Data akan dikirim ke Dinas untuk verifikasi.")) return
    setLoading(true)
    const res = await submitLpkReport(reportData)
    if(res.error) alert(res.error)
    else {
        alert(res.success)
        window.location.reload()
    }
    setLoading(false)
  }

  const sectionTitle = "font-bold text-gray-700 mb-3 bg-blue-50 p-2 rounded border-l-4 border-blue-500 flex items-center gap-2"
  const inputStyle = "border rounded p-2 text-xs w-full focus:ring-1 focus:ring-blue-500 outline-none"

  return (
    <div className="space-y-8 animate-fade-in">
        
        {/* PESAN JIKA REVISI */}
        {initialData && initialData.status === 'REJECTED' && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-start gap-3">
                <AlertTriangle className="text-red-500 mt-1"/>
                <div>
                    <h4 className="font-bold text-red-800">Laporan Perlu Revisi</h4>
                    <p className="text-sm text-red-700 mt-1">Laporan sebelumnya ditolak. Data lama telah dimuat, silakan perbaiki dan kirim ulang.</p>
                </div>
            </div>
        )}

        {/* I. DATA UMUM */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className={sectionTitle}><FileText size={16}/> I. Data Umum</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div><label className="text-xs font-bold">Semester</label>
                <select name="semester" value={reportData.semester} onChange={handleChange} className={inputStyle} disabled={!!initialData}>
                    <option value="Ganjil">Ganjil</option><option value="Genap">Genap</option>
                </select></div>
                <div><label className="text-xs font-bold">Tahun</label><input name="tahun" value={reportData.tahun} onChange={handleChange} className={inputStyle} disabled={!!initialData}/></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-xs font-bold">Nama LPK</label><input value={reportData.namaLpk} disabled className={`${inputStyle} bg-gray-100`}/></div>
                <div><label className="text-xs font-bold">No. VIN / Registrasi</label><input name="noReg" value={reportData.noReg} onChange={handleChange} className={inputStyle}/></div>
            </div>
        </div>

        {/* II. DATA KARYAWAN (Fixed Form sesuai Script) */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className={sectionTitle}>II. Data Karyawan & Instruktur</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-xs text-center border">
                    <thead className="bg-gray-100 font-bold">
                        <tr>
                            <th className="p-2 border">Kategori</th>
                            <th className="p-2 border">Pengelola Tetap</th>
                            <th className="p-2 border">Pengelola Tdk Tetap</th>
                            <th className="p-2 border">Instruktur Tetap</th>
                            <th className="p-2 border">Instruktur Tdk Tetap</th>
                            <th className="p-2 border">Asesor</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="p-2 border font-bold text-left">Laki-laki</td>
                            <td className="p-1 border"><input type="number" value={reportData.karyawan.laki.tetap} onChange={(e)=>handleKaryawanChange('laki','tetap',e.target.value)} className={inputStyle}/></td>
                            <td className="p-1 border"><input type="number" value={reportData.karyawan.laki.tidakTetap} onChange={(e)=>handleKaryawanChange('laki','tidakTetap',e.target.value)} className={inputStyle}/></td>
                            <td className="p-1 border"><input type="number" value={reportData.karyawan.laki.instrukturTetap} onChange={(e)=>handleKaryawanChange('laki','instrukturTetap',e.target.value)} className={inputStyle}/></td>
                            <td className="p-1 border"><input type="number" value={reportData.karyawan.laki.instrukturTidakTetap} onChange={(e)=>handleKaryawanChange('laki','instrukturTidakTetap',e.target.value)} className={inputStyle}/></td>
                            <td className="p-1 border"><input type="number" value={reportData.karyawan.laki.asesor} onChange={(e)=>handleKaryawanChange('laki','asesor',e.target.value)} className={inputStyle}/></td>
                        </tr>
                        <tr>
                            <td className="p-2 border font-bold text-left">Perempuan</td>
                            <td className="p-1 border"><input type="number" value={reportData.karyawan.perempuan.tetap} onChange={(e)=>handleKaryawanChange('perempuan','tetap',e.target.value)} className={inputStyle}/></td>
                            <td className="p-1 border"><input type="number" value={reportData.karyawan.perempuan.tidakTetap} onChange={(e)=>handleKaryawanChange('perempuan','tidakTetap',e.target.value)} className={inputStyle}/></td>
                            <td className="p-1 border"><input type="number" value={reportData.karyawan.perempuan.instrukturTetap} onChange={(e)=>handleKaryawanChange('perempuan','instrukturTetap',e.target.value)} className={inputStyle}/></td>
                            <td className="p-1 border"><input type="number" value={reportData.karyawan.perempuan.instrukturTidakTetap} onChange={(e)=>handleKaryawanChange('perempuan','instrukturTidakTetap',e.target.value)} className={inputStyle}/></td>
                            <td className="p-1 border"><input type="number" value={reportData.karyawan.perempuan.asesor} onChange={(e)=>handleKaryawanChange('perempuan','asesor',e.target.value)} className={inputStyle}/></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        {/* III. PENYELENGGARAAN (Dynamic) */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className={sectionTitle}>III. Kegiatan Penyelenggaraan Pelatihan</h3>
            {reportData.penyelenggaraan.map((item, idx) => (
                <div key={idx} className="flex gap-2 mb-2 items-center">
                    <input placeholder="Nama Program" value={item.nama} onChange={(e)=>handleArrayChange(idx, 'nama', e.target.value, 'penyelenggaraan')} className={inputStyle}/>
                    <input placeholder="Jadwal" value={item.jadwal} onChange={(e)=>handleArrayChange(idx, 'jadwal', e.target.value, 'penyelenggaraan')} className={inputStyle}/>
                    <input type="number" placeholder="Jml Peserta" value={item.peserta} onChange={(e)=>handleArrayChange(idx, 'peserta', e.target.value, 'penyelenggaraan')} className={`${inputStyle} w-24`}/>
                    <input type="number" placeholder="Jml Lulus" value={item.lulusan} onChange={(e)=>handleArrayChange(idx, 'lulusan', e.target.value, 'penyelenggaraan')} className={`${inputStyle} w-24`}/>
                    <button onClick={() => removeRow(idx, 'penyelenggaraan')} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                </div>
            ))}
            <button onClick={() => addRow('penyelenggaraan', { nama: '', jadwal: '', peserta: 0, lulusan: 0 })} className="text-xs text-blue-600 font-bold flex items-center gap-1 mt-2 hover:underline">
                <Plus size={14}/> Tambah Baris
            </button>
        </div>

        {/* IV. UJI KOMPETENSI (Dynamic) */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className={sectionTitle}>IV. Uji Kompetensi</h3>
            {reportData.ujiKompetensi.map((item, idx) => (
                <div key={idx} className="flex gap-2 mb-2 items-center">
                    <input placeholder="Nama LSP" value={item.lsp} onChange={(e)=>handleArrayChange(idx, 'lsp', e.target.value, 'ujiKompetensi')} className={inputStyle}/>
                    <input placeholder="Skema" value={item.skema} onChange={(e)=>handleArrayChange(idx, 'skema', e.target.value, 'ujiKompetensi')} className={inputStyle}/>
                    <input type="number" placeholder="Peserta" value={item.peserta} onChange={(e)=>handleArrayChange(idx, 'peserta', e.target.value, 'ujiKompetensi')} className={`${inputStyle} w-20`}/>
                    <input type="number" placeholder="Kompeten" value={item.kompeten} onChange={(e)=>handleArrayChange(idx, 'kompeten', e.target.value, 'ujiKompetensi')} className={`${inputStyle} w-20`}/>
                    <button onClick={() => removeRow(idx, 'ujiKompetensi')} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                </div>
            ))}
            <button onClick={() => addRow('ujiKompetensi', { lsp: '', skema: '', jadwal: '', peserta: 0, kompeten: 0 })} className="text-xs text-blue-600 font-bold flex items-center gap-1 mt-2 hover:underline">
                <Plus size={14}/> Tambah Baris
            </button>
        </div>

        {/* V. MITRA KERJA (Dynamic) */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className={sectionTitle}>V. Kerjasama Mitra</h3>
            {reportData.mitra.map((item, idx) => (
                <div key={idx} className="flex gap-2 mb-2 items-center">
                    <input placeholder="Nama Mitra" value={item.nama} onChange={(e)=>handleArrayChange(idx, 'nama', e.target.value, 'mitra')} className={inputStyle}/>
                    <input placeholder="Alamat" value={item.alamat} onChange={(e)=>handleArrayChange(idx, 'alamat', e.target.value, 'mitra')} className={inputStyle}/>
                    <input placeholder="Bentuk Kerjasama" value={item.bentuk} onChange={(e)=>handleArrayChange(idx, 'bentuk', e.target.value, 'mitra')} className={inputStyle}/>
                    <button onClick={() => removeRow(idx, 'mitra')} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                </div>
            ))}
            <button onClick={() => addRow('mitra', { nama: '', alamat: '', bentuk: '' })} className="text-xs text-blue-600 font-bold flex items-center gap-1 mt-2 hover:underline">
                <Plus size={14}/> Tambah Baris
            </button>
        </div>

        {/* VI. KENDALA (Dynamic) */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className={sectionTitle}>VI. Kendala & Solusi</h3>
            {reportData.kendala.map((item, idx) => (
                <div key={idx} className="flex gap-2 mb-2 items-center">
                    <input placeholder="Masalah yang dihadapi" value={item.masalah} onChange={(e)=>handleArrayChange(idx, 'masalah', e.target.value, 'kendala')} className={inputStyle}/>
                    <input placeholder="Upaya penyelesaian" value={item.solusi} onChange={(e)=>handleArrayChange(idx, 'solusi', e.target.value, 'kendala')} className={inputStyle}/>
                    <button onClick={() => removeRow(idx, 'kendala')} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                </div>
            ))}
            <button onClick={() => addRow('kendala', { masalah: '', solusi: '' })} className="text-xs text-blue-600 font-bold flex items-center gap-1 mt-2 hover:underline">
                <Plus size={14}/> Tambah Baris
            </button>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex justify-end">
            <button onClick={handleSubmit} disabled={loading} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-blue-700 flex items-center gap-2 transition-transform active:scale-95 disabled:bg-gray-400">
                <Save size={20}/> {loading ? 'Mengirim...' : 'Simpan & Kirim Laporan'}
            </button>
        </div>
    </div>
  )
}