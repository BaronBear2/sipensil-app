import { createClient } from '@/utils/supabase/server'
import TrainingListV2 from '@/components/admin/TrainingListV2'
import Link from 'next/link'
import { Plus, BookOpen, ClipboardList } from 'lucide-react'
import { autoUpdateTrainingStatusAction } from '@/actions/dinas'

export default async function PelatihanAdminPage() {
    const supabase = await createClient()

    // Run Maintenance Logic (Fire and forget essentially, or await)
    await autoUpdateTrainingStatusAction()

    const { data } = await supabase
        .from('blk_trainings')
        .select('*, training_registrations(status)')
        .neq('status', 'FINISHED') // Filter out archived items
        .order('created_at', { ascending: false })

    const processedData = data?.map((t: any) => {
        const accCount = t.training_registrations?.filter((r: any) => r.status !== 'PENDING' && r.status !== 'DITOLAK').length || 0;
        const totalApplicants = t.training_registrations?.length || 0;
        // Clean up to save payload size if necessary
        delete t.training_registrations;
        return { ...t, accCount, totalApplicants };
    }) || []

    const { data: categories, error } = await supabase
        .from('master_categories')
        .select('name')
        .order('name')
        
    const hasSchemaError = error?.code === '42P01' || error?.message?.includes('schema cache')

    return (
        <div className="font-sans min-h-screen bg-gray-50/50 pb-20">
            {hasSchemaError && (
                <div className="max-w-7xl mx-auto px-6 mt-4">
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm">
                        <h3 className="text-red-800 font-bold text-lg">⚠️ PERHATIAN: Tabel Master Data Belum Dibuat!</h3>
                        <p className="text-red-700 mt-1">Sistem gagal menemukan tabel `master_categories` di database Anda. Silakan buka file <strong>`supabase/migrations/20260520130000_master_data.sql`</strong> dan jalankan seluruh isinya di menu <strong>SQL Editor</strong> pada dashboard Supabase Anda.</p>
                    </div>
                </div>
            )}
            {/* HERO SECTION */}
            <div className="bg-gradient-to-br from-red-700 via-red-800 to-rose-900 text-white pt-10 pb-24 px-6 md:px-12 relative overflow-hidden rounded-b-[2.5rem] shadow-2xl mb-10 mt-2 border-b-4 border-red-500">
                <div className="absolute -top-24 -right-24 p-4 opacity-5 transform rotate-12 scale-150 mix-blend-overlay">
                    <BookOpen size={400} />
                </div>
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md border border-white/30 shadow-inner">
                                <ClipboardList size={22} className="text-white" />
                            </div>
                            <span className="font-extrabold tracking-widest text-red-100 uppercase text-xs">Modul Pelatihan</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black mb-3 tracking-tight text-white drop-shadow-md">
                            Data Pelatihan BLK
                        </h1>
                        <p className="text-red-100/90 font-medium text-lg max-w-2xl leading-relaxed">
                            Kelola dan pantau katalog program pelatihan yang tersedia untuk masyarakat dengan mudah.
                        </p>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <Link href="/dashboard/dinas/pelatihan/riwayat" className="group bg-white/10 text-white border border-white/20 px-6 py-3.5 rounded-xl font-bold hover:bg-white/20 hover:border-white/40 transition-all flex items-center justify-center gap-2 backdrop-blur-sm">
                            <ClipboardList size={20} className="group-hover:scale-110 transition-transform" /> Arsip
                        </Link>
                        <Link href="/dashboard/dinas/pelatihan/create" className="group bg-white text-red-700 px-7 py-3.5 rounded-xl font-bold hover:bg-red-50 hover:text-red-800 transition-all shadow-xl transform hover:-translate-y-1 hover:shadow-red-900/50 flex items-center justify-center gap-2">
                            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" /> Tambah Baru
                        </Link>
                    </div>
                </div>
            </div>

            {/* Content Section - Floating Up */}
            <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-20">
                {!processedData || processedData.length === 0 ? (
                    <div className="text-center py-24 bg-white/80 backdrop-blur-sm rounded-3xl border border-dashed border-red-200 shadow-xl">
                        <p className="text-gray-500 font-medium mb-5 text-lg">Belum ada pelatihan yang dibuat.</p>
                        <Link href="/dashboard/dinas/pelatihan/create" className="inline-block bg-red-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 shadow-lg hover:shadow-red-600/30 transition-all transform hover:-translate-y-0.5">Buat Pelatihan Pertama</Link>
                    </div>
                ) : (
                    <TrainingListV2 trainings={processedData} categories={categories || []} />
                )}
            </div>
        </div>
    )
}
