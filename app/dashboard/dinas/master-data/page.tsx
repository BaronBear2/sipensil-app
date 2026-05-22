import { createClient } from '@/utils/supabase/server'
import MasterDataClient from '@/components/admin/MasterDataClient'
import { Settings } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function MasterDataPage() {
    const supabase = await createClient()

    const [
        { data: categories, error: errCat },
        { data: locations, error: errLoc },
        { data: requirements, error: errReq },
        { data: notes, error: errNote }
    ] = await Promise.all([
        supabase.from('master_categories').select('*').order('name'),
        supabase.from('master_locations').select('*').order('name'),
        supabase.from('master_requirements').select('*').order('text'),
        supabase.from('master_notes').select('*').order('text'),
    ])

    const hasSchemaError = [errCat, errLoc, errReq, errNote].some(
        e => e?.code === '42P01' || e?.message?.includes('schema cache')
    )

    return (
        <div className="font-sans min-h-screen bg-gray-50/50 pb-20">
            {hasSchemaError && (
                <div className="max-w-7xl mx-auto px-6 mt-4">
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm">
                        <h3 className="text-red-800 font-bold text-lg">⚠️ PERHATIAN: Tabel Master Data Belum Dibuat!</h3>
                        <p className="text-red-700 mt-1">
                            Silakan buka file migrasi SQL terbaru di folder <strong>supabase/migrations/</strong> dan jalankan seluruh isinya di menu <strong>SQL Editor</strong> pada dashboard Supabase Anda.
                            File yang perlu dijalankan: <strong>20260520130000_master_data.sql</strong> dan <strong>20260520140000_master_requirements.sql</strong>.
                        </p>
                    </div>
                </div>
            )}
            <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white pt-8 pb-20 px-6 md:px-12 relative overflow-hidden rounded-b-3xl shadow-lg mb-8 mt-4">
                <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                    <Settings size={300} />
                </div>
                <div className="relative z-10">
                    <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight text-white">
                        Master Data
                    </h1>
                    <p className="text-green-100 font-medium text-lg max-w-xl">
                        Kelola referensi data yang digunakan di seluruh sistem pelatihan.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20">
                <MasterDataClient 
                    categories={categories || []} 
                    locations={locations || []}
                    requirements={requirements || []}
                    notes={notes || []}
                />
            </div>
        </div>
    )
}
