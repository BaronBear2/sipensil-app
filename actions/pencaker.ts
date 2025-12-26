// actions/pencaker.ts
'use server'

import { createClient, createAdminClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function resubmitApplicationAction() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    // Use Admin Client to ensure we can update the protected 'account_status' field
    const adminClient = await createAdminClient()

    // 1. Reset Global Profile Status -> 'unverified'
    // This removes the "Rejection Banner" and allows the user to apply for NEW trainings.
    // NOTE: We do NOT reset the old 'DITOLAK' training registration. It remains rejected history.
    const { error: profileError } = await adminClient
        .from('profiles')
        .update({
            account_status: 'unverified',
            rejection_message: null,
            last_data_update: new Date().toISOString()
        })
        .eq('id', user.id)

    if (profileError) return { error: 'Gagal mereset status profil: ' + profileError.message }

    revalidatePath('/dashboard/pencaker')
    return { success: true }
}
