
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id } = await params

    const { data: record, error } = await supabase.from('magang_agreements').select('*').eq('id', id).single()

    if (error || !record) return NextResponse.json({ error: 'Data not found' }, { status: 404 })

    // CSV Construction
    const headers = [
        "NIK Peserta", "Nama Peserta", "Jenis Kelamin", "Tempat/Tgl Lahir",
        "Alamat", "No HP", "Email",
        "Bagian", "Durasi", "Tgl Mulai", "Tgl Selesai", "Kegiatan Pasca Magang"
    ]
    const row = [
        record.nik_pencaker, record.nama_pencaker, record.gender, `${record.place_of_birth}, ${record.date_of_birth}`,
        `"${record.address || record.alamat_perusahaan}"`, record.phone, record.email,
        record.division, record.duration, record.tgl_mulai, record.tgl_selesai, record.post_activity
    ]

    const csvContent = [
        headers.join(','),
        row.join(',')
    ].join('\n')

    return new NextResponse(csvContent, {
        headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="Data_Magang_${record.nama_pencaker}.csv"`,
        },
    })
}
