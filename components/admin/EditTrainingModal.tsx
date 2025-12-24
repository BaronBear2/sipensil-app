'use client'

import { useState } from 'react'
import { X, Save, Upload } from 'lucide-react'
import { updateTrainingAction } from '@/actions/dinas'

export default function EditTrainingModal({ training, onClose }: { training: any, onClose: () => void }) {
    const [isLoading, setIsLoading] = useState(false)

    // Form State
    const [formData, setFormData] = useState({
        title: training.title,
        provider: training.provider,
        category: training.category,
        description: training.description,
        quota: training.quota,
        min_age: training.min_age,
        max_age: training.max_age,
        certification: training.certification,
        requirements: training.requirements?.join('\n') || '',
        image_url: training.image_url || '',
        registration_start: training.registration_start,
        registration_end: training.registration_end
    })

    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    // Simple File Upload Mock (or implementation if bucket ready)
    // For now, let's keep it simple: Real implementation would need Supabase Storage client here
    // But to save time and avoid "Bucket not found" errors blocking the user, 
    // I will stick to text input for URL OR file input that assumes we handle it in Server Action (FormData).
    // Server Actions can handle File objects directly now!
    // So I will use <input type="file" name="image" /> and handle in action.

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!confirm("Simpan perubahan?")) return

        setIsLoading(true)

        const fd = new FormData(e.target as HTMLFormElement)
        // Add ID explicitly
        fd.append('id', training.id)

        const res = await updateTrainingAction(fd)
        if (res?.error) {
            alert(res.error)
        } else {
            alert("Berhasil update data pelatihan!")
            window.location.reload()
        }
        setIsLoading(false)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="font-bold text-lg">Edit Pelatihan</h3>
                    <button onClick={onClose}><X /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold block mb-1">Judul</label>
                            <input name="title" value={formData.title} onChange={handleChange} className="w-full border p-2 rounded text-sm" required />
                        </div>
                        <div>
                            <label className="text-xs font-bold block mb-1">Penyelenggara</label>
                            <input name="provider" value={formData.provider} onChange={handleChange} className="w-full border p-2 rounded text-sm" required />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold block mb-1">Kategori</label>
                            <input name="category" value={formData.category} onChange={handleChange} className="w-full border p-2 rounded text-sm" required />
                        </div>
                        <div>
                            <label className="text-xs font-bold block mb-1">Kuota</label>
                            <input type="number" name="quota" value={formData.quota} onChange={handleChange} className="w-full border p-2 rounded text-sm" required />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold block mb-1">Deskripsi</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} className="w-full border p-2 rounded text-sm h-20" required></textarea>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs font-bold block mb-1">Min Usia</label>
                            <input type="number" name="min_age" value={formData.min_age} onChange={handleChange} className="w-full border p-2 rounded text-sm" />
                        </div>
                        <div>
                            <label className="text-xs font-bold block mb-1">Max Usia</label>
                            <input type="number" name="max_age" value={formData.max_age} onChange={handleChange} className="w-full border p-2 rounded text-sm" />
                        </div>
                        <div>
                            <label className="text-xs font-bold block mb-1">Sertifikasi</label>
                            <input name="certification" value={formData.certification} onChange={handleChange} className="w-full border p-2 rounded text-sm" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold block mb-1">Tgl Mulai Pendaftaran</label>
                            <input type="date" name="registration_start" value={formData.registration_start || ''} onChange={handleChange} className="w-full border p-2 rounded text-sm" />
                        </div>
                        <div>
                            <label className="text-xs font-bold block mb-1">Tgl Akhir Pendaftaran</label>
                            <input type="date" name="registration_end" value={formData.registration_end || ''} onChange={handleChange} className="w-full border p-2 rounded text-sm" />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold block mb-1">Persyaratan (Baris baru per poin)</label>
                        <textarea name="requirements" value={formData.requirements} onChange={handleChange} className="w-full border p-2 rounded text-sm h-24"></textarea>
                    </div>

                    <div>
                        <label className="text-xs font-bold block mb-1">Update Gambar (Opsional)</label>
                        <input type="file" name="image" accept="image/*" className="w-full border p-2 rounded text-sm file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                        <p className="text-[10px] text-gray-400 mt-1">*Akan menggantikan gambar lama jika diisi.</p>
                    </div>

                    <div className="pt-4 flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 border rounded font-bold text-sm">Batal</button>
                        <button type="submit" disabled={isLoading} className="px-6 py-2 bg-blue-600 text-white rounded font-bold text-sm hover:bg-blue-700">
                            {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
