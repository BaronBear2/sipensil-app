import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
    // In production, you would want to protect this route. 
    // E.g., checking an Authorization header or VERCEL_CRON_SECRET
    // const authHeader = request.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const supabase = await createAdminClient()

    // 1. Call the updated RPC function
    const { data: updatedUsers, error } = await supabase.rpc('update_time_based_progress')

    if (error) {
        console.error("Cron Job Error calling update_time_based_progress:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!updatedUsers || updatedUsers.length === 0) {
        return NextResponse.json({ message: 'No users progressed today.' })
    }

    // 2. Loop through updated users and send notifications
    const notificationPromises = updatedUsers.map(async (user: any) => {
        let message = ''
        let title = ''

        const groupLinkText = user.whatsapp_group_link 
            ? `\n\nSilakan bergabung ke grup WhatsApp kelas Anda melalui tautan berikut: ${user.whatsapp_group_link}`
            : ''

        if (user.new_step === 4) {
            title = 'Sedang Pelatihan'
            message = `Selamat! Anda telah dijadwalkan untuk masuk pelatihan "${user.training_title}". Harap persiapkan diri Anda.${groupLinkText}`
        } else if (user.new_step === 5) {
            title = 'Jadwal Ujian Tiba'
            message = `Pemberitahuan: Jadwal ujian untuk pelatihan "${user.training_title}" telah tiba. Silakan cek detail di dashboard Anda.${groupLinkText}`
        } else if (user.new_step === 7) {
            title = 'LULUS Pelatihan'
            message = `Selamat! Anda dinyatakan LULUS dalam pelatihan "${user.training_title}". Kami bangga dengan pencapaian Anda.${groupLinkText}`
        }

        // Mock WhatsApp / Email Integration API Call
        console.log(`[MOCK WHATSAPP/EMAIL] Sending to UserID: ${user.user_id}`)
        console.log(`Title: ${title}`)
        console.log(`Message: ${message}`)
        console.log('--------------------------------------------------')

        // Actually insert into the system notifications so it appears on their dashboard too
        return supabase.from('notifications').insert({
            user_id: user.user_id,
            title: title,
            message: message,
            read: false
        })
    })

    await Promise.all(notificationPromises)

    return NextResponse.json({ 
        message: 'Cron executed successfully', 
        processed_count: updatedUsers.length,
        users: updatedUsers 
    })
}
