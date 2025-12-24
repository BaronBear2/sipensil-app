'use client'

import { Edit, Trash2, Users, Calendar, MapPin } from 'lucide-react'
import Link from 'next/link'
import { deleteTrainingAction } from '@/actions/dinas'
import { useState } from 'react'

export default function TrainingListV2({ trainings }: { trainings: any[] }) {
    const [loadingMap, setLoadingMap] = useState<{ [key: string]: boolean }>({})

    const handleDelete = async (id: string) => {
        if (!confirm('Hapus pelatihan ini? Data peserta tidak akan hilang, tapi pelatihan tidak akan muncul di daftar.')) return

        setLoadingMap(prev => ({ ...prev, [id]: true }))
        try {
            const formData = new FormData()
            formData.append('id', id)
            await deleteTrainingAction(formData)
            // Optional: Show toast
            alert('Pelatihan dihapus.')
        } catch (e) {
            alert('Gagal menghapus.')
        } finally {
            setLoadingMap(prev => ({ ...prev, [id]: false }))
            window.location.reload()
        }
    }

    return (
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
                                    {item.registration_start ? new Date(item.registration_start).toLocaleDateString() : '-'} s/d {item.registration_end ? new Date(item.registration_end).toLocaleDateString() : '-'}
                                </span>
                            </div>
                        </div>

                        <div className="pt-4 border-t flex gap-2">
                            <Link href={`/dashboard/dinas/pelatihan/${item.id}/edit`} className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg font-bold text-sm hover:bg-blue-100 flex items-center justify-center gap-2 transition">
                                <Edit size={16} /> Edit
                            </Link>
                            <button
                                onClick={() => handleDelete(item.id)}
                                disabled={loadingMap[item.id]}
                                className="w-12 bg-red-50 text-red-500 py-2 rounded-lg font-bold text-sm hover:bg-red-100 flex items-center justify-center transition disabled:opacity-50"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
