'use client'

import { Edit, Trash2, Users, Calendar, MapPin, Archive } from 'lucide-react'
import Link from 'next/link'
import { deleteTrainingAction, archiveTrainingAction } from '@/actions/dinas'
import { useState } from 'react'

export default function TrainingListV2({ trainings }: { trainings: any[] }) {
    const [loadingMap, setLoadingMap] = useState<{ [key: string]: boolean }>({})
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, id: string | null, title: string | null }>({ isOpen: false, id: null, title: null })
    const [archiveModal, setArchiveModal] = useState<{ isOpen: boolean, id: string | null, title: string | null }>({ isOpen: false, id: null, title: null })
    const [isDeleting, setIsDeleting] = useState(false)
    const [isArchiving, setIsArchiving] = useState(false)

    const handleDeleteClick = (item: any) => {
        setDeleteModal({ isOpen: true, id: item.id, title: item.title })
    }

    const confirmDelete = async () => {
        if (!deleteModal.id) return

        setIsDeleting(true)
        try {
            const formData = new FormData()
            formData.append('id', deleteModal.id)
            const res = await deleteTrainingAction(formData)

            if (res?.error) {
                alert(res.error) // Show specific error from server (e.g. "Masih ada peserta")
            } else {
                window.location.reload() // Or revalidate logic
            }
        } catch (e) {
            alert('Terjadi kesalahan sistem.')
        } finally {
            setIsDeleting(false)
            setDeleteModal({ isOpen: false, id: null, title: null })
        }
    }

    const handleArchiveClick = (item: any) => {
        setArchiveModal({ isOpen: true, id: item.id, title: item.title })
    }

    const confirmArchive = async () => {
        if (!archiveModal.id) return

        setIsArchiving(true)
        try {
            const formData = new FormData()
            formData.append('id', archiveModal.id)
            const res = await archiveTrainingAction(formData)

            if (res?.error) {
                alert(res.error)
            } else {
                window.location.reload()
            }
        } catch (e) {
            alert('Terjadi kesalahan sistem.')
        } finally {
            setIsArchiving(false)
            setArchiveModal({ isOpen: false, id: null, title: null })
        }
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trainings.map((item) => (
                    <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition group overflow-hidden flex flex-col">
                        {/* Header Image / Placeholder */}
                        <div className="h-32 bg-gray-100 relative">
                            {item.image_url ? (
                                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200">
                                    <span className="text-4xl font-black opacity-10 uppercase tracking-widest">BLK</span>
                                </div>
                            )}
                            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-gray-600 uppercase">
                                {item.category}
                            </div>
                        </div>

                        <div className="p-5 flex-1 flex flex-col">
                            <h3 className="font-bold text-gray-800 text-lg leading-tight mb-2 line-clamp-2" title={item.title}>
                                {item.title}
                            </h3>

                            <div className="space-y-2 mb-4 text-sm text-gray-500 flex-1">
                                <div className="flex items-center gap-2">
                                    <MapPin size={14} className="text-blue-500" />
                                    <span className="truncate">{item.provider}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users size={14} className="text-blue-500" />
                                    <span>Kuota: {item.quota} Peserta</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} className="text-blue-500" />
                                    <span className="text-xs">
                                        {item.registration_start ? new Date(item.registration_start).toLocaleDateString('id-ID') : '-'} s/d {item.registration_end ? new Date(item.registration_end).toLocaleDateString('id-ID') : '-'}
                                    </span>
                                </div>
                            </div>

                            <div className="pt-4 border-t flex gap-2">
                                <Link href={`/dashboard/dinas/pelatihan/${item.id}/edit`} className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg font-bold text-sm hover:bg-blue-100 flex items-center justify-center gap-2 transition">
                                    <Edit size={16} /> Edit
                                </Link>
                                <button
                                    onClick={() => handleArchiveClick(item)}
                                    title="Arsipkan"
                                    className="w-12 bg-gray-100 text-gray-500 py-2 rounded-lg font-bold text-sm hover:bg-gray-200 flex items-center justify-center transition"
                                >
                                    <Archive size={16} />
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(item)}
                                    className="w-12 bg-red-50 text-red-500 py-2 rounded-lg font-bold text-sm hover:bg-red-100 flex items-center justify-center transition"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Delete Warning Modal */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
                                <Trash2 size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Hapus Pelatihan?</h3>
                            <p className="text-gray-500 text-sm mb-6">
                                Anda akan menghapus pelatihan <span className="font-bold text-gray-800">"{deleteModal.title}"</span>.
                                <br /><br />
                                <span className="bg-red-50 text-red-600 px-2 py-1 rounded font-bold text-xs uppercase tracking-wide">PENTING</span>
                                <br />
                                Pastikan <span className="font-bold">tidak ada peserta</span> yang terdaftar atau sedang dalam proses verifikasi. Jika masih ada data terkait, penghapusan akan digagalkan oleh sistem.
                            </p>

                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setDeleteModal({ isOpen: false, id: null, title: null })}
                                    className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition"
                                    disabled={isDeleting}
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 py-3 px-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition flex items-center justify-center gap-2"
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Archive Confirmation Modal */}
            {archiveModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mb-4">
                                <Archive size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Arsipkan Pelatihan?</h3>
                            <p className="text-gray-500 text-sm mb-6">
                                Anda akan mengarsipkan pelatihan <span className="font-bold text-gray-800">"{archiveModal.title}"</span> ke status <span className="font-bold">SELESAI/LEGACY</span>.
                                <br /><br />
                                Pelatihan ini akan hilang dari katalog pencaker dan pindah ke halaman "Riwayat / Legacy".
                                <br /><br />
                                <span className="bg-orange-50 text-orange-600 px-2 py-1 rounded font-bold text-xs uppercase tracking-wide">PERINGATAN</span>
                                <br />
                                Tindakan ini akan otomatis mengubah status semua peserta yang sedang pelatihan menjadi <span className="font-bold">SUDAH SELESAI</span>.
                            </p>

                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setArchiveModal({ isOpen: false, id: null, title: null })}
                                    className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition"
                                    disabled={isArchiving}
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={confirmArchive}
                                    className="flex-1 py-3 px-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2"
                                    disabled={isArchiving}
                                >
                                    {isArchiving ? 'Menyimpan...' : 'Ya, Arsipkan'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
