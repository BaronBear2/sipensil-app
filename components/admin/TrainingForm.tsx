'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Upload, Plus, Trash2, Copy, XCircle } from 'lucide-react'
import { SwalAlert, SwalConfirm, SwalToast } from '@/utils/swal'
import Swal from 'sweetalert2'

interface TrainingFormProps {
    initialData?: any
    actionFn: (formData: FormData) => Promise<any>
    isEdit?: boolean
    categories?: any[]
    locations?: any[]
    requirements?: any[]
    notes?: any[]
    pastTrainings?: any[]
}

const SELECTION_TYPES = [
    'Tes Psikotes',
    'Tes Wawancara',
    'Tes Fisik',
    'Tes Tertulis'
]

const SELECTION_COLORS: Record<string, { bg: string, text: string, border: string, ring: string, borderL: string }> = {
    'Tes Psikotes': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', ring: 'focus:ring-purple-500', borderL: 'border-l-purple-500' },
    'Seleksi Psikotes': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', ring: 'focus:ring-purple-500', borderL: 'border-l-purple-500' },
    'Tes Wawancara': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', ring: 'focus:ring-indigo-500', borderL: 'border-l-indigo-500' },
    'Seleksi Wawancara': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', ring: 'focus:ring-indigo-500', borderL: 'border-l-indigo-500' },
    'Tes Fisik': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', ring: 'focus:ring-orange-500', borderL: 'border-l-orange-500' },
    'Seleksi Tes Fisik': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', ring: 'focus:ring-orange-500', borderL: 'border-l-orange-500' },
    'Tes Tertulis': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', ring: 'focus:ring-emerald-500', borderL: 'border-l-emerald-500' },
    'Seleksi Tertulis': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', ring: 'focus:ring-emerald-500', borderL: 'border-l-emerald-500' }
}

