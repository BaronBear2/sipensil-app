import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');

/**
 * Send a custom welcome email using Resend
 */
export async function sendWelcomeEmail(email: string, name: string, role: string) {
    try {
        if (!process.env.RESEND_API_KEY) {
            console.warn('[Email] RESEND_API_KEY is not set. Skipping email to:', email);
            return { success: false, error: 'RESEND_API_KEY not configured' };
        }

        const subject = role === 'PENCAKER' 
            ? 'Selamat Datang di SIPENSIL - Siap Kerja!' 
            : 'Selamat Datang di SIPENSIL';
        
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                <h2 style="color: #2563eb;">Halo, ${name}! 👋</h2>
                <p>Terima kasih telah mendaftar di <strong>SIPENSIL (Sistem Informasi Pelatihan dan Penempatan Tenaga Kerja)</strong> Kabupaten Bekasi.</p>
                <p>Akun Anda dengan peran <strong>${role}</strong> telah berhasil dibuat.</p>
                <p>Silakan login ke dalam sistem untuk melengkapi profil Anda dan mengeksplorasi layanan kami.</p>
                <br/>
                <p>Salam hangat,</p>
                <p><strong>Tim SIPENSIL</strong></p>
            </div>
        `;

        const { data, error } = await resend.emails.send({
            from: 'SIPENSIL <noreply@sipensil.com>', // Ganti dengan domain Anda yang sudah diverifikasi di Resend
            to: email,
            subject: subject,
            html: htmlContent,
        });

        if (error) {
            console.error('[Email] Failed to send email:', error);
            return { success: false, error };
        }

        console.log('[Email] Successfully sent welcome email to:', email);
        return { success: true, data };
    } catch (error) {
        console.error('[Email] Unexpected error:', error);
        return { success: false, error };
    }
}

/**
 * Send a WhatsApp notification using Fonnte API
 */
export async function sendWhatsApp(phone: string, message: string) {
    try {
        if (!process.env.FONNTE_TOKEN) {
            console.warn('[WhatsApp] FONNTE_TOKEN is not set. Skipping WA to:', phone);
            return { success: false, error: 'FONNTE_TOKEN not configured' };
        }

        // Format phone number to start with '62' or '0' as required by Fonnte.
        // Fonnte accepts both, but '08...' or '628...' are standard.
        // We will just pass it directly as users usually input 08... or 628...
        let targetPhone = phone.trim();
        
        const response = await fetch('https://api.fonnte.com/send', {
            method: 'POST',
            headers: {
                'Authorization': process.env.FONNTE_TOKEN,
            },
            body: new URLSearchParams({
                target: targetPhone,
                message: message,
                countryCode: '62', // Default to Indonesia
            }),
        });

        const result = await response.json();
        
        if (!response.ok || !result.status) {
            console.error('[WhatsApp] Failed to send message:', result);
            return { success: false, error: result.reason || 'Unknown error' };
        }

        console.log('[WhatsApp] Successfully sent message to:', targetPhone);
        return { success: true, result };
    } catch (error) {
        console.error('[WhatsApp] Unexpected error:', error);
        return { success: false, error };
    }
}
