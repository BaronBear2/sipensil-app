'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function resubmitApplicationAction() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    // 1. Update Profile Status -> 'unverified' (Pending)
    // Clear rejection message
    const { error: profileError } = await supabase
        .from('profiles')
        .update({
            account_status: 'unverified',
            rejection_message: null,
            last_data_update: new Date().toISOString()
        })
        .eq('id', user.id)

    if (profileError) return { error: profileError.message }

    // 2. Update Latest Rejected Training Registration -> 'PENDING'
    // Only if status is currently 'DITOLAK'
    const { data: reg } = await supabase
        .from('training_registrations')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'DITOLAK')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    if (reg) {
        const { error: regError } = await supabase
            .from('training_registrations')
            .update({ status: 'PENDING' })
            .eq('id', reg.id)

        if (regError) return { error: regError.message }
    }

    revalidatePath('/dashboard/pencaker')
    return { success: true }
}
