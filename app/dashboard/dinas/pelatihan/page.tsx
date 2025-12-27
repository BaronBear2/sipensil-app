import { createClient } from '@/utils/supabase/server'
import { ClipboardList, PlusCircle } from 'lucide-react'
import TrainingListV2 from '@/components/admin/TrainingListV2'
import Link from 'next/link'
import { autoUpdateTrainingStatusAction } from '@/actions/dinas'

export default async function PelatihanAdminPage() {
    const supabase = await createClient()

    // Run Maintenance Logic (Fire and forget essentially, or await)
    await autoUpdateTrainingStatusAction()

    let dataTab5: any[] = []
    const { data } = await supabase
        .from('blk_trainings')
        .select('*')
        .neq('status', 'FINISHED') // Filter out archived items
        .order('created_at', { ascending: false })
    if (data) dataTab5 = data

    return (
        <div className="font-sans min-h-screen bg-gray-50/50 pb-20">
            {/* HERO SECTION - RED THEME */}
            <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white pt-8 pb-20 px-6 md:px-12 relative overflow-hidden rounded-b-3xl shadow-lg mb-8">
                <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                    <ClipboardList size={300} />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                                <ClipboardList size={24} className="text-white" />
                            </div>
                            <span className="font-bold tracking-wider text-red-100 uppercase text-sm">Modul Pelatihan</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight text-white">
                            Data Pelatihan BLK
                        </h1>
                        <p className="text-red-100 font-medium text-lg max-w-xl">
                            Kelola katalog pelatihan yang tersedia untuk masyarakat.
                        </p>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2">
                        <Link href="/dashboard/dinas/pelatihan/riwayat" className="bg-white/10 text-white border border-white/20 px-6 py-3 rounded-xl font-bold hover:bg-white/20 transition flex items-center gap-2">
                            <ClipboardList size={20} /> Riwayat / Arsip
                        </Link>
                        <Link href="/dashboard/dinas/pelatihan/create" className="bg-white text-red-700 px-6 py-3 rounded-xl font-bold hover:bg-red-50 transition shadow-xl transform hover:scale-105 flex items-center gap-2">
                            <PlusCircle size={20} /> Tambah Pelatihan
                        </Link>
                    </div>
                </div>
            </div>

            {/* Content Section - Floating Up */}
            <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20">
                {dataTab5.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300 shadow-sm">
                        <p className="text-gray-400 font-bold mb-4">Belum ada pelatihan yang dibuat.</p>
                        <Link href="/dashboard/dinas/pelatihan/create" className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700">Buat Sekarang</Link>
                    </div>
                ) : (
                    <TrainingListV2 trainings={dataTab5} />
                )}
            </div>
        </div>
    )
}
