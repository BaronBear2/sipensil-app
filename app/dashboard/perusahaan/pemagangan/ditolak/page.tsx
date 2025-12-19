import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AlertCircle, FileText, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default async function MagangDitolakPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    // Fetch Rejected Permits
    const { data: permits } = await supabase
        .from('magang_permits')
        .select('*')
        .eq('company_id', user.id)
        .eq('status', 'REJECTED')
        .order('created_at', { ascending: false })

    return (
        <div className="p-8 animate-fade-in">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100 mb-8">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-2">
                    <AlertCircle className="text-red-500" /> Pencatatan Ditolak / Revisi
                </h1>
                <p className="text-gray-500">
                    Daftar permohonan yang ditolak oleh Dinas dan perlu diperbaiki.
                </p>
            </div>

            <div className="space-y-4">
                {permits && permits.length > 0 ? (
                    permits.map((item: any) => (
                        <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-red-200">
                            <div className="flex flex-col md:flex-row justify-between gap-6">
                                <div>
                                    <h3 className="font-bold text-gray-800 text-lg">Pencatatan Pemagangan {new Date(item.created_at).getFullYear()}</h3>
                                    <p className="text-sm text-gray-600 mb-1">
                                        Periode: {new Date(item.start_date).toLocaleDateString()} - {new Date(item.end_date).toLocaleDateString()}
                                    </p>
                                    <p className="text-sm text-gray-600 mb-3">Total Peserta: {item.participant_count} Orang</p>

                                    <h4 className="font-bold text-red-800 text-sm mb-1">Catatan Dinas:</h4>
                                    <div className="bg-red-50 p-3 rounded-lg border border-red-100 text-red-700 text-sm">
                                        "{item.rejection_reason || 'Mohon periksa kembali data peserta.'}"
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <Link
                                        // Assumption: Redirecting back to Main Form allows editing "Current Active" 
                                        // IF the logic in main page loads the LATEST one. 
                                        // If this rejected item IS the latest, it works. 
                                        // If user starts NEW one, this might be archived. 
                                        // For simplicity, we just link to dashboard or detail.
                                        href={`/dashboard/perusahaan/pemagangan?editId=${item.id}`} // Main page usually auto-loads
                                        className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-all"
                                    >
                                        <FileText size={18} />
                                        Perbaiki Data
                                        <ChevronRight size={18} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
                        <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="text-green-600 w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Tidak Ada Data Ditolak</h3>
                        <p className="text-gray-500">Permohonan Anda aman atau sedang diproses.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
