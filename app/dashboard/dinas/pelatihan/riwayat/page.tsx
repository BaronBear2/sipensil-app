import { createClient } from '@/utils/supabase/server'
import { AlertCircle, Archive, Calendar, Users, ArrowLeft, Edit } from 'lucide-react'
import SearchInput from '@/components/admin/SearchInput'
import Link from 'next/link'
import RestoreTrainingButton from '@/components/admin/RestoreTrainingButton'

export const dynamic = 'force-dynamic'

export default async function RiwayatPelatihanPage({ searchParams }: { searchParams: Promise<{ q: string }> }) {
    const supabase = await createClient()
    const { q } = await searchParams
    const query = q || ''

    // Fetch FINISHED Trainings
    let dbQuery = supabase
        .from('blk_trainings')
        .select('*')
        .eq('status', 'FINISHED')
        .order('training_end_date', { ascending: false })

    if (query) {
        dbQuery = dbQuery.ilike('title', `%${query}%`)
    }

    const { data: trainings } = await dbQuery

    return (
        <div className="space-y-6">
            <div className="p-6 rounded-xl shadow-sm border bg-white border-gray-100 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/dinas/pelatihan" className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition">
                        <ArrowLeft size={24} />
                    </Link>
                    <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                        <Archive size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Riwayat Pelatihan (Legacy)</h1>
                        <p className="text-gray-500 text-sm">
                            Arsip pelatihan yang telah selesai dilaksanakan. Data ini tidak muncul di katalog pencaker.
                        </p>
                    </div>
                </div>

                <div className="hidden md:block">
                    <SearchInput placeholder="Cari Pelatihan..." />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
                {!trainings || trainings.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <Archive className="mx-auto mb-3 opacity-20" size={48} />
                        <p>Belum ada pelatihan yang masuk arsip (FINISHED).</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-100/50">
                                <tr>
                                    <th className="px-6 py-4 rounded-l-lg">Nama Pelatihan</th>
                                    <th className="px-6 py-4">Periode</th>
                                    <th className="px-6 py-4 text-center">Kuota / Terisi</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-center rounded-r-lg">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {trainings.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 font-bold text-gray-800">
                                            {item.title}
                                            <div className="text-xs font-normal text-gray-500 mt-0.5">{item.provider}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                                <Calendar size={14} className="text-blue-500" />
                                                {item.training_start_date ? new Date(item.training_start_date).toLocaleDateString('id-ID') : '-'} s/d {item.training_end_date ? new Date(item.training_end_date).toLocaleDateString('id-ID') : '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-1 text-xs font-bold text-gray-600 bg-gray-100 py-1 px-3 rounded-full mx-auto w-fit">
                                                <Users size={12} /> {item.filled} / {item.quota}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full border border-gray-200">
                                                SELESAI
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link
                                                    href={`/dashboard/dinas/pelatihan/${item.id}/edit`}
                                                    className="flex items-center gap-1 px-3 py-1 bg-white border border-yellow-200 text-yellow-600 rounded-full text-xs font-bold hover:bg-yellow-50 transition"
                                                    title="Edit Tanggal / Info"
                                                >
                                                    <Edit size={14} /> Edit
                                                </Link>
                                                <RestoreTrainingButton
                                                    id={item.id}
                                                    title={item.title}
                                                    startDate={item.training_start_date}
                                                    endDate={item.training_end_date}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
