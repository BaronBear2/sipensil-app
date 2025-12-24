import { createClient } from '@/utils/supabase/server'
import { Building, Trash2 } from 'lucide-react'
import { verifyMagangPermitAction, deleteMagangPermitAction } from '@/actions/dinas'
import { AdminActionButtons } from '@/components/admin/AdminButtons'

export default async function PemaganganAdminPage({ searchParams }: { searchParams: Promise<{ status: string }> }) {
    const supabase = await createClient()

    const params = await searchParams
    // Filter Status (Default: PENDING)
    const status = (params?.status || 'PENDING').toUpperCase()

    // DB Mapping
    // UI: PENDING, APPROVED, REJECTED
    // DB: PENDING, APPROVED, REJECTED
    let dbStatus = status

    let dataTab4: any[] = []
    try {
        const { data } = await supabase
            .from('magang_permits')
            .select(`
                *,
                profiles!inner(
                   *,
                   profile_perusahaan(*)
                )
            `)
            .eq('status', dbStatus)
            .order('created_at', { ascending: false })

        if (data) {
            dataTab4 = data.map((item: any) => {
                const p = item.profiles
                const comp = p?.profile_perusahaan || {}
                // Flatten for easier access or just ensure company_name is correct
                if (p) {
                    p.company_name = comp.company_name || p.company_name
                    p.nib = comp.nib || p.nib
                }
                return item
            })
        }
    } catch (e) {
        console.error(e)
    }

    // Dynamic UI
    let title = "Verifikasi Pencatatan Peserta Magang"
    let desc = "Daftar permohonan pencatatan peserta magang dalam negeri."
    let color = "text-purple-800"
    let iconColor = "text-purple-500"
    let bgColor = "bg-purple-100"
    let borderColor = "border-purple-100"

    if (status === 'APPROVED') {
        title = "Pencatatan Diterima"
        desc = "Daftar permohonan yang telah disetujui."
        color = "text-green-800"
        iconColor = "text-green-600"
        bgColor = "bg-green-100"
        borderColor = "border-green-100"
    } else if (status === 'REJECTED') {
        title = "Pencatatan Ditolak"
        desc = "Daftar permohonan yang ditolak."
        color = "text-red-800"
        iconColor = "text-red-600"
        bgColor = "bg-red-100"
        borderColor = "border-red-100"
    }

    return (
        <div className="space-y-6">
            <div className={`p-6 rounded-xl shadow-sm border flex items-center gap-4 bg-white ${borderColor}`}>
                <div className={`p-3 rounded-full ${bgColor} ${iconColor}`}>
                    <Building size={24} />
                </div>
                <div>
                    <h1 className={`text-2xl font-bold ${color}`}>
                        {title}
                    </h1>
                    <p className="text-gray-500 text-sm">
                        {desc}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
                {dataTab4.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <p>Tidak ada data {status.toLowerCase()}.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border rounded-lg">
                            <thead className="bg-gray-100 text-xs font-bold uppercase text-gray-700">
                                <tr>
                                    <th className="px-4 py-3">Perusahaan</th>
                                    <th className="px-4 py-3">Jadwal</th>
                                    <th className="px-4 py-3">Peserta</th>
                                    <th className="px-4 py-3 text-center">Dokumen</th>
                                    <th className="px-4 py-3 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dataTab4.map((item: any) => (
                                    <tr key={item.id} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <div className="font-bold">{item.profiles?.company_name}</div>
                                            <div className="text-xs text-gray-500">NIB: {item.profiles?.nib}</div>
                                        </td>
                                        <td className="px-4 py-3 text-xs">
                                            {item.start_date} s/d {item.end_date}
                                        </td>
                                        <td className="px-4 py-3 text-center">{item.participant_count}</td>
                                        <td className="px-4 py-3 text-center">
                                            {item.document_path ? <a href={item.document_path} target="_blank" className="text-blue-600 underline text-xs">Cek Surat</a> : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {status === 'PENDING' ? (
                                                <AdminActionButtons
                                                    id={item.id}
                                                    actionFn={verifyMagangPermitAction}
                                                    idName="permitId"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center gap-2">
                                                    <span className="text-xs text-gray-400 font-bold italic">Selesai</span>
                                                    <form action={deleteMagangPermitAction}>
                                                        <input type="hidden" name="id" value={item.id} />
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
                )}
            </div>
        </div>
    )
}
