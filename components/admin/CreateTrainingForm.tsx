'use client'

import { createTrainingAction } from '@/actions/dinas'
import { useState, useRef } from 'react'
import StatusModal from '@/components/ui/StatusModal'

export default function CreateTrainingForm() {
    const [statusModal, setStatusModal] = useState<{ isOpen: boolean; type: 'success' | 'error'; message: string }>({
        isOpen: false,
        type: 'success',
        message: ''
    })
    const [loading, setLoading] = useState(false)
    const formRef = useRef<HTMLFormElement>(null)

    const handleSubmit = async (formData: FormData) => {
        setLoading(true)
        try {
            const result = await createTrainingAction(formData)
            if (result?.error) {
                setStatusModal({ isOpen: true, type: 'error', message: result.error })
            } else {
                setStatusModal({ isOpen: true, type: 'success', message: 'Pelatihan berhasil dibuat!' })
                formRef.current?.reset()
                // Optionally close the details element via DOM or state if controlled, 
                // but since it's an uncontrolled <details>, we might leave it open or let user close.
            }
        } catch (err) {
            setStatusModal({ isOpen: true, type: 'error', message: 'Terjadi kesalahan sistem.' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <StatusModal
                isOpen={statusModal.isOpen}
                onClose={() => setStatusModal(prev => ({ ...prev, isOpen: false }))}
                type={statusModal.type}
                message={statusModal.message}
            />

            <form ref={formRef} action={handleSubmit}>
                <div className="space-y-4">
                    <input name="title" placeholder="Judul Pelatihan" className="w-full border p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" required />
                    <input name="provider" placeholder="Penyelenggara (mis: UPTD BLK)" className="w-full border p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" required />
                    <input name="category" placeholder="Kategori (mis: Las, IT)" className="w-full border p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" required />
                    <textarea name="description" placeholder="Deskripsi Singkat" className="w-full border p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" required></textarea>
                    <div className="grid grid-cols-2 gap-4">
                        <input type="number" name="quota" placeholder="Kuota" className="border p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" required />
                        <input type="text" name="certification" placeholder="Sertifikasi" className="border p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <input type="number" name="min_age" placeholder="Min Usia (17)" className="border p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                        <input type="number" name="max_age" placeholder="Max Usia (60)" className="border p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <textarea name="requirements" placeholder="Persyaratan (pisahkan baris)" className="w-full border p-3 rounded-lg text-sm h-24 mb-3 focus:ring-2 focus:ring-blue-500 outline-none"></textarea>

                    <div className="border border-dashed border-gray-300 p-4 rounded-lg bg-gray-50 mb-3 hover:bg-blue-50 transition-colors">
                        <label className="text-xs font-bold block mb-2 text-gray-600">Upload Gambar Poster (Opsional)</label>
                        <input type="file" name="image" accept="image/*" className="w-full text-xs text-gray-500 file:mr-2 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer" />
                    </div>

                    <button disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 shadow-lg transition-transform active:scale-95 disabled:bg-blue-400">
                        {loading ? 'Menyimpan...' : 'Simpan Pelatihan'}
                    </button>
                </div>
            </form>
        </>
    )
}
