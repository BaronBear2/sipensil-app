import { createClient } from '@/utils/supabase/server'
import { PlusCircle, Trash2, Edit, Save, X, FileText } from 'lucide-react'
import { createImJapanRequirementAction, updateImJapanRequirementAction, deleteImJapanRequirementAction } from '@/actions/dinas'
import ImJapanRequirementItem from '@/components/admin/ImJapanRequirementItem'
import Link from 'next/link'

export default async function ImJapanRequirementsPage() {
    const supabase = await createClient()
    const { data: requirements } = await supabase.from('im_japan_requirements').select('*').order('created_at', { ascending: true })

    return (
        <div className="font-sans min-h-screen bg-gray-50/50 pb-20">
            {/* HERO SECTION - RED THEME */}
            <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white pt-8 pb-20 px-6 md:px-12 relative overflow-hidden rounded-b-3xl shadow-lg mb-8">
                <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                    <span className="text-[300px]">🇯🇵</span>
                    {/* Using emoji as icon replacement locally or FileText */}
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                                <FileText size={24} className="text-white" />
                            </div>
                            <span className="font-bold tracking-wider text-red-100 uppercase text-sm">Modul IM Japan</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight text-white">
                            Persyaratan Dokumen
                        </h1>
                        <p className="text-red-100 font-medium text-lg max-w-xl">
                            Atur daftar dokumen yang wajib diunggah oleh calon peserta magang Jepang.
                        </p>
                    </div>

                    {/* Quick Actions */}
                    <div>
                        <Link
                            href="/dashboard/dinas/im-japan/requirements/create"
                            className="bg-white text-red-700 px-6 py-3 rounded-xl font-bold hover:bg-red-50 transition shadow-xl transform hover:scale-105 flex items-center gap-2"
                        >
                            <PlusCircle size={20} /> Tambah Syarat Baru
                        </Link>
                    </div>
                </div>
            </div>

            {/* List Content - Floating Up */}
            <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {requirements?.map((req) => (
                        <div key={req.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <ImJapanRequirementItem req={req} />
                        </div>
                    ))}

                    {(!requirements || requirements.length === 0) && (
                        <div className="col-span-full text-center py-16 text-gray-400 bg-white rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-4">
                            <div className="p-4 bg-gray-50 rounded-full">
                                <PlusCircle size={32} className="text-gray-300" />
                            </div>
                            <p>Belum ada persyaratan dokumen.</p>
                            <Link href="/dashboard/dinas/im-japan/requirements/create" className="text-red-600 font-bold hover:underline">
                                Tambah Sekarang
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
