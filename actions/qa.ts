'use server'

import { createClient, createAdminClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

export async function qaUpdateProgressStep(formData: FormData) {
    const supabase = await createClient()


    // 1. Cek User Login (Dev Only or Admin check optional, but we assume it's for dev so just checking user is enough)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Role check to prevent Pencakers from graduating themselves
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const role = profile?.role?.toLowerCase()
    if (role !== 'admin' && role !== 'admin_dinas' && role !== 'dinas') {
        return { error: 'Unauthorized: Admin access required' }
    }

    const regId = formData.get('regId') as string
    const step = parseInt(formData.get('step') as string)

    if (!regId || isNaN(step)) return { error: 'Invalid data' }

    let status = 'DITERIMA'
    if (step === 1) status = 'PENDING'
    if (step === 7) status = 'LULUS'

    const adminSupabase = await createAdminClient()

    const { error } = await adminSupabase
        .from('training_registrations')
        .update({
            progress_step: step,
            status: status
        })
        .eq('id', regId)
        .eq('user_id', user.id) // Ensure they only modify their own (safety)

    if (error) {
        return { error: error.message }
    }

    revalidatePath(`/dashboard/pencaker/pelatihan-saya/${regId}`)
    return { success: true }
}

export async function getSystemTime() {
    const supabase = await createAdminClient()
    const { data, error } = await supabase
        .from('qa_system_time')
        .select('overridden_time')
        .eq('id', 1)
        .single()

    if (error || !data) {
        return null
    }
    return data.overridden_time ? new Date(data.overridden_time).toISOString().split('T')[0] : null
}

export async function setSystemTime(timeStr: string | null) {
    const supabaseUser = await createClient()
    const { data: { user } } = await supabaseUser.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabaseUser.from('profiles').select('role').eq('id', user.id).single()
    const role = profile?.role?.toLowerCase()
    if (role !== 'admin' && role !== 'admin_dinas' && role !== 'dinas') {
        return { error: 'Unauthorized: Admin access required' }
    }

    const supabase = await createAdminClient()

    const { error } = await supabase
        .from('qa_system_time')
        .update({
            overridden_time: timeStr ? `${timeStr}T00:00:00Z` : null
        })
        .eq('id', 1)

    if (error) {
        return { error: error.message }
    }

    // Trigger time-based progression updates by calling the Cron API
    try {
        const headersList = await headers()
        const host = headersList.get('host') || 'localhost:3000'
        const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`
        
        const res1 = await fetch(`${baseUrl}/api/cron/daily-progress`, { cache: 'no-store' })
        const json1 = await res1.json()
        
        const res2 = await fetch(`${baseUrl}/api/cron/process-announcements`, { cache: 'no-store' })
        const json2 = await res2.json()

        console.log("QA Time Travel Triggered Crons:", { dailyProgress: json1, processAnnouncements: json2 })
    } catch (err) {
        console.error("Failed to trigger Cron API during QA:", err)
    }

    revalidatePath('/dashboard/pencaker', 'layout')
    revalidatePath('/dashboard/dinas', 'layout')
    return { success: true }
}

export async function qaDeleteRejectionAction(formData: FormData) {
    const supabase = await createClient()

    // 1. Cek User Login (Dev Only)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const regId = formData.get('regId') as string
    if (!regId) return { error: 'Invalid data' }

    // Use admin client to bypass RLS if necessary, or user can delete their own
    const adminSupabase = await createAdminClient()

    // Cek apakah statusnya benar-benar DITOLAK
    const { data: reg } = await adminSupabase.from('training_registrations').select('status').eq('id', regId).single()
    if (reg?.status !== 'DITOLAK' && reg?.status !== 'REJECTED') {
        return { error: 'Pendaftaran ini tidak berstatus ditolak, tidak dapat dihapus.' }
    }

    // Hapus data dependen (exam_results) jika ada untuk menghindari foreign key constraint
    await adminSupabase.from('exam_results').delete().eq('registration_id', regId)

    const { error } = await adminSupabase
        .from('training_registrations')
        .delete()
        .eq('id', regId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/pencaker/pelatihan-saya')
    return { success: true }
}

