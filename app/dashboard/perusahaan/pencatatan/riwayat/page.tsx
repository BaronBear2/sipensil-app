
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FileText, Clock, CheckCircle, XCircle, AlertTriangle, Download, PlusCircle } from 'lucide-react'

export default async function RiwayatMagangPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    // Fetch Records
    const { data: records } = await supabase
        .from('magang_agreements')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    const pending = records?.filter(r => r.status === 'PENDING' || r.status === 'PENDING_VALIDATION') || []
    const accepted = records?.filter(r => r.status === 'ACCEPTED' || r.status === 'APPROVED' || r.status === 'VALID') || []
    const rejected = records?.filter(r => r.status === 'REJECTED') || []

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-8 animate-fade-in pb-24">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-800">Riwayat Pencatatan</h1>
                        <p className="text-gray-500 mt-2">Daftar peserta magang yang telah dilaporkan.</p>
                    </div>
                    <Link href="/dashboard/perusahaan/pencatatan/create" className="bg-orange-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-orange-700 shadow-lg flex items-center gap-2 transition whitespace-nowrap">
                        <PlusCircle size={18} />
                        Buat Pencatatan Baru
                    </Link>
                </div>

                {/* --- MENGGU VERIFIKASI --- */}
                <section className="mb-10">
                    <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <Clock className="text-yellow-500" size={20} />
                        Menunggu Verifikasi ({pending.length})
                    </h3>
                    <RecordGrid records={pending} type="pending" />
                </section>

                {/* --- DITERIMA --- */}
                <section className="mb-10">
                    <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <CheckCircle className="text-green-500" size={20} />
                        Diterima / Valid ({accepted.length})
                    </h3>
                    <RecordGrid records={accepted} type="accepted" />
                </section>

                {/* --- DITOLAK --- */}
                <section>
                    <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <XCircle className="text-red-500" size={20} />
                        Ditolak / Revisi ({rejected.length})
                    </h3>
                    <RecordGrid records={rejected} type="rejected" />
                </section>
            </div>
        </div>
    )
}

function RecordGrid({ records, type }: { records: any[], type: 'pending' | 'accepted' | 'rejected' }) {
    if (records.length === 0) {
        return (
            <div className="p-8 border-2 border-dashed border-gray-200 rounded-xl text-center text-gray-400 bg-gray-50/50">
                <p className="text-sm">Tidak ada data.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {records.map(rec => (
                <div key={rec.id} className={`border rounded-2xl p-5 transition-all hover:shadow-md relative group bg-white ${type === 'pending' ? 'border-yellow-200 hover:border-yellow-400' :
                    type === 'accepted' ? 'border-green-200 hover:border-green-400' :
                        'border-red-200 hover:border-red-400'
                    }`}>
                    <div className="flex justify-between items-start mb-3">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${type === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            type === 'accepted' ? 'bg-green-100 text-green-700' :
                                'bg-red-100 text-red-700'
                            }`}>
                            {type === 'pending' ? 'Menunggu' : type === 'accepted' ? 'Diterima' : 'Ditolak'}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">
                            {new Date(rec.created_at).toLocaleDateString('id-ID')}
                        </span>
                    </div>

                    <h4 className="font-bold text-gray-800 text-lg mb-0.5 line-clamp-1">
                        {rec.nama_pencaker}
                    </h4>
                    <p className="text-xs text-gray-500 mb-3">{rec.nik_pencaker}</p>

                    <div className="space-y-1 mb-4">
                        <p className="text-xs text-slate-600 flex justify-between"><span>Bagian:</span> <span className="font-bold">{rec.division || '-'}</span></p>
                        <p className="text-xs text-slate-600 flex justify-between"><span>Durasi:</span> <span className="font-bold">{rec.duration || '-'}</span></p>
                    </div>

                    {type === 'rejected' && (
                        <div className="bg-red-50 p-3 rounded-lg border border-red-100 mb-4">
                            <p className="text-xs font-bold text-red-800 mb-1">Alasan Penolakan:</p>
                            <p className="text-xs text-red-600 italic">"{rec.rejection_reason || 'Tidak ada catatan.'}"</p>
                        </div>
                    )}

                    <div className="flex gap-2 mt-auto pt-2 border-t border-gray-100/50">
                        {type === 'accepted' && (
                            <>
                                <a href={`/api/export/magang-data/${rec.id}`} target="_blank" className="flex-1 bg-green-50 text-green-700 border border-green-200 text-xs font-bold py-2 rounded-lg text-center hover:bg-green-100 flex items-center justify-center gap-1">
                                    <FileText size={14} /> Excel
                                </a>
                                <a href={`/api/export/magang-letter/${rec.id}`} target="_blank" className="flex-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold py-2 rounded-lg text-center hover:bg-blue-100 flex items-center justify-center gap-1">
                                    <FileText size={14} /> Surat
                                </a>
                            </>
                        )}

                        {/* Always allow Excel download for own records? User said "jika diterima maka...". 
                            But "bisa download file excel" might mean for ANY record they submitted.
                            Let's allow basic Excel download for all statuses as "Data Pencatatan" implies accessing the data they input.
                            But user explicitly said "jika diterima maka ada tombol...". I will stick to Accepted strictly for Letter, 
                            but maybe Excel is useful for Pending too. I'll Put Excel there for all, but Letter only for Accepted.
                        */}
                        {type !== 'accepted' && (
                            <a href={`/api/export/magang-data/${rec.id}`} target="_blank" className="flex-1 bg-green-600 text-white border border-green-600 text-xs font-bold py-2 rounded-lg text-center hover:bg-green-700 flex items-center justify-center gap-1 shadow-sm">
                                <Download size={14} /> Download Excel
                            </a>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}