export default function TrainingForm({ initialData, actionFn, isEdit = false, categories = [], locations = [], requirements = [], notes = [], pastTrainings = [] }: TrainingFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [previewImage, setPreviewImage] = useState<string | null>(initialData?.image_url || null)

    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        provider: initialData?.provider || '',
        category: initialData?.category || '',
        description: initialData?.description || '',
        quota: initialData?.quota || '',
        min_age: initialData?.min_age || '',
        max_age: initialData?.max_age || '',
        certification: initialData?.certification || '',
        requirements: initialData?.requirements?.join('\n') || '',
        registration_start: initialData?.registration_start || '',
        registration_end: initialData?.registration_end || '',
        training_start_date: initialData?.training_start_date || '',
        training_end_date: initialData?.training_end_date || '',
        training_start_time: initialData?.training_start_time || '',
        training_end_time: initialData?.training_end_time || '',
        image_url: initialData?.image_url || '',
        whatsapp_group_link: initialData?.whatsapp_group_link || ''
    })

    const [selections, setSelections] = useState<any[]>(
        initialData?.training_selections?.map((s: any) => ({
            ...s,
            selection_date: s.selection_date ? s.selection_date.split('T')[0] : '',
            selection_time: s.selection_time ? s.selection_time.substring(0, 5) : ''
        })) || []
    )
    const [exams, setExams] = useState<any[]>(
        initialData?.training_exams?.map((e: any) => ({
            ...e,
            exam_date: e.exam_date ? e.exam_date.split('T')[0] : '',
            exam_time: e.exam_time ? e.exam_time.substring(0, 5) : ''
        })) || []
    )

    const [newDoc, setNewDoc] = useState('')
    const [additionalDocs, setAdditionalDocs] = useState<string[]>(
        initialData?.additional_documents || []
    )

    const addAdditionalDoc = () => {
        if (newDoc.trim() && !additionalDocs.includes(newDoc.trim())) {
            setAdditionalDocs([...additionalDocs, newDoc.trim()])
            setNewDoc('')
        }
    }
    const removeAdditionalDoc = (doc: string) => {
        setAdditionalDocs(additionalDocs.filter(d => d !== doc))
    }

    const handleImageChange = (e: any) => {
        const file = e.target.files[0]
        if (file) {
            setPreviewImage(URL.createObjectURL(file))
        }
    }

    const handleChange = (e: any) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })

        if (name === 'provider') {
            const selectedLoc = locations.find(l => l.name === value)
            if (selectedLoc?.address) {
                setSelections(prev => prev.map(s => ({ ...s, location_address: s.location_address || selectedLoc.address })))
                setExams(prev => prev.map(ex => ({ ...ex, address: ex.address || selectedLoc.address })))
            }
        }
    }

    const toggleTextareaItem = (field: 'requirements' | 'description', text: string, isChecked: boolean) => {
        let currentText = formData[field]
        if (isChecked) {
            currentText = currentText ? `${currentText}\n- ${text}` : `- ${text}`
        } else {
            currentText = currentText.replace(`- ${text}`, '').replace(/\n\n/g, '\n').trim()
        }
        setFormData({ ...formData, [field]: currentText })
    }

    // --- SELECTIONS LOGIC ---
    const addSelection = (typeName: string) => {
        const loc = locations.find(l => l.name === formData.provider)
        setSelections([...selections, { name: typeName, selection_date: '', selection_time: '', location_address: loc?.address || '' }])
    }

    const removeSelection = (index: number) => {
        setSelections(selections.filter((_, i) => i !== index))
    }

    const updateSelection = (index: number, field: string, value: any) => {
        const newSelections = [...selections]
        newSelections[index][field] = value
        setSelections(newSelections)
    }

    // --- EXAMS LOGIC ---
    const addExam = () => {
        const loc = locations.find(l => l.name === formData.provider)
        setExams([...exams, { name: 'Ujian Sertifikasi', exam_date: '', exam_time: '', address: loc?.address || '' }])
    }

    const removeExam = (index: number) => {
        setExams(exams.filter((_, i) => i !== index))
    }

    const updateExam = (index: number, field: string, value: any) => {
        const newExams = [...exams]
        newExams[index][field] = value
        setExams(newExams)
    }

    // --- SELECTIONS LOGIC ---

    // --- FAIL SAFE VALIDATIONS ---
    const validateDates = () => {
        const currentYear = new Date().getFullYear()
        
        const regStart = new Date(formData.registration_start)
        const regEnd = new Date(formData.registration_end)
        const trainStart = new Date(formData.training_start_date)
        const trainEnd = new Date(formData.training_end_date)

        if (regStart.getFullYear() < 2000 || regStart.getFullYear() > currentYear + 5) return "Tahun Mulai Pendaftaran tidak masuk akal."
        if (regStart > regEnd) return "Tanggal Selesai Pendaftaran tidak boleh mendahului Mulai Pendaftaran."
        if (trainStart > trainEnd) return "Tanggal Selesai Pelatihan tidak boleh mendahului Mulai Pelatihan."
        if (regEnd > trainEnd) return "Pendaftaran tidak bisa berakhir setelah pelatihan selesai."

        for (let i = 0; i < selections.length; i++) {
            if (!selections[i].selection_date || !selections[i].selection_time) {
                return `Jadwal seleksi "${selections[i].name}" harus memiliki tanggal dan waktu.`
            }
        }
        for (let i = 0; i < exams.length; i++) {
            if (!exams[i].exam_date || !exams[i].exam_time) {
                return `Jadwal ujian "${exams[i].name}" harus memiliki tanggal dan waktu.`
            }
        }

        return null // No errors
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const dateError = validateDates()
        if (dateError) {
            SwalAlert.fire({ icon: 'warning', title: 'Cek Tanggal Kembali', text: dateError })
            return
        }

        const confirm = await SwalConfirm.fire({
            title: isEdit ? 'Simpan Perubahan?' : 'Buat Pelatihan Baru?',
            text: isEdit ? 'Pastikan data yang diubah sudah benar.' : 'Pelatihan akan segera ditayangkan di katalog.',
            confirmButtonText: isEdit ? 'Ya, Simpan' : 'Ya, Buat'
        })

        if (!confirm.isConfirmed) return

        setLoading(true)

        try {
            const fd = new FormData(e.target as HTMLFormElement)
            if (isEdit && initialData?.id) {
                fd.append('id', initialData.id)
            }

            // Append dynamic arrays as JSON strings
            fd.append('selections_json', JSON.stringify(selections))
            fd.append('exams_json', JSON.stringify(exams))
            fd.append('additional_documents_json', JSON.stringify(additionalDocs))

            const res = await actionFn(fd)
            if (res?.error) {
                SwalAlert.fire({ icon: 'error', title: 'Gagal Menyimpan', text: res.error })
            } else {
                SwalToast.fire({ icon: 'success', title: isEdit ? 'Data Berhasil Diupdate' : 'Pelatihan Berhasil Dibuat' })
                router.push('/dashboard/dinas/pelatihan')
                router.refresh()
            }
        } catch (err) {
            SwalAlert.fire({ icon: 'error', title: 'Error', text: 'Terjadi kesalahan sistem.' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-6">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/dinas/pelatihan" className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">{isEdit ? 'Edit Pelatihan' : 'Tambah Pelatihan Baru'}</h1>
                        <p className="text-gray-500 text-sm">{isEdit ? 'Perbarui informasi pelatihan yang sudah ada.' : 'Isi formulir untuk menambahkan katalog pelatihan baru.'}</p>
                    </div>
                </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Basic Info */}
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Judul Pelatihan</label>
                        <input name="title" value={formData.title} onChange={handleChange} className="w-full border p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Contoh: Pelatihan Desain Grafis Angkatan 1" required />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Alamat Pelatihan</label>
                        <select name="provider" value={formData.provider} onChange={handleChange} className="w-full border p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" required>
                            <option value="">-- Pilih Alamat Pelatihan --</option>
                            {locations.map((loc, idx) => (
                                <option key={idx} value={loc.name}>{loc.name}</option>
                            ))}
                            {locations.length === 0 && <option value="" disabled>Data Alamat Kosong. Buat di Master Data.</option>}
                            {/* Fallback for old data not in master */}
                            {formData.provider && !locations.find(l => l.name === formData.provider) && (
                                <option value={formData.provider}>{formData.provider} (Lama)</option>
                            )}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Kategori</label>
                            <select name="category" value={formData.category} onChange={handleChange} className="w-full border p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" required>
                                <option value="">-- Kategori --</option>
                                {categories.map((cat, idx) => (
                                    <option key={idx} value={cat.name}>{cat.name}</option>
                                ))}
                                {categories.length === 0 && <option value="" disabled>Kosong.</option>}
                                {/* Fallback for old data not in master */}
                                {formData.category && !categories.find(c => c.name === formData.category) && (
                                    <option value={formData.category}>{formData.category} (Lama)</option>
                                )}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Sertifikasi</label>
                            <input name="certification" value={formData.certification} onChange={handleChange} className="w-full border p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="BNSP / Lokal" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-bold text-gray-700">Catatan (Deskripsi Pelatihan)</label>
                        </div>
                        {notes && notes.length > 0 && (
                            <div className="mb-2 flex flex-wrap gap-2">
                                {notes.map((note, idx) => (
                                    <label key={idx} className="flex items-center gap-1.5 text-xs bg-gray-50 px-2 py-1 border rounded cursor-pointer hover:bg-gray-100 transition">
                                        <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" 
                                            checked={formData.description.includes(`- ${note.text}`)}
                                            onChange={(e) => toggleTextareaItem('description', note.text, e.target.checked)}
                                        />
                                        {note.text}
                                    </label>
                                ))}
                            </div>
                        )}
                        <textarea name="description" value={formData.description} onChange={handleChange} className="w-full border p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none h-32" placeholder="Jelaskan secara singkat tentang materi pelatihan..." required></textarea>
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-bold text-gray-700">Persyaratan Peserta</label>
                        </div>
                        {requirements && requirements.length > 0 && (
                            <div className="mb-2 flex flex-wrap gap-2">
                                {requirements.map((req, idx) => (
                                    <label key={idx} className="flex items-center gap-1.5 text-xs bg-gray-50 px-2 py-1 border rounded cursor-pointer hover:bg-gray-100 transition">
                                        <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" 
                                            checked={formData.requirements.includes(`- ${req.text}`)}
                                            onChange={(e) => toggleTextareaItem('requirements', req.text, e.target.checked)}
                                        />
                                        {req.text}
                                    </label>
                                ))}
                            </div>
                        )}
                        <textarea name="requirements" value={formData.requirements} onChange={handleChange} className="w-full border p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none h-32" placeholder="Tulis persyaratan per baris..."></textarea>
                    </div>

                    <div className="border-t pt-6 mt-6">
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-bold text-gray-700">Persyaratan Berkas Tambahan</label>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">Secara default KTP, Ijazah, dan Pas Foto sudah ada. Tambahkan berkas lain yang wajib diupload oleh pencaker (contoh: Kartu Keluarga, Surat Sehat).</p>
                        <div className="flex gap-2 mb-3">
                            <input type="text" value={newDoc} onChange={(e) => setNewDoc(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); addAdditionalDoc(); } }} className="border p-2 rounded text-sm flex-1" placeholder="Nama Berkas (ex: Kartu Keluarga)" />
                            <button type="button" onClick={addAdditionalDoc} className="bg-blue-600 text-white px-3 py-2 rounded text-sm font-bold hover:bg-blue-700">Tambah</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {additionalDocs.map((doc, idx) => (
                                <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-bold border border-blue-200 flex items-center gap-2">
                                    {doc}
                                    <button type="button" onClick={() => removeAdditionalDoc(doc)} className="text-red-500 hover:text-red-700"><XCircle size={14} /></button>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Details & Dates */}
                <div className="space-y-6">
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 space-y-4">
                        <h3 className="font-bold text-blue-800 text-sm mb-4">Detail Pelatihan</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Kuota Peserta</label>
                                <input type="number" name="quota" value={formData.quota} onChange={handleChange} className="w-full border p-2 rounded text-sm" required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Usia Min - Max</label>
                                <div className="flex items-center gap-2">
                                    <input type="number" name="min_age" value={formData.min_age} onChange={handleChange} className="w-full border p-2 rounded text-sm" placeholder="17" />
                                    <span className="text-gray-400">-</span>
                                    <input type="number" name="max_age" value={formData.max_age} onChange={handleChange} className="w-full border p-2 rounded text-sm" placeholder="50" />
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Mulai Pendaftaran</label>
                                <input type="date" name="registration_start" value={formData.registration_start} onChange={handleChange} className="w-full border p-2 rounded text-sm" required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Akhir Pendaftaran</label>
                                <input type="date" name="registration_end" value={formData.registration_end} onChange={handleChange} className="w-full border p-2 rounded text-sm" required />
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <label className="block text-xs font-bold text-gray-600 mb-1">Mulai Pelatihan</label>
                                <input type="date" name="training_start_date" value={formData.training_start_date} onChange={handleChange} className="w-full border p-2 rounded text-sm" required />
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <label className="block text-xs font-bold text-gray-600 mb-1">Selesai Pelatihan</label>
                                <input type="date" name="training_end_date" value={formData.training_end_date} onChange={handleChange} className="w-full border p-2 rounded text-sm" required />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-gray-600 mb-1">Jam Pelatihan Harian</label>
                                <div className="flex gap-2 items-center">
                                    <input type="time" name="training_start_time" value={formData.training_start_time} onChange={handleChange} className="w-full border p-2 rounded text-sm flex-1" placeholder="07:00" />
                                    <span className="text-gray-400 font-bold">-</span>
                                    <input type="time" name="training_end_time" value={formData.training_end_time} onChange={handleChange} className="w-full border p-2 rounded text-sm flex-1" placeholder="15:00" />
                                </div>
                            </div>
                        </div>
                        <div className="pt-2">
                            <label className="block text-xs font-bold text-gray-600 mb-1">Tautan Grup WhatsApp</label>
                            <input type="text" name="whatsapp_group_link" value={formData.whatsapp_group_link} onChange={handleChange} className="w-full border p-2 rounded text-sm" placeholder="https://chat.whatsapp.com/..." />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Foto / Poster</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition relative">
                            {previewImage ? (
                                <img src={previewImage} alt="Preview" className="h-40 object-cover rounded mb-2" />
                            ) : (
                                <div className="bg-gray-100 p-4 rounded-full mb-2">
                                    <Upload className="text-gray-400" />
                                </div>
                            )}
                            <input type="file" name="image" onChange={handleImageChange} accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                            <p className="text-xs text-gray-500">Klik atau geser gambar ke sini</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t pt-6 mt-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-800">Jadwal Seleksi Awal</h2>
                </div>
                
                {/* Standardized Selection Checkboxes -> Buttons to Add Multiple */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {SELECTION_TYPES.map((type) => {
                        const colors = SELECTION_COLORS[type] || { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', ring: 'focus:ring-blue-500', borderL: 'border-l-blue-500' }
                        return (
                            <button
                                key={type}
                                type="button"
                                onClick={() => addSelection(type)}
                                className={`text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition border ${colors.bg} ${colors.text} ${colors.border} hover:opacity-80`}
                            >
                                <Plus size={14} /> {type}
                            </button>
                        )
                    })}
                </div>

                {/* Details for checked selections */}
                <div className="space-y-4">
                    {selections.map((sel, index) => {
                        const colors = SELECTION_COLORS[sel.name] || { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', ring: 'focus:ring-blue-500', borderL: 'border-l-blue-500' }
                        return (
                        <div key={index} className={`p-4 border rounded-xl bg-gray-50 relative border-l-4 ${colors.borderL}`}>
                            <button type="button" onClick={() => removeSelection(index)} className="absolute top-4 right-4 text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                            <h4 className={`font-bold text-sm ${colors.text} mb-3 pr-8`}>{sel.name || 'Jadwal Seleksi'}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div><label className="block text-xs font-bold mb-1">Nama Seleksi</label><input type="text" value={sel.name || ''} onChange={(e) => updateSelection(index, 'name', e.target.value)} className="w-full border p-2 rounded text-sm bg-white" placeholder="Nama Seleksi" required /></div>
                                <div><label className="block text-xs font-bold mb-1">Tgl Seleksi</label><input type="date" value={sel.selection_date} onChange={(e) => updateSelection(index, 'selection_date', e.target.value)} className="w-full border p-2 rounded text-sm bg-white" required /></div>
                                <div><label className="block text-xs font-bold mb-1">Waktu Seleksi</label><input type="time" value={sel.selection_time} onChange={(e) => updateSelection(index, 'selection_time', e.target.value)} className="w-full border p-2 rounded text-sm bg-white" required /></div>
                                <div><label className="block text-xs font-bold mb-1">Lokasi Seleksi</label><input type="text" value={sel.location_address} onChange={(e) => updateSelection(index, 'location_address', e.target.value)} className="w-full border p-2 rounded text-sm bg-white" placeholder="Ruang Aula BLK" required /></div>
                            </div>
                        </div>
                        )
                    })}
                    {selections.length === 0 && <p className="text-sm text-gray-500 italic">Tambahkan jenis seleksi di atas untuk mengatur jadwal.</p>}
                </div>
            </div>

            <div className="border-t pt-6 mt-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-800">Jadwal Ujian Kompetensi</h2>
                    <div className="flex gap-2">
                        <button type="button" onClick={addExam} className="text-sm bg-green-100 text-green-700 px-3 py-1.5 rounded-lg font-bold hover:bg-green-200 flex items-center gap-1 transition">
                            <Plus size={16} /> Tambah Ujian
                        </button>
                    </div>
                </div>
                <div className="space-y-4">
                    {exams.map((exm, index) => (
                        <div key={index} className="p-4 border rounded-xl bg-gray-50 relative border-l-4 border-l-green-500">
                            <button type="button" onClick={() => removeExam(index)} className="absolute top-4 right-4 text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pr-8">
                                <div><label className="block text-xs font-bold mb-1">Nama Ujian</label><input type="text" value={exm.name} onChange={(e) => updateExam(index, 'name', e.target.value)} className="w-full border p-2 rounded text-sm bg-white" placeholder="Ujian Praktik Las" required /></div>
                                <div><label className="block text-xs font-bold mb-1">Tgl Ujian</label><input type="date" value={exm.exam_date} onChange={(e) => updateExam(index, 'exam_date', e.target.value)} className="w-full border p-2 rounded text-sm bg-white" required /></div>
                                <div><label className="block text-xs font-bold mb-1">Waktu Ujian</label><input type="time" value={exm.exam_time} onChange={(e) => updateExam(index, 'exam_time', e.target.value)} className="w-full border p-2 rounded text-sm bg-white" required /></div>
                                <div><label className="block text-xs font-bold mb-1">Lokasi Ujian</label><input type="text" value={exm.address} onChange={(e) => updateExam(index, 'address', e.target.value)} className="w-full border p-2 rounded text-sm bg-white" required /></div>
                            </div>
                        </div>
                    ))}
                    {exams.length === 0 && <p className="text-sm text-gray-500 italic">Belum ada jadwal ujian.</p>}
                </div>
            </div>

            {/* Footer Actions */}
            <div className="border-t pt-6 flex justify-end gap-3">
                <Link href="/dashboard/dinas/pelatihan" className="px-6 py-3 border rounded-lg font-bold text-gray-600 hover:bg-gray-50">
                    Batal
                </Link>
                <button disabled={loading} className="px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-lg flex items-center gap-2 transition transform hover:scale-105">
                    <Save size={18} />
                    {loading ? 'Menyimpan...' : 'Simpan Pelatihan'}
                </button>
            </div>
        </form>
    )
}
