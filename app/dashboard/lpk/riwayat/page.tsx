import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Edit, Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default async function LpkRiwayatPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    const { data: reports } = await supabase.from('lpk_reports').select('*').eq('user_id', user.id).order('created_at', { ascending: false })

    return (
        <div className="p-8 animate-fade-in">
            <div className="bg-white rounded-xl shadow-sm border p-8 mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Riwayat Laporan</h1>
                <p className="text-gray-500 mt-1">Daftar laporan semester yang telah Anda kirimkan.</p>
            </div>

            <div className="space-y-4">
                {reports?.length === 0 ? (
                    <div className="text-center p-12 bg-white rounded-xl border border-dashed">
                        <p className="text-gray-400 italic">Belum ada laporan dikirim.</p>
                        <Link href="/dashboard/lpk/laporan" className="text-blue-600 font-bold hover:underline mt-2 inline-block">Buat Laporan Baru</Link>
                    </div>
                ) : (
                    reports?.map((r: any) => (
                        <div key={r.id} className="bg-white p-6 rounded-xl border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-blue-200 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-full shrink-0 ${r.status === 'APPROVED' ? 'bg-green-100 text-green-600' :
                                        r.status === 'REJECTED' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                                    }`}>
                                    {r.status === 'APPROVED' ? <CheckCircle size={24} /> :
                                        r.status === 'REJECTED' ? <AlertTriangle size={24} /> : <Clock size={24} />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 text-lg">Laporan Semester {r.semester} {r.tahun}</h3>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
                                        <span>Dikirim: {new Date(r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                        {r.status === 'REJECTED' && (
                                            <span className="text-red-500 bg-red-50 px-2 py-0.5 rounded font-medium text-xs">Perlu Revisi</span>
                                        )}
                                    </div>
                                    {r.status === 'REJECTED' && r.rejection_notes && (
                                        <div className="mt-3 bg-red-50 p-4 rounded-lg border border-red-100 text-sm text-red-700">
                                            <strong>Catatan Admin:</strong> "{r.rejection_notes}"
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
                                {/* STATUS BADGE */}
                                <span className={`px-4 py-2 rounded-full text-xs font-bold border w-auto text-center ${r.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200' :
                                        r.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                    }`}>
                                    {r.status === 'APPROVED' ? 'DITERIMA' : r.status === 'REJECTED' ? 'DITOLAK' : 'DIPROSES'}
                                </span>

                                {/* EDIT BUTTON */}
                                {r.status !== 'APPROVED' && (
                                    <Link
                                        href={`/dashboard/lpk/laporan?editId=${r.id}`}
                                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-blue-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition shadow-sm w-full md:w-auto justify-center"
                                    >
                                        <Edit size={16} /> {r.status === 'REJECTED' ? 'Revisi' : 'Edit'}
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
