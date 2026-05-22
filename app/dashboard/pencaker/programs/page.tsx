
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

import TrainingCard from '@/components/TrainingCard'
import { BookOpen, ClipboardList, ArrowLeft, Search } from 'lucide-react'
import Link from 'next/link'

export default async function BLKProgramsPage() {
    const supabase = await createClient()

    // 1. Cek User Login
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    const { data: systemDate } = await supabase.rpc('get_system_date')
    const today = systemDate || new Date().toISOString().split('T')[0]
    const { data: trainings } = await supabase
        .from('blk_trainings')
        .select('*')
        .eq('status', 'OPEN')
        .gte('registration_end', today)
        .or(`registration_start.lte.${today},registration_start.is.null`)
        .order('created_at', { ascending: false })

    return (
        <div className="bg-slate-50 font-sans min-h-screen flex flex-col">

            {/* HERO SECTION */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white pt-10 pb-20 px-6 md:px-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                    <BookOpen size={300} />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto">
                    <Link href="/dashboard/pencaker" className="inline-flex items-center gap-2 text-blue-200 hover:text-white font-bold mb-6 transition">
                        <ArrowLeft size={20} /> Kembali ke Dashboard
                    </Link>

                    <h1 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">
                        Katalog Pelatihan
                    </h1>
                    <p className="text-blue-100 font-medium text-lg max-w-2xl leading-relaxed">
                        Tingkatkan kompetensi Anda dengan mengikuti pelatihan berbasis kompetensi di UPTD Balai Latihan Kerja (BLK) Kabupaten Bekasi.
                    </p>
                </div>
            </div>

            {/* CONTENT SECTION */}
            <div className="flex-1 max-w-7xl mx-auto px-4 md:px-6 -mt-10 relative z-20 pb-20 w-full">

                {/* Search/Filter Bar (Visual Only for now) */}
                {/* Search/Filter Bar (Removed as per request, just showing count) */}
                <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-100 mb-8 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-700">Program Pelatihan Tersedia</h2>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span className="font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">{trainings?.length || 0} Program</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trainings?.map((item: any) => (
                        <TrainingCard key={item.id} item={item} userStatus={profile?.account_status || 'unverified'} />
                    ))}

                    {(!trainings || trainings.length === 0) && (
                        <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
                            <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ClipboardList size={40} />
                            </div>
                            <h3 className="text-slate-800 font-bold text-xl mb-2">Belum Ada Pelatihan</h3>
                            <p className="text-slate-500 text-sm max-w-md mx-auto">
                                Saat ini belum ada program pelatihan yang dibuka. Silakan cek kembali secara berkala untuk update terbaru.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
