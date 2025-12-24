'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Submit Report (Bulk or Single)
export async function submitMagangRecord(data: any | any[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    // Ensure array
    const records = Array.isArray(data) ? data : [data]

    if (records.length === 0) return { error: 'Tidak ada data untuk disimpan.' }

    // Map to payload
    const payload = records.map((item: any) => ({
        user_id: user.id,
        nik_pencaker: item.nik,
        nama_pencaker: item.name,
        phone: item.phone,
        email: item.email,
        gender: item.gender,
        alamat_perusahaan: item.address, // Mapped to 'address' input usually
        address: item.address,

        place_of_birth: item.place_of_birth,
        date_of_birth: item.date_of_birth,

        division: item.division,
        duration: item.duration,

        tgl_mulai: item.start_date,
        tgl_selesai: item.end_date,
        post_activity: item.post_activity,

        status: 'PENDING',
        created_at: new Date().toISOString()
    }))

    const { error } = await supabase.from('magang_agreements').insert(payload)

    if (error) {
        console.error("Magang Submit Error:", error)
        return { error: 'Gagal menyimpan data: ' + error.message }
    }

    revalidatePath('/dashboard/perusahaan/pencatatan/riwayat')
    return { success: 'Data pencatatan berhasil dikirim.' }
}
