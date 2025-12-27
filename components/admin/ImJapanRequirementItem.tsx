'use client'

import { Save, Trash2 } from 'lucide-react'
import { updateImJapanRequirementAction, deleteImJapanRequirementAction } from '@/actions/dinas'
import { SwalConfirm, SwalToast } from '@/utils/swal'

export default function ImJapanRequirementItem({ req }: { req: any }) {

    const handleDelete = async () => {
        const result = await SwalConfirm.fire({
            title: 'Hapus Dokumen?',
            text: 'Dokumen ini akan dihapus permanen.'
        })

        if (!result.isConfirmed) return

        const formData = new FormData()
        formData.append('id', req.id)

        await deleteImJapanRequirementAction(formData)
        SwalToast.fire({ icon: 'success', title: 'Dokumen dihapus' })
    }

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border hover:shadow-md transition group relative">
            <form action={updateImJapanRequirementAction} className="flex flex-col gap-4">
                <input type="hidden" name="id" value={req.id} />

                {/* Header Row */}
                <div className="flex items-start gap-4 pr-12">
                    <div className="flex-1 space-y-3">
                        {/* Title Input */}
                        <div>
                            <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Judul Dokumen</label>
                            <input type="text" name="title" defaultValue={req.title} className="font-bold text-gray-800 text-lg border-b border-gray-200 focus:border-blue-500 outline-none w-full bg-transparent px-1 pb-1" />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Keterangan</label>
                            <textarea name="description" defaultValue={req.description || ''} className="text-sm text-gray-600 w-full bg-gray-50 rounded-lg border-transparent focus:border-blue-500 focus:bg-white p-3 outline-none transition" rows={2}></textarea>
                        </div>
                    </div>
                </div>

                <div className="border-t border-dashed pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Template Section */}
                    <div className="flex items-center gap-3">
                        {req.template_url ? (
                            <a href={req.template_url} target="_blank" className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100 transition border border-blue-100">
                                <Save size={14} className="rotate-180" /> Download Template
                            </a>
                        ) : (
                            <span className="text-xs text-gray-400 italic bg-gray-50 px-3 py-2 rounded-lg">Tidak ada template</span>
                        )}

                        <div className="relative overflow-hidden group/upload">
                            <button type="button" className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-50 transition">
                                <Save size={14} /> {req.template_url ? 'Ganti' : 'Upload'} Template
                            </button>
                            <input type="file" name="template" className="absolute inset-0 opacity-0 cursor-pointer" title="Upload Template Baru" />
                        </div>
                    </div>

                    {/* Actions & Toggles */}
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-xs font-bold text-gray-600 cursor-pointer select-none">
                            <input type="checkbox" name="is_required" defaultChecked={req.is_required} className="rounded text-blue-600 focus:ring-0" />
                            Wajib
                        </label>
                        <div className="h-4 w-px bg-gray-300"></div>
                        <label className="flex items-center gap-2 text-xs font-bold text-gray-600 cursor-pointer select-none">
                            <input type="checkbox" name="is_active" defaultChecked={req.is_active} className="rounded text-green-600 focus:ring-0" />
                            Aktif
                        </label>

                        <button className="ml-2 text-xs bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition flex items-center gap-2 shadow-sm">
                            <Save size={14} /> Simpan Perubahan
                        </button>
                    </div>
                </div>
            </form>

            {/* DELETE BUTTON (Absolute) */}
            <button
                onClick={handleDelete}
                className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition"
                title="Hapus Dokumen"
            >
                <Trash2 size={18} />
            </button>
        </div>
    )
}
