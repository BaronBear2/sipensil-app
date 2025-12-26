'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Upload } from 'lucide-react'

interface TrainingFormProps {
    initialData?: any
    actionFn: (formData: FormData) => Promise<any>
    isEdit?: boolean
}

export default function TrainingForm({ initialData, actionFn, isEdit = false }: TrainingFormProps) {
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
        image_url: initialData?.image_url || ''
    })

    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleImageChange = (e: any) => {
        const file = e.target.files[0]
        if (file) {
            setPreviewImage(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!confirm(isEdit ? "Simpan perubahan?" : "Buat pelatihan baru?")) return

        setLoading(true)

        try {
            const fd = new FormData(e.target as HTMLFormElement)
            if (isEdit && initialData?.id) {
                fd.append('id', initialData.id)
            }

            const res = await actionFn(fd)
            if (res?.error) {
                alert(res.error)
            } else {
                alert(isEdit ? "Berhasil update data!" : "Berhasil membuat pelatihan!")
                router.push('/dashboard/dinas/pelatihan')
                router.refresh()
            }
        } catch (err) {
            alert("Terjadi kesalahan sistem.")
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
                        <input name="title" value={formData.title} onChange={handleChange} className="w-full border p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Contoh: Pelatihan Desain Grafis" required />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Penyelenggara</label>
                        <input name="provider" value={formData.provider} onChange={handleChange} className="w-full border p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Contoh: UPTD BLK Disnaker" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Kategori</label>
                            <input name="category" value={formData.category} onChange={handleChange} className="w-full border p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="IT, Las, Boga..." required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Sertifikasi</label>
                            <input name="certification" value={formData.certification} onChange={handleChange} className="w-full border p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="BNSP / Lokal" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Deskripsi Pelatihan</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} className="w-full border p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none h-32" placeholder="Jelaskan secara singkat tentang materi pelatihan..." required></textarea>
                    </div>
                </div>

                {/* Right Column: Details & Dates */}
                <div className="space-y-6">
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 space-y-4">
                        <h3 className="font-bold text-blue-800 text-sm mb-4">Detail & Persyaratan</h3>
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
                                <input type="date" name="registration_start" value={formData.registration_start} onChange={handleChange} className="w-full border p-2 rounded text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Akhir Pendaftaran</label>
                                <input type="date" name="registration_end" value={formData.registration_end} onChange={handleChange} className="w-full border p-2 rounded text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Mulai Pelatihan</label>
                                <input type="date" name="training_start_date" value={formData.training_start_date} onChange={handleChange} className="w-full border p-2 rounded text-sm" required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Selesai Pelatihan</label>
                                <input type="date" name="training_end_date" value={formData.training_end_date} onChange={handleChange} className="w-full border p-2 rounded text-sm" required />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Persyaratan Peserta</label>
                        <textarea name="requirements" value={formData.requirements} onChange={handleChange} className="w-full border p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none h-32" placeholder="Tulis persyaratan per baris..."></textarea>
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

            {/* Footer Actions */}
            <div className="border-t pt-6 flex justify-end gap-3">
                <Link href="/dashboard/dinas/pelatihan" className="px-6 py-3 border rounded-lg font-bold text-gray-600 hover:bg-gray-50">
                    Batal
                </Link>
                <button disabled={loading} className="px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-lg flex items-center gap-2">
                    <Save size={18} />
                    {loading ? 'Menyimpan...' : 'Simpan Pelatihan'}
                </button>
            </div>

        </form>
    )
}
