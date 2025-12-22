import { createClient } from '@/utils/supabase/server'
import { Building } from 'lucide-react'
import { verifyMagangPermitAction } from '@/actions/dinas'
import { AdminActionButtons } from '@/components/admin/AdminButtons'

export default async function PemaganganAdminPage() {
    const supabase = await createClient()

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
            .eq('status', 'PENDING')
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

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-100">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-2">
                    <Building className="text-purple-500" /> Verifikasi Perjanjian Pemagangan
                </h1>
                <p className="text-gray-500">
                    Daftar permohonan pencatatan perjanjian pemagangan dalam negeri.
                </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
                {dataTab4.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <p>Tidak ada permohonan baru.</p>
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
                                            <AdminActionButtons
                                                id={item.id}
                                                actionFn={verifyMagangPermitAction}
                                                idName="permitId"
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
