
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id } = await params

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1. Get the batch to verify ownership/existence
    const { data: batch, error: batchError } = await supabase
        .from('pencatatan_batches')
        .select('id, user_id, title, created_at')
        .eq('id', id)
        .single()

    if (batchError || !batch) {
        return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
    }

    // Security: Ensure the batch belongs to the current user
    if (batch.user_id !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 2. Fetch agreements
    // We explicitly select the fields needed for the report
    const { data: agreements, error: agError } = await supabase
        .from('magang_agreements')
        .select('*')
        .eq('batch_id', id)

    if (agError) {
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
    }

    // 3. Construct CSV
    // Headers
    const headers = [
        "No",
        "NIK",
        "Nama Peserta",
        "Jenis Kelamin",
        "Tempat Lahir",
        "Tanggal Lahir",
        "Alamat",
        "No HP",
        "Divisi/Jabatan",
        "Mulai Magang",
        "Selesai Magang",
        "Pasca Magang" // post_activity
    ]

    // Rows
    const rows = agreements.map((row, index) => {
        // Handle fields that might contain commas by wrapping in quotes
        const safe = (val: any) => {
            if (val === null || val === undefined) return ''
            const str = String(val)
            if (str.includes(',') || str.includes('\n') || str.includes('"')) {
                return `"${str.replace(/"/g, '""')}"`
            }
            return str
        }

        return [
            index + 1,
            safe(row.nik_pencaker),
            safe(row.nama_pencaker),
            safe(row.gender),
            safe(row.place_of_birth),
            safe(row.date_of_birth),
            safe(row.address),
            safe(row.phone),
            safe(row.division || row.jabatan_magang),
            safe(row.tgl_mulai),
            safe(row.tgl_selesai),
            safe(row.post_activity)
        ].join(',')
    })

    const csvContent = [headers.join(','), ...rows].join('\n')

    // 4. Return as file
    return new NextResponse(csvContent, {
        headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="Data_Peserta_${batch.title.replace(/[^a-zA-Z0-9]/g, '_')}.csv"`,
        },
    })
}
