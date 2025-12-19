import { createClient } from '@/utils/supabase/server'
import { Users } from 'lucide-react'
import { kickParticipantAction } from '@/actions/dinas'

export default async function PesertaAdminPage() {
    const supabase = await createClient()

    let dataTab6: any[] = []
    const { data } = await supabase.from('training_registrations').select('*, profiles(*), blk_trainings(title)').order('created_at', { ascending: false })
    if (data) dataTab6 = data

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-100">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-2">
                    <Users className="text-purple-500" /> Monitoring Peserta Pelatihan
                </h1>
                <p className="text-gray-500">
                    Daftar seluruh peserta yang mendaftar ke pelatihan BLK beserta status kelulusannya.
                </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border rounded-lg">
                        <thead className="bg-gray-100 text-xs font-bold uppercase text-gray-700">
                            <tr>
                                <th className="px-4 py-3">Nama Peserta</th>
                                <th className="px-4 py-3">Pelatihan</th>
                                <th className="px-4 py-3">Tanggal Daftar</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dataTab6.map((item: any) => (
                                <tr key={item.id} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-3 font-bold">{item.profiles?.full_name}</td>
                                    <td className="px-4 py-3">{item.blk_trainings?.title}</td>
                                    <td className="px-4 py-3 text-xs">{new Date(item.created_at).toLocaleDateString('id-ID')}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.status === 'DITERIMA' ? 'bg-green-100 text-green-600' : item.status === 'PENDING' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {item.status !== 'DITOLAK' && (
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
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
