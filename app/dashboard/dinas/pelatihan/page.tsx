import { createClient } from '@/utils/supabase/server'
import { ClipboardList } from 'lucide-react'
import TrainingList from '@/components/admin/TrainingList'
import { createTrainingAction } from '@/actions/dinas'

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
                        <form action={createTrainingAction}>
                            <div className="space-y-4">
                                <input name="title" placeholder="Judul Pelatihan" className="w-full border p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" required />
                                <input name="provider" placeholder="Penyelenggara (mis: UPTD BLK)" className="w-full border p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" required />
                                <input name="category" placeholder="Kategori (mis: Las, IT)" className="w-full border p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" required />
                                <textarea name="description" placeholder="Deskripsi Singkat" className="w-full border p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" required></textarea>
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="number" name="quota" placeholder="Kuota" className="border p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" required />
                                    <input type="text" name="certification" placeholder="Sertifikasi" className="border p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="number" name="min_age" placeholder="Min Usia (17)" className="border p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                    <input type="number" name="max_age" placeholder="Max Usia (60)" className="border p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                <textarea name="requirements" placeholder="Persyaratan (pisahkan baris)" className="w-full border p-3 rounded-lg text-sm h-24 mb-3 focus:ring-2 focus:ring-blue-500 outline-none"></textarea>

                                <div className="border border-dashed border-gray-300 p-4 rounded-lg bg-gray-50 mb-3 hover:bg-blue-50 transition-colors">
                                    <label className="text-xs font-bold block mb-2 text-gray-600">Upload Gambar Poster (Opsional)</label>
                                    <input type="file" name="image" accept="image/*" className="w-full text-xs text-gray-500 file:mr-2 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer" />
                                </div>

                                <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 shadow-lg transition-transform active:scale-95">Simpan Pelatihan</button>
                            </div>
                        </form>
                    </div>
                </details>
            </div>

            <TrainingList trainings={dataTab5} />
        </div>
    )
}
