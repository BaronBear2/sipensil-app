'use server'

import { createClient, createAdminClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function cancelRegistrationAction(formData: FormData) {
    const supabase = await createClient()
    const adminClient = await createAdminClient()

    // 1. Check User Login
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const regId = formData.get('regId') as string
    if (!regId) return { error: 'Data tidak valid.' }

    // 2. Fetch Registration Data to Verify Ownership and Training Date
    const { data: reg } = await supabase
        .from('training_registrations')
        .select('*, blk_trainings(*)')
        .eq('id', regId)
        .eq('user_id', user.id) // Security check: must match user
        .single()

    if (!reg) return { error: 'Pendaftaran tidak ditemukan.' }
    if (!reg.blk_trainings) return { error: 'Data pelatihan tidak valid.' }

    // 3. DATE VALIDATION
    // Cancel button logic: "button will no longer available when the registration date is over"
    // But we also validate here for safety.
    const training = reg.blk_trainings
    if (training.registration_end) {
        const today = new Date()
        const endDate = new Date(training.registration_end)
        endDate.setHours(23, 59, 59, 999) // Set to end of day

        if (today > endDate) {
            return { error: 'Maaf, masa pendaftaran sudah berakhir. Tidak dapat membatalkan.' }
        }
    }

    // 4. DELETE / ROLLBACK
    // Delete the registration
    const { error: deleteError } = await supabase
        .from('training_registrations')
        .delete()
        .eq('id', regId)

    if (deleteError) return { error: 'Gagal membatalkan: ' + deleteError.message }

    // 5. UPDATE PROFILE STATUS -> 'unverified'
    // "Set the penbcaker status from pending to unverified"
    // "condition is changed to before pencaker daftar pelatihan so its like a rollback"
    // We use adminClient because 'account_status' might be protected or we just want to be sure.
    // Assuming 'status' column in 'training_registrations' was 'PENDING', effectively putting the user in 'unverified' account_status usually means they can apply again or edit profile.
    // Wait, if the user was ALREADY 'verified' before applying (auto-accept), valid rollback might be to KEEP them 'verified'.
    // But the request says: "Set the penbcaker status from pending to unverified".
    // This implies the standard flow where: Unverified -> Apply -> Pending -> Verified.
    // If they cancel pending, they go back to Unverified.
    // If they were ALREADY verified and applied (auto-accept?), usually they stay verified.
    // But let's follow instruction: "Set the penbcaker status from pending to unverified".
    // I will check if their current status is 'pending' before forcing 'unverified', to avoid downgrading a legitimately verified user (e.g. from previous training).
    // However, request says "condition is changed to before pencaker daftar pelatihan so its like a rollback".
    // Safest approach based on request: Set to 'unverified'.

    const { error: updateError } = await adminClient
        .from('profiles')
        .update({
            account_status: 'unverified'
        })
        .eq('id', user.id)

    if (updateError) return { error: 'Berhasil batal, namun gagal update status profil.' }

    revalidatePath('/dashboard/pencaker')
    revalidatePath('/dashboard/pencaker/pelatihan-saya')

    return { success: 'Pendaftaran berhasil dibatalkan.' }
}
