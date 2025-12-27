'use server'

import { createClient } from '@/utils/supabase/server'

export async function getPublicActiveTrainings() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('blk_trainings')
        .select('id, title, category')
        .eq('status', 'OPEN')
        .order('created_at', { ascending: false })
        .limit(5) // Limit to 5 for footer

    if (error) {
        console.error('Error fetching footer trainings:', error)
        return []
    }

    return data
}
