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
        // Fetch QA system time if it exists
        const { data: qaTime } = await supabase.from('qa_system_time').select('overridden_time').eq('id', 1).single()
        const now = qaTime?.overridden_time ? new Date(qaTime.overridden_time) : new Date()

        // Calculate today's date in Asia/Jakarta timezone to prevent 7-hour timezone offset bugs
        const formatter = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' })
        const parts = formatter.formatToParts(now)
        const y = parts.find(p => p.type === 'year')?.value
        const m = parts.find(p => p.type === 'month')?.value
        const d = parts.find(p => p.type === 'day')?.value
        const todayOnlyDateStr = `${y}-${m}-${d}`

        // We consider Hari H as: "if today is >= the scheduled date"

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

                if (todayOnlyDateStr >= scheduledDateStr) {
                    // ====================================================================
                    // STEP 1: UPDATE PROGRESS_STEP — always run regardless of announcement
                    // published state. An admin may have published the announcement early,
                    // but we must STILL update progress_step for all eligible users.
                    // ====================================================================

                    if (check.type === 'administrasi') {
                        // On administrasi announcement date: move all DITERIMA users at step 1 -> step 2.
                        // This handles the case where quota was never fully filled before the date arrived.
                        await supabase.from('training_registrations')
                            .update({ progress_step: 2 })
                            .eq('training_id', training.id)
                            .eq('status', 'DITERIMA')
                            .eq('progress_step', 1)
                    } else {
                        // seleksi_awal: step 2 -> 3
                        // uji_kompetensi: step 3 -> 4, status -> LULUS
                        const statusToSet = check.type === 'uji_kompetensi' ? 'LULUS' : 'DITERIMA'

                        await supabase.from('training_registrations')
                            .update({
                                status: statusToSet,
                                progress_step: check.nextStep,
                                admin_notes: 'Lulus Otomatis Sistem (Pengumuman)'
                            })
                            .eq('training_id', training.id)
                            .eq('progress_step', check.currentStep)
                            .in('status', ['PENDING', 'DITERIMA'])
                    }

                    // ====================================================================
                    // STEP 2: CHECK IF ANNOUNCEMENT IS ALREADY PUBLISHED
                    // If yes, progress_step was already updated above — no need to re-publish.
                    // We use 'continue' (not 'break') so the next stage is also checked,
                    // in case it is due but not yet published.
                    // ====================================================================
                    const { data: checkExisting } = await supabase.from('training_announcements')
                        .select('is_published')
                        .eq('training_id', training.id)
                        .eq('type', check.type)
                        .limit(1)

                    if (checkExisting && checkExisting.length > 0 && checkExisting[0].is_published) {
                        // Announcement already published. Progress_step was updated above.
                        // Use 'continue' to move to the next stage check. The 'break' at the bottom
                        // (after publishing) prevents cascade — this path only skips re-publishing.
                        continue
                    }

                    // ====================================================================
                    // STEP 3: PUBLISH ANNOUNCEMENT
                    // Only reaches here if the announcement is NOT yet published.
                    // ====================================================================

                    // Fetch ALL users who passed this stage for the participant list
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

                    // Check if announcement record already exists (to update vs insert)
                    const { data: existingAnnouncements } = await supabase.from('training_announcements')
                        .select('*')
                        .eq('training_id', training.id)
                        .eq('type', check.type)

                    let document_url = existingAnnouncements?.[0]?.document_url || null;

                    // Generate PDF list
                    try {
                        const { generateParticipantListPDF } = await import('@/utils/pdf');
                        const pdfBuffer = await generateParticipantListPDF(training.title || 'Pelatihan', check.type, allPassedUsers || []);
                        const filename = `peserta_lulus_${Date.now()}.pdf`;
                        const { error: uploadError } = await supabase.storage.from('documents').upload(`announcements/${training.id}/${check.type}/${filename}`, pdfBuffer, { contentType: 'application/pdf', upsert: true });
                        if (!uploadError) {
                            const { data: urlData } = supabase.storage.from('documents').getPublicUrl(`announcements/${training.id}/${check.type}/${filename}`);
                            document_url = urlData.publicUrl;
                        } else {
                            console.error("Failed to upload PDF:", uploadError);
                        }
                    } catch (pdfErr) {
                        console.error("Failed to generate PDF:", pdfErr);
                    }

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
                            document_url: document_url,
                            is_published: true,
                            published_at: existing.published_at || now.toISOString()
                        }).eq('id', existing.id)
                    } else {
                        await supabase.from('training_announcements').insert({
                            training_id: training.id,
                            type: check.type,
                            content: `Pengumuman Sistem Otomatis\n\n${pdfListMsg}`,
                            document_url: document_url,
                            is_published: true,
                            published_at: now.toISOString()
                        })
                    }

                    processedCount++
                    // Break after publishing ONE announcement per training per cron run.
                    // This prevents cascading announcements if multiple dates have passed.
                    // Note: progress_step updates above are NOT affected by this break.
                    break;
                }
            }
        }

        // Process custom manual announcements with scheduled_date
        const { error: genericUpdateError } = await supabase.from('training_announcements')
            .update({ is_published: true, published_at: now.toISOString() })
            .eq('is_published', false)
            .not('scheduled_date', 'is', null)
            .lte('scheduled_date', todayOnlyDateStr)

        if (genericUpdateError) {
            console.error("Cron Error updating generic scheduled announcements:", genericUpdateError)
        }

        return NextResponse.json({ success: true, processedCount })
    } catch (err: any) {
        console.error("Cron exception:", err)
        return NextResponse.json({ success: false, error: err.message }, { status: 500 })
    }
}
