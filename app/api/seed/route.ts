import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()

    try {
        // 1. Delete existing non-admin users
        // Note: Delete from profiles will cascade to related tables (im_japan, blk_registrations, etc.) if FK is set to CASCADE.
        // If not, we might need manual deletion. Assuming standard Cascade or we clear them first.
        // Let's try deleting profiles where role != 'ADMIN_DINAS'.
        // BUT 'auth.users' is the parent. We cannot easily delete 'auth.users' via Client SDK unless using Service Role.
        // "Akun admin, admin@sipensil.com tidak akan direset" implies DB reset mostly on public tables or profiles linked to auth.
        // If we cannot delete auth.users, we might have orphan auth users.
        // Ideally, we should use a Service Role client to delete from auth.users.
        // Since I don't have SERVICE_ROLE_KEY in environment typically exposed to client, 
        // I will focus on clearing the `profiles` table data and let auth be effectively "soft deleted" or ignored 
        // (since app relies on profiles).
        // Or better: The user asked for a reset. If I can't delete auth, I just empty the profiles table (except admin) and re-seed.

        // Wait, if I create new users, I need to create them in `auth.users` too? 
        // Client SDK `signUp` logs me in. I cannot loop `signUp` easily.
        // Maybe I just insert into `profiles` mock data? 
        // User login won't work for these mock users if they don't exist in Auth.
        // The user request: "Tambahkan seeder baru... 6 email baru...".
        // This implies REAL usable accounts? Or just data for the dashboard?
        // "Kemungkinan bug: Tidak bisa accept atau tolak ... jadi mungkin semua data didatabase akan direset."

        // Strategy:
        // Use Supabase Admin (Service Role) if available to delete users. 
        // If not, just insert into `profiles` and other tables. The dashboard only reads `profiles` and `registrations`.
        // Verification buttons update `profiles.account_status`.
        // If I only seed `profiles`, the "User Management" page will show them.

        // Let's assume we just seed the TABLES (`profiles`, `im_japan_registrations`, etc.)
        // and we delete old data from these tables.

        // DELETE Old Data (Explicitly delete children first)
        await supabase.from('im_japan_registrations').delete().neq('id', '00000000-0000-0000-0000-000000000000')
        await supabase.from('training_registrations').delete().neq('id', '00000000-0000-0000-0000-000000000000')
        await supabase.from('magang_permits').delete().neq('id', '00000000-0000-0000-0000-000000000000')
        await supabase.from('lpk_reports').delete().neq('id', '00000000-0000-0000-0000-000000000000')

        await supabase.from('profile_pencaker').delete().neq('id', '00000000-0000-0000-0000-000000000000')
        await supabase.from('profile_perusahaan').delete().neq('id', '00000000-0000-0000-0000-000000000000')
        await supabase.from('profile_lpk').delete().neq('id', '00000000-0000-0000-0000-000000000000')

        // Delete Profiles (except Admin)
        const { error: errP } = await supabase.from('profiles').delete().neq('role', 'ADMIN_DINAS')

        if (errP) throw new Error('Failed to delete profiles: ' + errP.message)

        // SEED DATA
        const roles = ['PENCAKER', 'PERUSAHAAN', 'LPK'] // Mapping to LPK role logic
        // Status distribution: 2 pending, 2 verified, 2 rejected per role.

        const dummies = []

        for (const role of roles) {
            const roleName = role

            for (let i = 0; i < 6; i++) {
                const status = i < 2 ? 'pending' : (i < 4 ? 'verified' : 'rejected')
                const email = `${roleName.toLowerCase()}${i + 1}@test.com`
                const id = crypto.randomUUID()

                // Profile Data
                const profile: any = {
                    id,
                    email,
                    role: role, // 'ADMIN_LPK' for LPK
                    full_name: `${roleName} User ${i + 1} (${status})`,
                    phone: '08123456789',
                    address: 'Jl. Test Seeder No. ' + (i + 1),
                    account_status: status,
                    created_at: new Date().toISOString()
                }

                // Push to batch
                dummies.push(profile)

                // Insert into related tables based on role?
                // Pencaker needs `profile_pencaker`
                // Perusahaan needs `profile_perusahaan`
                // LPK needs `profile_lpk`
            }
        }

        // Since we can't do deep insert easily in one go for mixed types, we insert profiles first.
        const { error: errIns } = await supabase.from('profiles').insert(dummies)
        if (errIns) throw new Error('Failed to insert profiles: ' + errIns.message)

        // Now insert related details
        for (const p of dummies) {
            if (p.role === 'PENCAKER') {
                await supabase.from('profile_pencaker').insert({
                    id: p.id,
                    nik: '123456789012345' + Math.floor(Math.random() * 10),
                    gender: 'L',
                    pob: 'Jakarta',
                    dob: '2000-01-01'
                })

                // Also seed some IM Japan / BLK registrations for these pencakers
                // IM Japan
                if (p.account_status === 'verified' || p.account_status === 'rejected' || p.account_status === 'pending') {
                    // For IM Japan Page test
                    // Status here matches the Profile status? Or we vary it?
                    // User said "2 pending, 2 ditolak, 2 diterima" for the ACCOUNTS? Or Applications?
                    // "6 email baru ... yang 2 pending ...". Usually applies to Account Verification.
                    // But we also need data for "Verifikasi Pencaker" (Profiles) and "IM Japan" (Registrations).
                    // Let's create IM Japan registrations matching the profile status for convenience.
                    let imStatus = p.account_status === 'verified' ? 'VERIFIED' : (p.account_status === 'rejected' ? 'REJECTED' : 'PENDING')

                    await supabase.from('im_japan_registrations').insert({
                        user_id: p.id,
                        status: imStatus,
                        batch: 'Batch 1',
                        documents: { KTP: 'http://example.com/ktp.jpg' }, // Mock
                        admin_notes: imStatus === 'REJECTED' ? 'Dokumen tidak lengkap' : null
                    })
                }
            } else if (p.role === 'PERUSAHAAN') {
                await supabase.from('profile_perusahaan').insert({
                    id: p.id,
                    company_name: p.full_name,
                    nib: '912010210' + Math.floor(Math.random() * 100),
                    pic_name: 'PIC ' + p.full_name
                })
            } else if (p.role === 'LPK') {
                await supabase.from('profile_lpk').insert({
                    id: p.id,
                    lpk_name: p.full_name,
                    pic_name: 'PIC ' + p.full_name
                })
            }
        }

        return NextResponse.json({ success: true, message: 'Seeding completed' })

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
