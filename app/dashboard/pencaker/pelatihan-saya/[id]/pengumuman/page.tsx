import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileText, Calendar, Info, Globe, Bell } from 'lucide-react'

export default async function PencakerPengumumanPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id } = await params

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    const { data: training, error } = await supabase
        .from('blk_trainings')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !training) redirect('/dashboard/pencaker/pelatihan-saya')

    // Fetch published announcements
    const { data: announcements } = await supabase
        .from('training_announcements')
        .select('*')
        .eq('training_id', id)
        .eq('is_published', true)
        .order('created_at', { ascending: false })

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-24">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-30 shadow-sm">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={`/dashboard/pencaker/pelatihan-saya/${id}`} className="p-2 rounded-full hover:bg-gray-100 transition text-gray-600 border shadow-sm">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-lg md:text-xl font-bold text-gray-800 leading-tight tracking-tight">Forum Pengumuman</h1>
                            <p className="text-xs text-gray-500 font-medium">Informasi resmi dari penyelenggara</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">{training.title}</h2>
                    <p className="text-gray-500 text-sm">Pusat informasi kelulusan dan pengumuman terkait pelatihan ini.</p>
                </div>

                <div className="space-y-6">
                    {!announcements || announcements.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center text-gray-500">
                            <Bell size={48} className="mx-auto mb-4 text-gray-300" />
                            <h3 className="text-lg font-bold text-gray-700 mb-2">Belum Ada Pengumuman</h3>
                            <p className="text-sm">Silakan cek kembali nanti sesuai dengan jadwal pengumuman yang telah ditentukan.</p>
                        </div>
                    ) : (
                        announcements.map((ann) => (
                            <div key={ann.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 overflow-hidden relative">
                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                                            <Info size={20} />
                                        </div>
                                        <div>
                                            <span className="text-sm font-bold text-gray-800 block capitalize">{ann.type.replace('_', ' ')}</span>
                                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                                <Calendar size={12} /> {new Date(ann.published_at || ann.created_at).toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                {ann.content && (
                                    <div className="text-gray-700 text-sm mb-4 bg-gray-50 p-4 rounded-xl whitespace-pre-wrap leading-relaxed border border-gray-100">
                                        {ann.content}
                                    </div>
                                )}

                                {ann.document_url && (
                                    <div>
                                        <a href={ann.document_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-700 font-bold border border-red-200 rounded-xl hover:bg-red-100 transition shadow-sm text-sm">
                                            <FileText size={18} />
                                            Unduh Dokumen Lampiran (PDF)
                                        </a>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
