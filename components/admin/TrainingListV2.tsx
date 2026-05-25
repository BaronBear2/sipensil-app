'use client'

import { Edit, Trash2, Users, Calendar, MapPin, Archive } from 'lucide-react'
import Link from 'next/link'
import { deleteTrainingAction, archiveTrainingAction } from '@/actions/dinas'
import { useState } from 'react'
import { SwalAlert, SwalConfirm, SwalToast } from '@/utils/swal'

export default function TrainingListV2({ trainings, categories = [] }: { trainings: any[], categories?: any[] }) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [isArchiving, setIsArchiving] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<string>('ALL')

    const filteredTrainings = trainings.filter(item => 
        selectedCategory === 'ALL' ? true : item.category === selectedCategory
    )

    const handleDeleteClick = async (item: any) => {
        if (item.totalApplicants > 0) {
            SwalAlert.fire({ 
                icon: 'error', 
                title: 'Tidak Dapat Dihapus', 
                text: 'Pelatihan tidak dapat dihapus karena sudah ada pencaker yang pernah mendaftar. Silakan gunakan fitur Arsipkan atau Edit.' 
            })
            return
        }

        const result = await SwalConfirm.fire({
            title: 'Hapus Pelatihan?',
            text: `Anda akan menghapus pelatihan "${item.title}". Pastikan tidak ada peserta yang terdaftar!`,
            confirmButtonText: 'Ya, Hapus',
            confirmButtonColor: '#d33'
        })

        if (!result.isConfirmed) return

        setIsDeleting(true)
        try {
            const formData = new FormData()
            formData.append('id', item.id)
            const res = await deleteTrainingAction(formData)

            if (res?.error) {
                SwalAlert.fire({ icon: 'error', title: 'Gagal Menghapus', text: res.error })
            } else {
                SwalToast.fire({ icon: 'success', title: 'Pelatihan Dihapus' })
                window.location.reload()
            }
        } catch (e) {
            SwalAlert.fire({ icon: 'error', title: 'Error', text: 'Terjadi kesalahan sistem.' })
        } finally {
            setIsDeleting(false)
        }
    }

    const handleArchiveClick = async (item: any) => {
        const result = await SwalConfirm.fire({
            title: 'Arsipkan Pelatihan?',
            text: `Pelatihan "${item.title}" akan dipindahkan ke arsip (Legacy) dan status peserta akan diselesaikan.`,
            confirmButtonText: 'Ya, Arsipkan',
            icon: 'info'
        })

        if (!result.isConfirmed) return

        setIsArchiving(true)
        try {
            const formData = new FormData()
            formData.append('id', item.id)
            const res = await archiveTrainingAction(formData)

            if (res?.error) {
                SwalAlert.fire({ icon: 'error', title: 'Gagal Mengarsipkan', text: res.error })
            } else {
                SwalToast.fire({ icon: 'success', title: 'Pelatihan Diarsipkan' })
                window.location.reload()
            }
        } catch (e) {
            SwalAlert.fire({ icon: 'error', title: 'Error', text: 'Terjadi kesalahan sistem.' })
        } finally {
            setIsArchiving(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Filter Section */}
            {categories && categories.length > 0 && (
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div className="font-bold text-gray-700">Filter Kategori:</div>
                    <select 
                        value={selectedCategory} 
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="border border-gray-200 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white hover:bg-gray-50 text-gray-700 font-bold text-sm transition-all cursor-pointer shadow-sm"
                    >
                        <option value="ALL">Semua Kategori</option>
                        {categories.map((c, idx) => (
                            <option key={idx} value={c.name}>{c.name}</option>
                        ))}
                    </select>
                </div>
            )}

            {filteredTrainings.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300 shadow-sm">
                    <p className="text-gray-400 font-bold mb-4">Tidak ada pelatihan yang cocok dengan filter.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTrainings.map((item) => (
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

                                <div className="space-y-3 mb-5 text-sm text-gray-600 flex-1">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 bg-red-50 rounded-md"><MapPin size={14} className="text-red-500" /></div>
                                        <span className="truncate font-medium">{item.provider}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 bg-red-50 rounded-md"><Users size={14} className="text-red-500" /></div>
                                        <span className="font-medium">Kuota: <strong className="text-red-600">{item.accCount || 0}</strong>/{item.quota} di-ACC</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 bg-red-50 rounded-md"><Calendar size={14} className="text-red-500" /></div>
                                        <span className="text-xs font-medium">
                                            {item.registration_start ? new Date(item.registration_start).toLocaleDateString('id-ID') : '-'} s/d {item.registration_end ? new Date(item.registration_end).toLocaleDateString('id-ID') : '-'}
                                        </span>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    {item.status === 'OPEN' ? (
                                        <Link href={`/dashboard/dinas/pelatihan/${item.id}`} className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-red-700 shadow-[0_0_15px_rgba(220,38,38,0.4)] animate-pulse transition">
                                            Verifikasi Pencaker
                                        </Link>
                                    ) : (
                                        <Link href={`/dashboard/dinas/pelatihan/${item.id}`} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 text-white py-3 rounded-xl font-bold text-sm hover:from-red-700 hover:to-rose-700 shadow-md hover:shadow-red-500/30 transition-all transform hover:-translate-y-0.5">
                                            Kelola Pelatihan
                                        </Link>
                                    )}
                                </div>

                                <div className="pt-4 border-t flex gap-2">
                                    <Link href={`/dashboard/dinas/pelatihan/${item.id}/edit`} className="flex-1 bg-red-50 text-red-600 py-2.5 rounded-xl font-bold text-sm hover:bg-red-100 flex items-center justify-center gap-2 transition-colors">
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
            )}
        </div>
    )
}
