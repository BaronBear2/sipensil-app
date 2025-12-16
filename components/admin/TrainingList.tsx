'use client'

import { useState } from 'react'
import { ClipboardList, Users } from 'lucide-react'
import { DeleteTrainingButton } from './AdminButtons'
import EditTrainingModal from './EditTrainingModal'

export default function TrainingList({ trainings }: { trainings: any[] }) {
    const [editingItem, setEditingItem] = useState<any>(null)

    return (
        <div className="grid gap-4">
            {trainings.map((t) => (
                <div key={t.id} className="border rounded-xl p-4 flex justify-between items-start bg-white hover:bg-gray-50 group shadow-sm transition-all">
                    <div className="flex gap-4">
                        {/* Thumbnail Image */}
                        <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden border">
                            {t.image_url ? (
                                <img src={t.image_url} alt={t.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <ClipboardList size={24} />
                                </div>
                            )}
                        </div>

                        <div>
                            <h4 className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition-colors">{t.title}</h4>
                            <div className="text-xs text-gray-500 mb-2 flex flex-wrap gap-2">
                                <span>{t.provider}</span> • <span>{t.category}</span> • <span>Kuota: {t.quota}</span>
                            </div>
                            <div className="flex gap-2 flex-wrap mb-2">
                                <span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold text-gray-600 border">Usia: {t.min_age}-{t.max_age} Thn</span>
                                {t.certification && <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded text-xs font-bold border border-purple-200">{t.certification}</span>}
                                <span className={`px-2 py-1 rounded text-xs font-bold border ${t.status === 'CLOSED' ? 'bg-red-100 text-red-600 border-red-200' : 'bg-green-100 text-green-600 border-green-200'}`}>
                                    {t.status || 'OPEN'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <DeleteTrainingButton id={t.id} />

                        <button
                            onClick={() => setEditingItem(t)}
                            className="text-blue-600 text-xs font-bold border border-blue-200 px-3 py-1 rounded hover:bg-blue-50 transition-colors text-center"
                        >
                            Edit
                        </button>
                    </div>
                </div>
            ))}

            {/* Modal Edit */}
            {editingItem && (
                <EditTrainingModal
                    training={editingItem}
                    onClose={() => setEditingItem(null)}
                />
            )}
        </div>
    )
}
