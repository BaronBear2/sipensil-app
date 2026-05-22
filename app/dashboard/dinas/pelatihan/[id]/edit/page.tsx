import { createClient } from '@/utils/supabase/server'
import { updateTrainingAction } from '@/actions/dinas'
import TrainingForm from '@/components/admin/TrainingForm'
import { notFound } from 'next/navigation'

export default async function EditTrainingPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id } = await params

    const { data: training } = await supabase
        .from('blk_trainings')
        .select('*, training_selections(*), training_exams(*)')
        .eq('id', id)
        .single()

    if (!training) return notFound()
    
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
                    <p className="text-red-700 mt-1">Sistem gagal menemukan tabel `master_categories` di database Anda. Silakan buka file <strong>`supabase/migrations/20260520130000_master_data.sql`</strong> dan jalankan seluruh isinya di menu <strong>SQL Editor</strong> pada dashboard Supabase Anda.</p>
                </div>
            )}
            <TrainingForm 
                actionFn={updateTrainingAction} 
                initialData={training} 
                isEdit={true} 
                categories={categories || []}
                locations={locations || []}
                requirements={requirements || []}
                notes={notes || []}
                pastTrainings={pastTrainings || []}
            />
        </div>
    )
}
