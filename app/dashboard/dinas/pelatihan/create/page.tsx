import { createClient } from '@/utils/supabase/server'
import { createTrainingAction } from '@/actions/dinas'
import TrainingForm from '@/components/admin/TrainingForm'

export default async function CreateTrainingPage() {
    const supabase = await createClient()
    
    const [{ data: categories, error: errCat }, { data: locations, error: errLoc }, { data: requirements }, { data: notes }, { data: pastTrainings }] = await Promise.all([
        supabase.from('master_categories').select('name').order('name'),
        supabase.from('master_locations').select('*').order('name'),
        supabase.from('master_requirements').select('*').order('text'),
        supabase.from('master_notes').select('*').order('text'),
        supabase.from('blk_trainings').select('id, title, training_selections(*), training_exams(*)').order('created_at', { ascending: false }).limit(20)
    ])

    const hasSchemaError = errCat?.code === '42P01' || errCat?.message?.includes('schema cache') || errLoc?.code === '42P01'

    return (
        <div className="p-6">
            {hasSchemaError && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm">
                    <h3 className="text-red-800 font-bold text-lg">⚠️ PERHATIAN: Tabel Master Data Belum Dibuat!</h3>
                    <p className="text-red-700 mt-1">Jalankan file <strong>20260520130000_master_data.sql</strong> dan <strong>20260520140000_master_requirements.sql</strong> di SQL Editor Supabase.</p>
                </div>
            )}
            <TrainingForm 
                actionFn={createTrainingAction} 
                categories={categories || []}
                locations={locations || []}
                requirements={requirements || []}
                notes={notes || []}
                pastTrainings={pastTrainings || []}
            />
        </div>
    )
}
