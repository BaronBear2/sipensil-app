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
    const { data } = await supabase.from('blk_trainings').select('*').order('created_at', { ascending: false })
    if (data) dataTab5 = data

    return (
        <div className="space-y-8">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 rounded-2xl shadow-lg text-white flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
                        <ClipboardList size={32} /> Data Pelatihan BLK
                    </h1>
                    <p className="text-blue-100 opacity-90 max-w-xl">
                        Kelola katalog pelatihan yang tersedia untuk masyarakat.
                    </p>
                </div>

                <Link href="/dashboard/dinas/pelatihan/create" className="bg-white text-blue-700 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition shadow-xl transform hover:scale-105 flex items-center gap-2">
                    <PlusCircle size={20} /> Tambah Pelatihan
                </Link>
            </div>

            {dataTab5.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                    <p className="text-gray-400 font-bold mb-4">Belum ada pelatihan yang dibuat.</p>
                    <Link href="/dashboard/dinas/pelatihan/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700">Buat Sekarang</Link>
                </div>
            ) : (
                <TrainingListV2 trainings={dataTab5} />
            )}
        </div>
    )
}
