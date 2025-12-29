import PublicNavbar from '@/components/PublicNavbar'
import PublicFooter from '@/components/PublicFooter'
import Link from 'next/link'
import { Calendar, Users, Clock, MapPin } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'

export default async function PelatihanPage() {
    const supabase = await createClient()

    // Fetch Active Trainings
    const { data: trainings } = await supabase
        .from('blk_trainings')
        .select('*')
        .eq('status', 'OPEN') // Only show OPEN trainings
        .order('id', { ascending: false })

    return (
        <div className="bg-white text-slate-800 antialiased min-h-screen flex flex-col font-sans">
            <PublicNavbar />

            <main className="flex-grow">
                <div className="bg-slate-900 py-16 text-center text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-blue-900/20"></div>
                    <div className="container mx-auto px-4 relative z-10">
                        <h1 className="text-4xl font-bold mb-4">Daftar Pelatihan Kerja</h1>
                        <p className="text-slate-300 max-w-2xl mx-auto text-lg">
                            Tingkatkan kompetensi Anda melalui berbagai program pelatihan kerja gratis di BLK dan pelatihan mandiri di LPK Swasta.
                        </p>
                    </div>
                </div>

                <div className="container mx-auto px-4 lg:px-8 py-12">

                    {/* Empty State */}
                    {(!trainings || trainings.length === 0) && (
                        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border border-slate-200 border-dashed text-center">
                            <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-6 text-slate-400">
                                <Clock size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-700 mb-2">Belum Ada Pelatihan Dibuka</h3>
                            <p className="text-slate-500 max-w-md">
                                Saat ini belum ada pelatihan yang berstatus dibuka pendaftarannya. Silakan cek kembali secara berkala.
                            </p>
                        </div>
                    )}

                    {/* Grid */}
                    <div className="grid md:grid-cols-3 gap-8">
                        {trainings?.map((item) => (
                            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition group">
                                <div className="h-48 overflow-hidden relative">
                                    <img
                                        src={item.image_url || "https://images.unsplash.com/photo-1581092921461-eab62e97a783?auto=format&fit=crop&w=600&q=80"}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                    />
                                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-blue-700 text-xs font-bold px-2 py-1 rounded shadow-sm">
                                        {item.category}
                                    </div>
                                    <div className="absolute top-3 left-3 bg-green-500/90 backdrop-blur text-white text-xs font-bold px-2 py-1 rounded shadow-sm uppercase">
                                        {item.status}
                                    </div>
                                </div>
                                <div className="p-5 flex flex-col h-[280px]">
                                    <h3 className="font-bold text-lg text-slate-900 mb-2 leading-snug group-hover:text-blue-700 line-clamp-2">{item.title}</h3>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-4 ">
                                        <MapPin size={14} /> {item.provider}
                                    </div>

                                    <div className="grid grid-cols-2 gap-y-2 text-sm text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg mt-auto">
                                        <div className="flex items-center gap-2" title="Jadwal Pelatihan"><Calendar size={14} className="text-emerald-500" /> {item.training_start_date ? new Date(item.training_start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-'}</div>
                                        <div className="flex items-center gap-2" title="Durasi"><Clock size={14} className="text-blue-500" /> - JP</div>
                                        <div className="flex items-center gap-2 col-span-2"><Users size={14} className="text-orange-500" /> Kuota: {item.quota} Orang</div>
                                    </div>

                                    <Link href="/auth/login" className="block text-center w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-bold text-sm transition">
                                        Login untuk Mendaftar
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </main>

            <PublicFooter />
        </div>
    )
}
