'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Submit Report (Bulk or Single)
// Submit Report (Bulk or Single) with Batching
export async function submitMagangRecord(data: any | any[], title: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }
    if (!title) return { error: 'Judul Pencatatan wajib diisi.' }

    // Ensure array
    const records = Array.isArray(data) ? data : [data]

    if (records.length === 0) return { error: 'Tidak ada data untuk disimpan.' }

    // 1. Create Batch Header
    const { data: batch, error: batchError } = await supabase
        .from('pencatatan_batches')
        .insert({
            user_id: user.id,
            title: title,
            status: 'SUBMITTED',
            submission_date: new Date().toISOString()
        })
        .select()
        .single()

    if (batchError || !batch) {
        console.error("Batch Creation Error:", batchError)
        return { error: 'Gagal membuat draft pencatatan: ' + batchError?.message }
    }

    const batchId = batch.id

    // 2. Map to payload with Batch ID
    const payload = records.map((item: any) => ({
        user_id: user.id,
        batch_id: batchId, // Link to Batch
        nik_pencaker: item.nik,
        nama_pencaker: item.name,
        phone: item.phone,
        email: item.email,
        gender: item.gender,
        alamat_perusahaan: item.address,
        address: item.address,

        place_of_birth: item.place_of_birth,
        date_of_birth: item.date_of_birth,

        division: item.division,
        duration: item.duration,

        tgl_mulai: item.start_date,
        tgl_selesai: item.end_date,
        post_activity: item.post_activity,

        status: 'PENDING', // Individual status (can be removed if relying on batch status)
        created_at: new Date().toISOString()
    }))

    const { error } = await supabase.from('magang_agreements').insert(payload)

    if (error) {
        console.error("Magang Submit Error:", error)
        // Optionally delete batch if items fail? For now keep it simple.
        return { error: 'Gagal menyimpan data peserta: ' + error.message }
    }

    revalidatePath('/dashboard/perusahaan/pencatatan/riwayat')
    return { success: 'Data pencatatan berhasil dikirim.' }
}
