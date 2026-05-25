'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

async function uploadDocument(file: File, trainingId: string, type: string): Promise<string | null> {
    if (!file || file.size === 0) return null

    const supabase = await createClient()
    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = `${Date.now()}-${file.name.replace(/\s/g, '-')}`

    try {
        const { error } = await supabase.storage.from('documents').upload(`announcements/${trainingId}/${type}/${filename}`, buffer)
        if (error) {
            console.error("Upload Failed:", error)
            return null
        }

        const { data: urlData } = supabase.storage.from('documents').getPublicUrl(`announcements/${trainingId}/${type}/${filename}`)
        return urlData.publicUrl
    } catch (error) {
        console.error("Upload Failed:", error)
        return null
    }
}

export async function publishAnnouncementAction(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    // Role check
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const role = profile?.role?.toLowerCase()
    if (role !== 'admin' && role !== 'admin_dinas' && role !== 'dinas') {
        throw new Error("Unauthorized: Admin access required")
    }

    const trainingId = formData.get('trainingId') as string
    const type = formData.get('type') as string
    const content = formData.get('content') as string
    const file = formData.get('file') as File

    let document_url = null
    if (file && file.size > 0) {
        document_url = await uploadDocument(file, trainingId, type)
    }

    const { error } = await supabase.from('training_announcements').insert({
        training_id: trainingId,
        type,
        content,
        document_url,
        is_published: true,
        published_at: new Date().toISOString()
    })

    if (error) return { error: error.message }

    // If they manually upload for "administrasi" or "seleksi_awal" or "uji_kompetensi", 
    // it overrides the default process or we just let the cron know it's done. 
    // The cron logic can just check if an announcement of that type exists.

    revalidatePath(`/dashboard/dinas/pelatihan/${trainingId}/pengumuman`)
    revalidatePath(`/dashboard/pencaker/pelatihan-saya/${trainingId}/pengumuman`)
    return { success: true }
}

export async function deleteAnnouncementAction(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    // Role check
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const role = profile?.role?.toLowerCase()
    if (role !== 'admin' && role !== 'admin_dinas' && role !== 'dinas') {
        throw new Error("Unauthorized: Admin access required")
    }

    const id = formData.get('id') as string

    const { error } = await supabase.from('training_announcements').delete().eq('id', id)
    if (error) return { error: error.message }

    revalidatePath(`/dashboard/dinas/pelatihan`)
    return { success: true }
}

export async function triggerManualCronAction(formData: FormData) {
    const trainingId = formData.get('trainingId') as string
    const checkType = formData.get('checkType') as string
    
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthorized" }

    // Role check
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const role = profile?.role?.toLowerCase()
    if (role !== 'admin' && role !== 'admin_dinas' && role !== 'dinas') {
        return { error: "Unauthorized: Admin access required" }
    }
    
    const { data: training } = await supabase.from('blk_trainings').select('*').eq('id', trainingId).single()
    if (!training) return { error: 'Pelatihan tidak ditemukan' }

    let processedAny = false

    const checks = [
        { type: 'administrasi', dateField: 'tanggal_pengumuman_kelulusan_administrasi', currentStep: 1, nextStep: 2 },
        { type: 'seleksi_awal', dateField: 'tanggal_pengumuman_kelulusan_seleksi_awal', currentStep: 2, nextStep: 3 },
        { type: 'uji_kompetensi', dateField: 'tanggal_pengumuman_hasil_uji_kompetensi', currentStep: 3, nextStep: 4 }
    ]

    for (const check of checks) {
        if (checkType && check.type !== checkType) continue
        if (!training[check.dateField]) continue
        
        // Let's just run it if they trigger manually regardless of date.
        // For manual trigger, we assume the admin wants to force it.

        const allowedStatuses = check.type === 'administrasi' ? ['DITERIMA'] : ['PENDING', 'DITERIMA']

        // 1. Safe Bulk Update: Update users at currentStep to nextStep
        const { data: usersToPass } = await supabase.from('training_registrations')
            .select('id, profiles(full_name)')
            .eq('training_id', trainingId)
            .in('status', allowedStatuses)
            .eq('progress_step', check.currentStep)

        if (usersToPass && usersToPass.length > 0) {
            let statusToSet = 'DITERIMA'
            if (check.type === 'uji_kompetensi') statusToSet = 'LULUS'

            const { error: bulkError } = await supabase.from('training_registrations')
                .update({ 
                    status: statusToSet, 
                    progress_step: check.nextStep,
                    admin_notes: 'Lulus Otomatis Sistem (Pengumuman)'
                })
                .eq('training_id', trainingId)
                .eq('progress_step', check.currentStep)
                .in('status', allowedStatuses)

            if (bulkError) {
                console.error("Bulk update error:", bulkError)
                continue
            }
        }

        // Fetch ALL users who passed this stage (both manually verified and auto-passed)
        const { data: allPassedUsers } = await supabase.from('training_registrations')
            .select('id, profiles(full_name)')
            .eq('training_id', trainingId)
            .gte('progress_step', check.nextStep)
            .neq('status', 'DITOLAK')

        let pdfListMsg = "Daftar Peserta Lulus:\n"
        if (allPassedUsers && allPassedUsers.length > 0) {
            allPassedUsers.forEach((u: any, idx) => {
                pdfListMsg += `${idx + 1}. ${u.profiles?.full_name || 'Peserta'}\n`
            })
        } else {
            pdfListMsg += "Belum ada peserta yang diluluskan."
        }

        // 2. Check if announcement already exists
        const { data: existingAnnouncements } = await supabase.from('training_announcements')
            .select('*')
            .eq('training_id', trainingId)
            .eq('type', check.type)

        if (existingAnnouncements && existingAnnouncements.length > 0) {
            // Update the existing announcement to append the list if not already there, and publish it
            const existing = existingAnnouncements[0]
            if (!existing.content?.includes("Daftar Peserta Lulus:")) {
                const newContent = (existing.content || "") + `\n\nPengumuman Sistem Otomatis\n\n${pdfListMsg}`
                await supabase.from('training_announcements').update({
                    content: newContent,
                    is_published: true,
                    published_at: existing.published_at || new Date().toISOString()
                }).eq('id', existing.id)
            } else if (!existing.is_published) {
                // Just publish it
                await supabase.from('training_announcements').update({
                    is_published: true,
                    published_at: new Date().toISOString()
                }).eq('id', existing.id)
            }
        } else {
            await supabase.from('training_announcements').insert({
                training_id: trainingId,
                type: check.type,
                content: `Pengumuman Sistem Otomatis\n\n${pdfListMsg}`,
                is_published: true,
                published_at: new Date().toISOString()
            })
        }

        processedAny = true
    }

    revalidatePath(`/dashboard/dinas/pelatihan/${trainingId}/pengumuman`)
    return { success: true, processedAny }
}
