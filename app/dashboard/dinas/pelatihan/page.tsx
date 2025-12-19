import { createClient } from '@/utils/supabase/server'
import { ClipboardList } from 'lucide-react'
import TrainingList from '@/components/admin/TrainingList'
import CreateTrainingForm from '@/components/admin/CreateTrainingForm'

export default async function PelatihanAdminPage() {
    const supabase = await createClient()

    let dataTab5: any[] = []
    const { data } = await supabase.from('blk_trainings').select('*').order('created_at', { ascending: false })
    if (data) dataTab5 = data

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-2">
                        <ClipboardList className="text-blue-600" /> Data Pelatihan BLK
                    </h1>
                    <p className="text-gray-500">
                        Kelola daftar pelatihan yang tersedia untuk masyarakat.
                    </p>
                </div>

                {/* Add Button Trigger (Using Details for MVP) */}
                <details className="relative">
                    <summary className="list-none bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm cursor-pointer hover:bg-blue-700 shadow-md flex items-center gap-2 transition-transform active:scale-95">
                        + Tambah Pelatihan
                    </summary>
                    <div className="absolute right-0 top-12 w-[500px] bg-white shadow-xl border rounded-xl p-6 z-50 animate-fade-in-up">
                        <h4 className="font-bold mb-4 text-lg border-b pb-2">Tambah Pelatihan Baru</h4>
                        <CreateTrainingForm />
                    </div>
                </details>
            </div>

            <TrainingList trainings={dataTab5} />
        </div>
    )
}
