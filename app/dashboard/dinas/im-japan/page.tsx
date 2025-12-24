import { createClient } from '@/utils/supabase/server'
import { Users, Trash2 } from 'lucide-react'
import { verifyImJapanAction, deleteImJapanHistoryAction } from '@/actions/dinas'
import { AdminActionButtons } from '@/components/admin/AdminButtons'

export default async function ImJapanPage({ searchParams }: { searchParams: Promise<{ status: string }> }) {
    const supabase = await createClient()

    const params = await searchParams
    // Status Filter (Default: PENDING)
    const status = (params?.status || 'PENDING').toUpperCase()

    // DB Mapping
    // UI: PENDING, VERIFIED, REJECTED
    // DB: PENDING, VERIFIED, REJECTED (Matches)
    const dbStatus = status

    let dataTab2: any[] = []
    try {
        const { data } = await supabase
            .from('im_japan_registrations')
            .select(`
                *,
                profiles!inner(
                   *,
                   profile_pencaker(*)
                )
            `)
            .eq('status', dbStatus)
            .order('created_at', { ascending: false })

        if (data) {
            dataTab2 = data.map((item: any) => {
                const p = item.profiles
                const details = p?.profile_pencaker || {}
                // Ensure NIK is populated from details if not in base 
                if (p) {
                    p.nik = details.nik || p.nik
                    p.phone = details.phone || p.phone
                }
                return item
            })
        }
    } catch (e) {
        console.error(e)
    }

    // Dynamic UI
    let title = "Surat Rekomendasi Tes IM-Japan (Pending)"
    let desc = "Verifikasi pendaftaran calon peserta program magang ke Jepang yang menunggu persetujuan."
    let color = "blue"

    if (status === 'VERIFIED') {
        title = "Surat Rekomendasi Tes IM-Japan (Diterima)"
        desc = "Daftar peserta yang telah diverifikasi dan diterima."
        color = "green"
    } else if (status === 'REJECTED') {
        title = "Surat Rekomendasi Tes IM-Japan (Ditolak)"
        desc = "Daftar permohonan yang ditolak atau perlu revisi."
        color = "red"
    }

    return (
        <div className="space-y-6">
            <div className={`p-6 rounded-xl shadow-sm border flex items-center gap-4 ${status === 'VERIFIED' ? 'bg-green-50 border-green-100' : status === 'REJECTED' ? 'bg-red-50 border-red-100' : 'bg-white border-blue-100'}`}>
                <div className={`p-3 rounded-full ${status === 'VERIFIED' ? 'bg-green-100 text-green-600' : status === 'REJECTED' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                    <Users size={24} />
                </div>
                <div>
                    <h1 className={`text-2xl font-bold ${status === 'VERIFIED' ? 'text-green-800' : status === 'REJECTED' ? 'text-red-800' : 'text-gray-800'}`}>
                        {title}
                    </h1>
                    <p className="text-gray-500 text-sm">
                        {desc}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
                {dataTab2.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <p>Tidak ada data {status.toLowerCase()}.</p>
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
                                            <div className="flex flex-wrap gap-2 max-w-xs">
                                                {/* Combine Legacy and New Docs */}
                                                {item.document_path && (
                                                    <a href={item.document_path} target="_blank" className="bg-gray-100 px-2 py-1 rounded text-xs text-blue-600 hover:bg-blue-50 border">Legacy File</a>
                                                )}
                                                {item.documents && Object.entries(item.documents).map(([key, url]) => (
                                                    <a key={key} href={url as string} target="_blank" className="bg-gray-100 px-2 py-1 rounded text-xs text-blue-600 hover:bg-blue-50 border capitalize">
                                                        {key.replace(/_/g, ' ')}
                                                    </a>
                                                ))}
                                                {!item.document_path && (!item.documents || Object.keys(item.documents).length === 0) && (
                                                    <span className="text-red-500 text-xs">Kosong</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {status === 'PENDING' ? (
                                                <AdminActionButtons
                                                    id={item.id}
                                                    actionFn={verifyImJapanAction}
                                                    idName="regId"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center gap-2">
                                                    <span className="text-xs text-gray-400 font-bold italic">Selesai</span>
                                                    <form action={deleteImJapanHistoryAction}>
                                                        <input type="hidden" name="regId" value={item.id} />
                                                        <button className="text-gray-400 hover:text-red-600 p-1 transition" title="Hapus Riwayat">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </form>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
                }
            </div >
        </div >
    )
}
