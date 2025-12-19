import { createClient } from '@/utils/supabase/server'
import { Users } from 'lucide-react'
import { verifyImJapanAction } from '@/actions/dinas'
import { AdminActionButtons } from '@/components/admin/AdminButtons'

export default async function ImJapanPage() {
    const supabase = await createClient()

    let dataTab2: any[] = []
    try {
        const { data } = await supabase
            .from('im_japan_registrations')
            .select(`*, profiles!inner(full_name, nik, phone)`)
            .eq('status', 'PENDING')
            .order('created_at', { ascending: false })
        if (data) dataTab2 = data
    } catch (e) {
        console.error(e)
    }

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-2">
                    <Users className="text-blue-500" /> Program IM Japan
                </h1>
                <p className="text-gray-500">
                    Verifikasi pendaftaran calon peserta program magang ke Jepang (IM Japan).
                </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
                {dataTab2.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <p>Tidak ada pendaftaran IM Japan baru.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border rounded-lg">
                            <thead className="bg-gray-100 text-xs font-bold uppercase text-gray-700">
                                <tr>
                                    <th className="px-4 py-3">Pelamar</th>
                                    <th className="px-4 py-3">Batch</th>
                                    <th className="px-4 py-3">Dokumen</th>
                                    <th className="px-4 py-3 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dataTab2.map((item: any) => (
                                    <tr key={item.id} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <div className="font-bold">{item.profiles?.full_name}</div>
                                            <div className="text-xs text-gray-500">{item.profiles?.nik}</div>
                                        </td>
                                        <td className="px-4 py-3">{item.batch || '-'}</td>
                                        <td className="px-4 py-3">
                                            {item.document_path ?
                                                <a href={item.document_path} target="_blank" className="text-blue-600 underline text-xs">Lihat Berkas</a>
                                                : <span className="text-red-500 text-xs">Tidak ada</span>}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <AdminActionButtons
                                                id={item.id}
                                                actionFn={verifyImJapanAction}
                                                idName="regId"
                                            />
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
