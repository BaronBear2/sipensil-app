import { createAdminClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

// Vercel Hobby Plan allows up to 60s for Serverless Functions. We set it here to prevent timeouts during large bulk updates.
export const maxDuration = 60;

// Vercel Cron Jobs require returning a valid Response
export async function GET(request: Request) {
    const supabase = await createAdminClient()

    // Check Authorization header for Vercel's built-in protection
    if (process.env.CRON_SECRET && request.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    try {
        // Calculate today's date in Asia/Jakarta timezone to prevent 7-hour timezone offset bugs
        const now = new Date()
        const formatter = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' })
        const parts = formatter.formatToParts(now)
        const y = parts.find(p => p.type === 'year')?.value
        const m = parts.find(p => p.type === 'month')?.value
        const d = parts.find(p => p.type === 'day')?.value
        const todayOnlyDateStr = `${y}-${m}-${d}`
        
        // We consider +H as: "if today is >= the scheduled date"
        
        const { data: trainings, error: trainingsError } = await supabase
            .from('blk_trainings')
            .select('id, title, quota, tanggal_pengumuman_kelulusan_administrasi, tanggal_pengumuman_kelulusan_seleksi_awal, tanggal_pengumuman_hasil_uji_kompetensi')
            .in('status', ['OPEN', 'ONGOING', 'SELECTION']) // Ensure we don't process already FINISHED

        if (trainingsError || !trainings) {
            console.error("Cron Error fetching trainings:", trainingsError)
            return NextResponse.json({ success: false, error: trainingsError?.message }, { status: 500 })
        }

        let processedCount = 0

        const checks = [
            { type: 'administrasi', dateField: 'tanggal_pengumuman_kelulusan_administrasi' as const, currentStep: 1, nextStep: 2 },
            { type: 'seleksi_awal', dateField: 'tanggal_pengumuman_kelulusan_seleksi_awal' as const, currentStep: 2, nextStep: 3 },
            { type: 'uji_kompetensi', dateField: 'tanggal_pengumuman_hasil_uji_kompetensi' as const, currentStep: 3, nextStep: 4 }
        ]

        for (const training of trainings) {
            for (const check of checks) {
                const dateStr = training[check.dateField]
                if (!dateStr) continue

                // Compare string dates lexicographically (YYYY-MM-DD) which is timezone-safe!
                const scheduledDateStr = new Date(dateStr).toISOString().split('T')[0]
                
                if (todayOnlyDateStr === scheduledDateStr) {
                    // It is exactly Hari H. Let's run the auto-announcement logic.

                    if (check.type === 'administrasi') {
                        // Check if quota is met
                        const { count: acceptedCount } = await supabase.from('training_registrations')
                            .select('*', { count: 'exact', head: true })
                            .eq('training_id', training.id)
                            .in('status', ['DITERIMA', 'LULUS', 'SELESAI'])
                            .gte('progress_step', 2)
                        
                        if (acceptedCount === null || acceptedCount < (training.quota || 0)) {
                            console.log(`[Administrasi Cron] Quota not met for training ${training.id}. Skipping.`)
                            continue // Skip processing for this training
                        }
                        // DO NOT perform bulk update for administrasi.
                    } else {
                        // 1. Safe Bulk Update: Update all PENDING or DITERIMA users at currentStep to nextStep
                        const { data: usersToPass } = await supabase.from('training_registrations')
                            .select('id, profiles(full_name)')
                            .eq('training_id', training.id)
                            .in('status', ['PENDING', 'DITERIMA'])
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
                                .eq('training_id', training.id)
                                .eq('progress_step', check.currentStep)
                                .in('status', ['PENDING', 'DITERIMA'])

                            if (bulkError) {
                                console.error("Bulk update error in cron:", bulkError)
                                continue
                            }
                        }
                    }

                    // Fetch ALL users who passed this stage (both manually verified and auto-passed)
                    const { data: allPassedUsers } = await supabase.from('training_registrations')
                        .select('id, profiles(full_name)')
                        .eq('training_id', training.id)
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
                        .eq('training_id', training.id)
                        .eq('type', check.type)

                    if (existingAnnouncements && existingAnnouncements.length > 0) {
                        const existing = existingAnnouncements[0]
                        const marker = "Daftar Peserta Lulus:";
                        let baseContent = existing.content || "";
                        if (baseContent.includes(marker)) {
                            baseContent = baseContent.substring(0, baseContent.indexOf(marker)).trimEnd();
                        }
                        const newContent = baseContent + `\n\n${pdfListMsg}`;

                        await supabase.from('training_announcements').update({
                            content: newContent,
                            is_published: true,
                            published_at: existing.published_at || new Date().toISOString()
                        }).eq('id', existing.id)
                    } else {
                        await supabase.from('training_announcements').insert({
                            training_id: training.id,
                            type: check.type,
                            content: `Pengumuman Sistem Otomatis\n\nBerdasarkan hasil evaluasi, berikut adalah pengumuman hasil tahap ini.\n\n${pdfListMsg}`,
                            is_published: true,
                            published_at: new Date().toISOString()
                        })
                    }

                    processedCount++
                }
            }
        }

        return NextResponse.json({ success: true, processedCount })
    } catch (err: any) {
        console.error("Cron exception:", err)
        return NextResponse.json({ success: false, error: err.message }, { status: 500 })
    }
}
