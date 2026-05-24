'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Upload, Plus, Trash2, Globe, Lock, Info, CheckCircle2 } from 'lucide-react'
import { publishAnnouncementAction, deleteAnnouncementAction, triggerManualCronAction } from '@/actions/announcements'
import { SwalAlert, SwalConfirm, SwalToast } from '@/utils/swal'

export default function AnnouncementManager({ trainingId, announcements, training }: { trainingId: string, announcements: any[], training: any }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [isTriggering, setIsTriggering] = useState(false)

    // Form state
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({
        type: 'administrasi',
        content: '',
    })
    const [file, setFile] = useState<File | null>(null)

    const handlePublish = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const fd = new FormData()
            fd.append('trainingId', trainingId)
            fd.append('type', formData.type)
            fd.append('content', formData.content)
            if (file) {
                fd.append('file', file)
            }

            const res = await publishAnnouncementAction(fd)
            if (res?.error) {
                SwalAlert.fire({ icon: 'error', title: 'Gagal', text: res.error })
            } else {
                SwalToast.fire({ icon: 'success', title: 'Pengumuman Berhasil Dipublikasikan' })
                setShowForm(false)
                setFormData({ type: 'administrasi', content: '' })
                setFile(null)
                router.refresh()
            }
        } catch (err) {
            SwalAlert.fire({ icon: 'error', title: 'Error', text: 'Terjadi kesalahan sistem.' })
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        const confirm = await SwalConfirm.fire({
            title: 'Hapus Pengumuman?',
            text: 'Pengumuman yang dihapus tidak dapat dikembalikan.',
            confirmButtonText: 'Ya, Hapus'
        })

        if (confirm.isConfirmed) {
            const fd = new FormData()
            fd.append('id', id)
            const res = await deleteAnnouncementAction(fd)
            if (res?.error) {
                SwalAlert.fire({ icon: 'error', title: 'Gagal', text: res.error })
            } else {
                SwalToast.fire({ icon: 'success', title: 'Dihapus' })
                router.refresh()
            }
        }
    }

    const handleTriggerCron = async () => {
        const confirm = await SwalConfirm.fire({
            title: 'Jalankan Proses Kelulusan Otomatis?',
            text: 'Ini akan memproses kelulusan otomatis untuk Seleksi Awal dan Uji Kompetensi. Fitur ini tidak berlaku untuk tahap Administrasi.',
            confirmButtonText: 'Ya, Jalankan'
        })

        if (confirm.isConfirmed) {
            setIsTriggering(true)
            const fd = new FormData()
            fd.append('trainingId', trainingId)
            const res = await triggerManualCronAction(fd)
            setIsTriggering(false)

            if (res?.error) {
                SwalAlert.fire({ icon: 'error', title: 'Gagal', text: res.error })
            } else {
                SwalToast.fire({ icon: 'success', title: 'Proses Otomatis Berhasil Dijalankan' })
                router.refresh()
            }
        }
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Daftar Pengumuman</h2>
                <div className="flex gap-2">
                    <button onClick={handleTriggerCron} disabled={isTriggering} className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-bold hover:bg-green-200 transition flex items-center gap-2 text-sm">
                        {isTriggering ? 'Memproses...' : 'Jalankan Auto-Lulus (Sistem)'}
                    </button>
                    <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition flex items-center gap-2 text-sm">
                        <Plus size={16} /> Buat Pengumuman Manual
                    </button>
                </div>
            </div>

            {showForm && (
                <form onSubmit={handlePublish} className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Pengumuman Baru</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Jenis Pengumuman</label>
                            <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full border p-2.5 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 outline-none">
                                <option value="administrasi">Kelulusan Administrasi</option>
                                <option value="seleksi_awal">Kelulusan Seleksi Awal</option>
                                <option value="uji_kompetensi">Hasil Uji Kompetensi</option>
                                <option value="informasi_umum">Informasi Umum</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Pesan (Opsional)</label>
                            <textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className="w-full border p-2.5 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 outline-none" rows={3} placeholder="Tuliskan pesan atau instruksi untuk peserta..."></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Upload Dokumen PDF (Opsional)</label>
                            <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full border p-2 rounded-lg text-sm" />
                            <p className="text-xs text-gray-500 mt-1">Jika tidak diupload, sistem dapat menggunakan dokumen default. Jika diupload, dokumen ini akan menimpa default sistem.</p>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50">Batal</button>
                            <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700">{loading ? 'Menyimpan...' : 'Publikasikan'}</button>
                        </div>
                    </div>
                </form>
            )}

            <div className="space-y-4">
                {announcements.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-500">
                        <Globe size={48} className="mx-auto mb-4 text-gray-300" />
                        <p className="font-medium">Belum ada pengumuman yang dipublikasikan.</p>
                    </div>
                ) : (
                    announcements.map((ann) => (
                        <div key={ann.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm relative flex gap-4">
                            <div className="shrink-0 mt-1">
                                {ann.is_published ? <CheckCircle2 className="text-green-500" size={24} /> : <Lock className="text-gray-400" size={24} />}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded uppercase tracking-wider">{ann.type.replace('_', ' ')}</span>
                                        <span className="text-xs text-gray-400 ml-3">{new Date(ann.created_at).toLocaleString('id-ID')}</span>
                                    </div>
                                    <button onClick={() => handleDelete(ann.id)} className="text-red-400 hover:text-red-600 transition"><Trash2 size={16} /></button>
                                </div>
                                
                                {ann.content && (
                                    <p className="text-gray-700 text-sm mt-3 whitespace-pre-wrap">{ann.content}</p>
                                )}

                                {ann.document_url && (
                                    <div className="mt-4">
                                        <a href={ann.document_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm bg-gray-50 border hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-bold transition">
                                            <FileText size={16} className="text-red-500" /> Buka Dokumen PDF
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
