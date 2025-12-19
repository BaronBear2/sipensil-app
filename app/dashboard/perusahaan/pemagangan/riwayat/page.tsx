import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { History, FileText, Download, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default async function MagangRiwayatPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    // Fetch Approved Permits
    const { data: permits } = await supabase
        .from('magang_permits')
        .select('*')
        .eq('company_id', user.id)
        .eq('status', 'APPROVED')
        .order('created_at', { ascending: false })

    return (
        <div className="p-8 animate-fade-in">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-100 mb-8">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-2">
                    <History className="text-purple-600" /> Riwayat Pencatatan
                </h1>
                <p className="text-gray-500">
                    Daftar permohonan pemagangan yang telah disetujui dan diterbitkan surat tanda buktinya.
                </p>
            </div>

            <div className="space-y-4">
                {permits && permits.length > 0 ? (
                    permits.map((item: any) => (
                        <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-purple-100">
                            <div className="flex flex-col md:flex-row justify-between gap-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-md border border-green-200 uppercase tracking-wider flex items-center gap-1">
                                            <CheckCircle size={12} /> Disetujui
                                        </span>
                                        <span className="text-sm font-bold text-gray-400">•</span>
                                        <span className="text-sm font-bold text-gray-700">No. Surat: {item.letter_number || '-'}</span>
                                    </div>
                                    <h3 className="font-bold text-gray-800 text-lg">Pencatatan Pemagangan</h3>
                                    <p className="text-sm text-gray-600 mb-1">
                                        Periode: {new Date(item.start_date).toLocaleDateString()} - {new Date(item.end_date).toLocaleDateString()}
                                    </p>
                                    <p className="text-sm text-gray-600">Total Peserta: {item.participant_count} Orang</p>
                                </div>

                                <div className="flex items-center">
                                    <Link
                                        href={`/api/generate-word/magang-agreement?id=${item.id}`}
                                        target="_blank"
                                        className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-green-200 flex items-center justify-center gap-2 transition-all hover:scale-105"
                                    >
                                        <Download size={18} />
                                        Download Surat
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
                        <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <History className="text-gray-400 w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Belum Ada Riwayat</h3>
                        <p className="text-gray-500">Anda belum memiliki permohonan yang disetujui.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
