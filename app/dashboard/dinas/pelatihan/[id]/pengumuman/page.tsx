import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileText, Upload, Calendar, Edit, Bell } from 'lucide-react'
import AnnouncementManager from '@/components/admin/AnnouncementManager'

export default async function AdminPengumumanPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id } = await params

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    const { data: training, error } = await supabase
        .from('blk_trainings')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !training) redirect('/dashboard/dinas/pelatihan')

    // Fetch existing announcements
    const { data: announcements } = await supabase
        .from('training_announcements')
        .select('*')
        .eq('training_id', id)
        .order('created_at', { ascending: false })

    return (
        <div className="p-6 max-w-6xl mx-auto font-sans">
            <div className="flex items-center gap-4 mb-8">
                <Link href={`/dashboard/dinas/pelatihan/${id}`} className="bg-white p-2 rounded-full border shadow-sm hover:text-blue-600 transition">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Manajemen Pengumuman</h1>
                    <p className="text-gray-500">Program: <span className="font-semibold text-blue-600">{training.title}</span></p>
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-8 flex gap-4 items-start">
                <Bell className="text-blue-600 shrink-0 mt-1" />
                <div>
                    <h3 className="font-bold text-blue-800">Jadwal Pengumuman Otomatis</h3>
                    <p className="text-sm text-blue-700 mt-1">Sistem akan otomatis mempublikasikan pengumuman default dan meluluskan peserta pada tanggal berikut jika Anda tidak mengunggah pengumuman khusus.</p>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm text-sm">
                            <span className="block text-gray-500 font-bold mb-1">Administrasi</span>
                            <span className="font-medium text-gray-800">{training.tanggal_pengumuman_kelulusan_administrasi ? new Date(training.tanggal_pengumuman_kelulusan_administrasi).toLocaleDateString('id-ID') : 'Belum Diatur'}</span>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm text-sm">
                            <span className="block text-gray-500 font-bold mb-1">Seleksi Awal</span>
                            <span className="font-medium text-gray-800">{training.tanggal_pengumuman_kelulusan_seleksi_awal ? new Date(training.tanggal_pengumuman_kelulusan_seleksi_awal).toLocaleDateString('id-ID') : 'Belum Diatur'}</span>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm text-sm">
                            <span className="block text-gray-500 font-bold mb-1">Uji Kompetensi</span>
                            <span className="font-medium text-gray-800">{training.tanggal_pengumuman_hasil_uji_kompetensi ? new Date(training.tanggal_pengumuman_hasil_uji_kompetensi).toLocaleDateString('id-ID') : 'Belum Diatur'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <AnnouncementManager trainingId={id} announcements={announcements || []} training={training} />
        </div>
    )
}
