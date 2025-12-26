
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FileText, Clock, CheckCircle, XCircle, AlertTriangle, Download, PlusCircle, Calendar, Users } from 'lucide-react'

export default async function RiwayatMagangPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    // Fetch Batches
    const { data: batches } = await supabase
        .from('pencatatan_batches')
        .select(`
            *,
            magang_agreements (count)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    const pending = batches?.filter(r => r.status === 'SUBMITTED' || r.status === 'PENDING') || []
    const accepted = batches?.filter(r => r.status === 'APPROVED') || []
    const rejected = batches?.filter(r => r.status === 'REJECTED') || []

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-8 animate-fade-in pb-24">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-800">Riwayat Pencatatan</h1>
                        <p className="text-gray-500 mt-2">Daftar laporan pemagangan yang telah Anda kirim.</p>
                    </div>
                    <Link href="/dashboard/perusahaan/pencatatan/create" className="bg-orange-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-orange-700 shadow-lg flex items-center gap-2 transition whitespace-nowrap">
                        <PlusCircle size={18} />
                        Buat Pencatatan Baru
                    </Link>
                </div>

                {/* --- SECTIONS (MATCHING LPK) --- */}

                {/* 1. MENUNGGU VERIFIKASI */}
                <section className="mb-10">
                    <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <Clock className="text-yellow-500" size={20} />
                        Menunggu Verifikasi ({pending.length})
                    </h3>
                    {pending.length === 0 ? (
                        <EmptyState message="Tidak ada pencatatan yang sedang menunggu verifikasi." />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {pending.map(batch => (
                                <BatchCard key={batch.id} batch={batch} variant="pending" />
                            ))}
                        </div>
                    )}
                </section>

                {/* 2. DITOLAK / PERLU REVISI */}
                <section className="mb-10">
                    <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <AlertTriangle className="text-red-500" size={20} />
                        Perlu Revisi / Ditolak ({rejected.length})
                    </h3>
                    {rejected.length === 0 ? (
                        <EmptyState message="Tidak ada pencatatan yang ditolak." />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {rejected.map(batch => (
                                <BatchCard key={batch.id} batch={batch} variant="rejected" />
                            ))}
                        </div>
                    )}
                </section>

                {/* 3. DITERIMA */}
                <section>
                    <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <CheckCircle className="text-green-500" size={20} />
                        Diterima ({accepted.length})
                    </h3>
                    {accepted.length === 0 ? (
                        <EmptyState message="Belum ada pencatatan yang diterima." />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {accepted.map(batch => (
                                <BatchCard key={batch.id} batch={batch} variant="accepted" />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}

function BatchCard({ batch, variant }: { batch: any, variant: 'pending' | 'accepted' | 'rejected' }) {
    const isRejected = variant === 'rejected'
    const isApproved = variant === 'accepted'

    const colorClass =
        variant === 'pending' ? 'border-yellow-200 bg-yellow-50/30 hover:border-yellow-400' :
            variant === 'rejected' ? 'border-red-200 bg-red-50/30 hover:border-red-400' :
                'border-green-200 bg-green-50/30 hover:border-green-400'

    const badgeClass =
        variant === 'pending' ? 'bg-yellow-100 text-yellow-700' :
            variant === 'rejected' ? 'bg-red-100 text-red-700' :
                'bg-green-100 text-green-700'

    return (
        <div className={`border rounded-2xl p-5 transition-all hover:shadow-md relative group ${colorClass}`}>
            <div className="flex justify-between items-start mb-3">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeClass}`}>
                    {variant === 'pending' ? 'Menunggu' : variant === 'rejected' ? 'Ditolak' : 'Diterima'}
                </span>
                <span className="text-xs text-gray-400 font-medium">
                    {new Date(batch.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
            </div>

            <h4 className="font-bold text-gray-800 text-lg mb-1 line-clamp-2" title={batch.title}>
                {batch.title}
            </h4>

            <div className="flex items-center gap-2 text-gray-500 mb-4">
                <div className="flex items-center gap-1.5 bg-white/60 px-2 py-1 rounded text-xs border border-gray-100">
                    <Users size={12} />
                    <span className="font-bold">{batch.magang_agreements?.[0]?.count || 0}</span> Peserta
                </div>
            </div>

            {/* Reject Reason */}
            {isRejected && (
                <div className="bg-white/50 p-3 rounded-lg border border-red-100 mb-4">
                    <p className="text-xs font-bold text-red-800 mb-1">Alasan Penolakan:</p>
                    <p className="text-xs text-red-600 italic">"{batch.rejection_reason || 'Tidak ada catatan.'}"</p>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 mt-auto pt-2 border-t border-gray-100/50">
                {/* Excel Button - Always available or restricted? User said 'excel' is distinct. */}
                <a href={`/api/export/batch-excel/${batch.id}`} target="_blank" className="flex-1 bg-green-50 text-green-700 border border-green-200 text-xs font-bold py-2 rounded-lg text-center hover:bg-green-100 flex items-center justify-center gap-1">
                    <FileText size={14} /> Excel
                </a>

                {/* Bukti Button - Only if Approved */}
                {isApproved && (
                    <a href={`/api/export/batch-proof/${batch.id}`} target="_blank" className="flex-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold py-2 rounded-lg text-center hover:bg-blue-100 flex items-center justify-center gap-1">
                        <Download size={14} /> Bukti
                    </a>
                )}
            </div>
        </div>
    )
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="p-8 border-2 border-dashed border-gray-200 rounded-xl text-center text-gray-400 bg-gray-50/50">
            <p className="text-sm">{message}</p>
        </div>
    )
}
