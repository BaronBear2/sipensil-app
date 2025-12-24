import { createClient } from '@/utils/supabase/server'
import { PlusCircle, Trash2, Edit, Save, X } from 'lucide-react'
import { createImJapanRequirementAction, updateImJapanRequirementAction, deleteImJapanRequirementAction } from '@/actions/dinas'

export default async function ImJapanRequirementsPage() {
    const supabase = await createClient()
    const { data: requirements } = await supabase.from('im_japan_requirements').select('*').order('created_at', { ascending: true })

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-2">
                        <span className="text-2xl">🇯🇵</span> Persyaratan Dokumen IM Japan
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Atur daftar dokumen yang wajib diunggah oleh calon peserta magang Jepang.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* FORM TAMBAH */}
                <div className="bg-white p-6 rounded-xl shadow-sm border h-fit">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <PlusCircle size={18} className="text-blue-600" /> Tambah Syarat Baru
                    </h3>
                    <form action={createImJapanRequirementAction} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Judul Dokumen</label>
                            <input type="text" name="title" required className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Contoh: Scan KTP Asli" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Keterangan (Opsional)</label>
                            <textarea name="description" rows={3} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Contoh: Format PDF/JPG, terbaca jelas."></textarea>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                <input type="checkbox" name="is_required" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                                <span>Wajib Diupload (Required)</span>
                            </label>
                            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                <input type="checkbox" name="is_active" defaultChecked className="w-4 h-4 text-green-600 rounded" />
                                <span>Status Aktif</span>
                            </label>
                        </div>
                        <button className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                            Simpan Dokumen
                        </button>
                    </form>
                </div>

                {/* LIST DOKUMEN */}
                <div className="lg:col-span-2 space-y-4">
                    {requirements?.map((req) => (
                        <div key={req.id} className="bg-white p-4 rounded-xl shadow-sm border hover:shadow-md transition group relative">
                            <form action={updateImJapanRequirementAction} className="flex flex-col md:flex-row gap-4 items-start">
                                <input type="hidden" name="id" value={req.id} />

                                <div className="flex-grow space-y-2 w-full">
                                    <div className="flex gap-2">
                                        <input type="text" name="title" defaultValue={req.title} className="font-bold text-gray-800 border-b border-transparent focus:border-blue-500 hover:border-gray-200 outline-none w-full bg-transparent" />
                                    </div>
                                    <textarea name="description" defaultValue={req.description || ''} className="text-sm text-gray-500 w-full resize-none bg-transparent border-none p-0 focus:ring-0" rows={2} placeholder="Keterangan..."></textarea>

                                    <div className="flex gap-4 pt-2">
                                        <label className="flex items-center gap-1 text-xs font-bold text-gray-600 cursor-pointer">
                                            <input type="checkbox" name="is_required" defaultChecked={req.is_required} className="rounded text-blue-600" />
                                            Required
                                        </label>
                                        <label className="flex items-center gap-1 text-xs font-bold text-gray-600 cursor-pointer">
                                            <input type="checkbox" name="is_active" defaultChecked={req.is_active} className="rounded text-green-600" />
                                            Active
                                        </label>
                                        <button className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded font-bold hover:bg-blue-100 transition flex items-center gap-1">
                                            <Save size={12} /> Update
                                        </button>
                                    </div>
                                </div>
                            </form>

                            {/* DELETE BUTTON (Absolute) */}
                            <form action={deleteImJapanRequirementAction} className="absolute top-4 right-4">
                                <input type="hidden" name="id" value={req.id} />
                                <button className="text-gray-300 hover:text-red-500 transition" title="Hapus Dokumen" onClick={(e) => !confirm('Hapus dokumen ini?') && e.preventDefault()}>
                                    <Trash2 size={16} />
                                </button>
                            </form>
                        </div>
                    ))}

                    {(!requirements || requirements.length === 0) && (
                        <div className="text-center py-10 text-gray-400 bg-white rounded-xl border border-dashed">
                            Belum ada persyaratan dokumen yang ditambahkan.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
