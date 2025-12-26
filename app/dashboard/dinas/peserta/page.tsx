import { createClient } from '@/utils/supabase/server'
import { Users } from 'lucide-react'
import { kickParticipantAction, autoUpdateTrainingStatusAction } from '@/actions/dinas'
import SearchInput from '@/components/admin/SearchInput'
import FilterTraining from '@/components/admin/FilterTraining'

export default async function PesertaAdminPage({ searchParams }: { searchParams: Promise<{ q?: string; training_id?: string }> }) {
    const supabase = await createClient()

    const params = await searchParams
    const queryTerm = params?.q || ''
    const trainingFilter = params?.training_id || ''

    // 0. Auto Maintenance (Kick expired / Finish completed)
    await autoUpdateTrainingStatusAction()

    // 1. Fetch Trainings for Filter Dropdown
    const { data: trainings } = await supabase.from('blk_trainings').select('id, title').order('created_at', { ascending: false })

    // 2. Build Query for Participants (ACTIVE ONLY)
    let query = supabase
        .from('training_registrations')
        .select('*, profiles!inner(*), blk_trainings(title, training_start_date, training_end_date)')
        .in('status', ['DITERIMA', 'SELESAI'])
        .order('status', { ascending: true })
        .order('created_at', { ascending: false })

    if (trainingFilter) {
        query = query.eq('training_id', trainingFilter)
    }

    if (queryTerm) {
        query = query.ilike('profiles.full_name', `%${queryTerm}%`)
    }

    const { data: dataTab6 } = await query

    return (
        <div className="font-sans min-h-screen bg-gray-50/50 pb-20">
            {/* HERO SECTION - RED THEME */}
            <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white pt-8 pb-20 px-6 md:px-12 relative overflow-hidden rounded-b-3xl shadow-lg mb-8">
                <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                    <Users size={300} />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                                <Users size={24} className="text-white" />
                            </div>
                            <span className="font-bold tracking-wider text-red-100 uppercase text-sm">Modul Peserta</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight text-white">
                            Monitoring Peserta
                        </h1>
                        <p className="text-red-100 font-medium text-lg max-w-xl">
                            Daftar seluruh peserta yang sedang atau telah menyelesaikan pelatihan BLK.
                        </p>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex gap-4">
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl text-center">
                            <h3 className="text-2xl font-bold text-white">{dataTab6?.length || 0}</h3>
                            <p className="text-xs text-red-100 uppercase font-bold tracking-wider">Total Peserta</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toolbar - Floating Up */}
            <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20 space-y-6">
                <div className="bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex flex-col md:flex-row gap-4">
                    <div className="w-full md:w-1/2">
                        <SearchInput placeholder="Cari nama peserta..." />
                    </div>
                    <div className="w-full md:w-1/2">
                        <FilterTraining trainings={trainings || []} />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border p-6 overflow-hidden">
                    <div className="overflow-x-auto">
                        {!dataTab6 || dataTab6.length === 0 ? (
                            <p className="text-center py-10 text-gray-400">Tidak ada data peserta ditemukan.</p>
                        ) : (
                            <table className="w-full text-sm text-left border rounded-lg">
                                <thead className="bg-gray-100 text-xs font-bold uppercase text-gray-700">
                                    <tr>
                                        <th className="px-4 py-3">Nama Peserta</th>
                                        <th className="px-4 py-3">Pelatihan</th>
                                        <th className="px-4 py-3">Mulai</th>
                                        <th className="px-4 py-3">Selesai</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dataTab6.map((item: any) => (
                                        <tr key={item.id} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-3 font-bold">{item.profiles?.full_name}</td>
                                            <td className="px-4 py-3">{item.blk_trainings?.title}</td>
                                            <td className="px-4 py-3 text-xs">{item.blk_trainings?.training_start_date ? new Date(item.blk_trainings.training_start_date).toLocaleDateString('id-ID') : '-'}</td>
                                            <td className="px-4 py-3 text-xs">{item.blk_trainings?.training_end_date ? new Date(item.blk_trainings.training_end_date).toLocaleDateString('id-ID') : '-'}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.status === 'DITERIMA' ? 'bg-green-100 text-green-600' :
                                                    item.status === 'SELESAI' ? 'bg-blue-100 text-blue-600' :
                                                        'bg-red-100 text-red-600'
                                                    }`}>
                                                    {item.status === 'DITERIMA' ? 'SEDANG PELATIHAN' : item.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {item.status === 'DITERIMA' ? (
                                                    <details className="relative inline-block text-left">
                                                        <summary className="text-red-600 font-bold text-xs cursor-pointer hover:underline list-none">Keluarkan</summary>
                                                        <div className="absolute right-0 top-6 w-64 bg-white shadow-xl border rounded p-3 z-20">
                                                            <form action={kickParticipantAction}>
                                                                <input type="hidden" name="regId" value={item.id} />
                                                                <p className="text-xs font-bold mb-2 text-left">Alasan dikeluarkan:</p>
                                                                <textarea name="reason" className="w-full border text-xs p-1 rounded mb-2" required></textarea>
                                                                <button className="w-full bg-red-600 text-white text-xs font-bold py-1 rounded">Konfirmasi</button>
                                                            </form>
                                                        </div>
                                                    </details>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
