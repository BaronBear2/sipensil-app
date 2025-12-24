import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

import TrainingCard from '@/components/TrainingCard'
import { BookOpen, ClipboardList, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function BLKProgramsPage() {
    const supabase = await createClient()

    // 1. Cek User Login
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    const { data: trainings } = await supabase.from('blk_trainings').select('*').eq('status', 'OPEN') // Only show OPEN trainings

    return (
        <div className="bg-slate-50 font-sans pb-32">

            <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
                <div className="mb-6">
                    <Link href="/dashboard/pencaker" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold mb-4 transition">
                        <ArrowLeft size={20} /> Kembali ke Dashboard
                    </Link>
                    <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-3">
                        <BookOpen className="text-blue-600" size={32} />
                        Program Pelatihan BLK
                    </h1>
                    <p className="text-slate-500 mt-2">Daftar pelatihan berbasis kompetensi yang sedang dibuka pendaftarannya.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {trainings?.map((item: any) => (
                        <TrainingCard key={item.id} item={item} userStatus={profile?.account_status || 'unverified'} />
                    ))}
                    {(!trainings || trainings.length === 0) && (
                        <div className="col-span-full py-16 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
                            <ClipboardList className="mx-auto text-slate-300 mb-4" size={48} />
                            <p className="text-slate-400 font-bold text-lg">Belum ada pelatihan yang dibuka saat ini.</p>
                            <p className="text-slate-400 text-sm">Silakan cek kembali secara berkala.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
