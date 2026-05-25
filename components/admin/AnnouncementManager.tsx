'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Upload, Plus, Trash2, Globe, Lock, Info, CheckCircle2, Edit2, Zap, Calendar } from 'lucide-react'
import { publishAnnouncementAction, deleteAnnouncementAction, generateDefaultDraftsAction, updateDraftAction } from '@/actions/announcements'
import { SwalAlert, SwalConfirm, SwalToast } from '@/utils/swal'

export default function AnnouncementManager({ trainingId, announcements, training }: { trainingId: string, announcements: any[], training: any }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    // Form state
    const [showForm, setShowForm] = useState(false)
    const [editId, setEditId] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        type: 'administrasi',
        content: '',
        scheduledDate: ''
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
            if (formData.scheduledDate) {
                fd.append('scheduledDate', formData.scheduledDate)
            }
            if (file) {
                fd.append('file', file)
            }

            let res;
            if (editId) {
                fd.append('id', editId)
                res = await updateDraftAction(fd)
            } else {
                res = await publishAnnouncementAction(fd)
            }

            if (res?.error) {
                SwalAlert.fire({ icon: 'error', title: 'Gagal', text: res.error })
            } else {
                SwalToast.fire({ icon: 'success', title: editId ? 'Draf Berhasil Disimpan' : 'Pengumuman Berhasil Dipublikasikan' })
                setShowForm(false)
                setEditId(null)
                setFormData({ type: 'administrasi', content: '', scheduledDate: '' })
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


    const handleGenerateDrafts = async () => {
        setLoading(true)
        const fd = new FormData()
        fd.append('trainingId', trainingId)
        const res = await generateDefaultDraftsAction(fd)
        setLoading(false)
        if (res?.error) {
            SwalAlert.fire({ icon: 'error', title: 'Gagal', text: res.error })
        } else {
            SwalToast.fire({ icon: 'success', title: 'Draf Default Berhasil Dibuat' })
            router.refresh()
        }
    }

    const handleEditClick = (ann: any) => {
        setEditId(ann.id)
        setFormData({ type: ann.type, content: ann.content || '', scheduledDate: ann.scheduled_date ? ann.scheduled_date.split('T')[0] : '' })
        setFile(null)
        setShowForm(true)
    }

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Globe className="text-blue-500" /> Daftar Pengumuman</h2>
                    <p className="text-sm text-gray-500">Kelola informasi kelulusan dan pengumuman lainnya.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button onClick={handleGenerateDrafts} disabled={loading} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-200 transition flex items-center gap-2 text-sm border">
                        <Zap size={16} /> Buat Draf Default
                    </button>
                    <button onClick={() => { setEditId(null); setFormData({ type: 'administrasi', content: '', scheduledDate: '' }); setShowForm(!showForm) }} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition flex items-center gap-2 text-sm">
                        <Plus size={16} /> Buat Manual
                    </button>
                </div>
            </div>

            {showForm && (
                <form onSubmit={handlePublish} className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Pengumuman Baru</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Jenis Pengumuman</label>
                            <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} disabled={!!editId} className={`w-full border p-2.5 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 outline-none ${editId ? 'opacity-50 cursor-not-allowed' : ''}`}>
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
                            <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full border p-2.5 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" accept=".pdf,.doc,.docx" />
                            <p className="text-xs text-gray-500 mt-1">Jika tidak diupload, sistem dapat menggunakan dokumen default. Jika diupload, dokumen ini akan menimpa default sistem.</p>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Jadwal Rilis (Opsional)</label>
                            <input type="date" value={formData.scheduledDate} onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })} className="w-full border p-2.5 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 outline-none" />
                            <p className="text-xs text-gray-500 mt-1">Jika diisi, pengumuman ini akan dipublikasikan secara otomatis pada tanggal tersebut melalui sistem harian.</p>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button type="button" onClick={() => { setShowForm(false); setEditId(null) }} className="px-4 py-2 border rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50">Batal</button>
                            <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700">{loading ? 'Menyimpan...' : (editId ? 'Simpan Draf' : 'Publikasikan')}</button>
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
                                        {!ann.is_published && (
                                            <span className="block text-xs font-bold text-orange-500 mt-2 flex items-center gap-1">
                                                <Calendar size={14} /> Akan dipublikasikan pada: {
                                                    ann.type === 'administrasi' ? (training.tanggal_pengumuman_kelulusan_administrasi ? new Date(training.tanggal_pengumuman_kelulusan_administrasi).toLocaleDateString('id-ID') : 'Belum diatur') :
                                                    ann.type === 'seleksi_awal' ? (training.tanggal_pengumuman_kelulusan_seleksi_awal ? new Date(training.tanggal_pengumuman_kelulusan_seleksi_awal).toLocaleDateString('id-ID') : 'Belum diatur') :
                                                    ann.type === 'uji_kompetensi' ? (training.tanggal_pengumuman_hasil_uji_kompetensi ? new Date(training.tanggal_pengumuman_hasil_uji_kompetensi).toLocaleDateString('id-ID') : 'Belum diatur') :
                                                    (ann.scheduled_date ? new Date(ann.scheduled_date).toLocaleDateString('id-ID') : 'Segera (Manual)')
                                                }
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        {!ann.is_published && (
                                            <button onClick={() => handleEditClick(ann)} className="text-blue-500 hover:text-blue-700 transition" title="Edit Draf"><Edit2 size={16} /></button>
                                        )}
                                        <button onClick={() => handleDelete(ann.id)} className="text-red-400 hover:text-red-600 transition" title="Hapus"><Trash2 size={16} /></button>
                                    </div>
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
