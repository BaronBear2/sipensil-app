import { createClient } from '@/utils/supabase/server'
import { updateTrainingAction } from '@/actions/dinas'
import TrainingForm from '@/components/admin/TrainingForm'
import { notFound } from 'next/navigation'

export default async function EditTrainingPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id } = await params

    const { data: training } = await supabase
        .from('blk_trainings')
        .select('*')
        .eq('id', id)
        .single()

    if (!training) return notFound()

    return (
        <div className="p-6">
            <TrainingForm actionFn={updateTrainingAction} initialData={training} isEdit={true} />
        </div>
    )
}
