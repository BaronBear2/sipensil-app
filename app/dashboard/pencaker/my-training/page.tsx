'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { ArrowLeft, Download, Calendar, MapPin, CheckCircle, Clock, XCircle } from 'lucide-react'

export default function MyTrainingPage() {
    const supabase = createClient()
    const [trainings, setTrainings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const getData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data } = await supabase
                .from('training_registrations')
                .select(`
                    *,
                    blk_trainings!inner(*)
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (data) setTrainings(data)
            setLoading(false)
        }
        getData()
    }, [])

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'DITERIMA': return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle size={12} /> DITERIMA</span>
            case 'PENDING': return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Clock size={12} /> MENUNGGU VERIFIKASI</span>
            case 'DITOLAK': return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><XCircle size={12} /> DITOLAK</span>
            default: return <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">{status}</span>
        }
    }

    if (loading) return <div className="p-10 text-center">Memuat...</div>

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">

                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Pelatihan Saya</h1>
                        <p className="text-gray-500 text-sm">Riwayat pendaftaran pelatihan BLK Anda.</p>
                    </div>
                    <Link href="/dashboard/pencaker" className="text-sm font-bold text-gray-500 hover:text-blue-600 flex items-center gap-2">
                        <ArrowLeft size={16} /> Kembali
                    </Link>
                </div>

                <div className="space-y-4">
                    {trainings.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                            <p className="text-gray-400 font-bold">Belum ada pelatihan yang diikuti.</p>
                            <Link href="/dashboard/pencaker" className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-blue-700">Cari Pelatihan</Link>
                        </div>
                    ) : (
                        trainings.map((item) => (
                            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
                                {/* Image / Icon */}
                                <div className="w-20 h-20 bg-gray-100 rounded-lg shrink-0 overflow-hidden">
                                    {item.blk_trainings.image_url ?
                                        <img src={item.blk_trainings.image_url} className="w-full h-full object-cover" /> :
                                        <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold text-xs">IMG</div>
                                    }
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        <span className="text-[10px] font-bold uppercase bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                            {item.blk_trainings.provider}
                                        </span>
                                        {getStatusBadge(item.status)}
                                    </div>
                                    <h3 className="font-bold text-gray-800 text-lg mb-1">{item.blk_trainings.title}</h3>
                                    <p className="text-xs text-gray-500">Daftar pada: {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                </div>

                                {/* Action */}
                                <div className="shrink-0 w-full md:w-auto">
                                    {item.status === 'DITERIMA' ? (
                                        <button
                                            onClick={() => window.print()} // Simple print trigger for MVP
                                            className="w-full md:w-auto flex items-center justify-center gap-2 border-2 border-green-600 text-green-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-50 transition"
                                        >
                                            <Download size={16} /> Kartu Tanda Daftar
                                        </button>
                                    ) : (
                                        <button disabled className="w-full md:w-auto text-gray-400 text-xs font-bold border border-gray-200 px-4 py-2 rounded-lg cursor-not-allowed">
                                            Belum Tersedia
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
