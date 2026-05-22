import PublicNavbar from '@/components/PublicNavbar'
import PublicFooter from '@/components/PublicFooter'
import { createClient } from '@/utils/supabase/server'
import PelatihanClient from '@/components/pelatihan/PelatihanClient'

export default async function PelatihanPage() {
    const supabase = await createClient()

    const { data: systemDate } = await supabase.rpc('get_system_date')
    const today = systemDate || new Date().toISOString().split('T')[0]
    // Fetch Active Trainings
    const { data: trainings } = await supabase
        .from('blk_trainings')
        .select('*')
        .eq('status', 'OPEN') // Only show OPEN trainings
        .gte('registration_end', today)
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

                <PelatihanClient trainings={trainings as any[]} />
            </main>

            <PublicFooter />
        </div>
    )
}
