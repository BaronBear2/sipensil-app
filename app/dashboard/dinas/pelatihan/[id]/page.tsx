import { createClient, createAdminClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import TrainingDetailV2 from '@/components/admin/TrainingDetailV2'

export default async function TrainingDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createAdminClient()
    const { id } = await params

    const { data: training } = await supabase
        .from('blk_trainings')
        .select('*')
        .eq('id', id)
        .single()

    if (!training) return notFound()

    // Fetch Registrations
    const { data: registrationsData, error } = await supabase
        .from('training_registrations')
        .select('*, profiles(full_name, profile_pencaker(phone))')
        .eq('training_id', id)
        .order('created_at', { ascending: true }) // First come first serve roughly
    
    if (error) console.error("Error fetching registrations:", error);

    const registrations = registrationsData?.map(reg => {
        const phone = reg.profiles?.profile_pencaker?.[0]?.phone || reg.profiles?.profile_pencaker?.phone;
        return {
            ...reg,
            profiles: {
                ...reg.profiles,
                phone: phone
            }
        }
    }) || []

    return (
        <div className="p-6 font-sans bg-gray-50/50 min-h-screen">
            <TrainingDetailV2 training={training} registrations={registrations} />
        </div>
    )
}
