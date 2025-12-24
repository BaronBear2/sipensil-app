
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id } = await params

    // Fetch Record + Company Name (from User Profile)
    // We need company name. 'magang_agreements' has 'user_id'. 
    // Join with profiles/perusahaan? 
    // Current schema 'magang_agreements' doesn't seem to store Company Name explicitly unless 'nama_perusahaan' column exists? 
    // Schema says: `nama_perusahaan text`.
    // My migration didn't remove it. So it should be there. 
    // Wait, my `submitMagangRecord` action DID NOT SAVE `nama_perusahaan`.
    // I should fix the action to save `nama_perusahaan` from the logged-in user's profile.

    // For now, let's fetch it dynamically if missing.
    const { data: record } = await supabase.from('magang_agreements').select('*').eq('id', id).single()
    if (!record) return NextResponse.json({ error: 'Data not found' }, { status: 404 })

    // Get Company Profile
    const { data: profile } = await supabase.from('profiles').select('*, profile_perusahaan(*)').eq('id', record.user_id).single()
    const companyName = profile?.profile_perusahaan?.company_name || profile?.company_name || "Perusahaan"

    // Generate Word
    const doc = new Document({
        sections: [{
            children: [
                new Paragraph({
                    children: [new TextRun({ text: "PEMERINTAH KABUPATEN BEKASI", bold: true, size: 28 })],
                    alignment: AlignmentType.CENTER,
                }),
                new Paragraph({
                    children: [new TextRun({ text: "DINAS KETENAGAKERJAAN", bold: true, size: 32 })],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 }
                }),

                new Paragraph({ text: "", spacing: { after: 300 } }), // Spacer

                new Paragraph({
                    children: [new TextRun({ text: "SURAT TANDA BUKTI PENCATATAN PEMAGANGAN", bold: true, size: 24, underline: {} })],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 }
                }),

                new Paragraph({
                    children: [new TextRun("Berdasarkan Peraturan Menteri Ketenagakerjaan RI, menerangkan bahwa:")],
                    spacing: { after: 200 }
                }),

                createLine("Nama Peserta", record.nama_pencaker),
                createLine("NIK", record.nik_pencaker),
                createLine("Tempat/Tgl Lahir", `${record.place_of_birth}, ${record.date_of_birth}`),
                createLine("Jenis Kelamin", record.gender === 'L' ? 'Laki-laki' : 'Perempuan'),
                createLine("Alamat", record.address || record.alamat_perusahaan),

                new Paragraph({ text: "", spacing: { after: 200 } }),

                new Paragraph({
                    children: [new TextRun("Telah tercatat sebagai Peserta Pemagangan di:")],
                    spacing: { after: 200 }
                }),

                createLine("Nama Perusahaan", companyName),
                createLine("Program/Bagian", record.division || '-'),
                createLine("Durasi", record.duration || '-'),
                createLine("Periode", `${record.tgl_mulai} s.d ${record.tgl_selesai}`),

                new Paragraph({ text: "", spacing: { after: 400 } }),

                new Paragraph({
                    children: [new TextRun("Demikian surat tanda bukti ini dibuat untuk dipergunakan sebagaimana mestinya.")],
                    spacing: { after: 400 }
                }),

                // TTD
                new Paragraph({
                    children: [new TextRun("Ditetapkan di: Cikarang Pusat")],
                    alignment: AlignmentType.RIGHT,
                }),
                new Paragraph({
                    children: [new TextRun(`Pada Tanggal: ${new Date().toLocaleDateString('id-ID')}`)],
                    alignment: AlignmentType.RIGHT,
                    spacing: { after: 200 }
                }),

                new Paragraph({
                    children: [new TextRun({ text: "KEPALA DINAS", bold: true })],
                    alignment: AlignmentType.RIGHT,
                    indent: { right: 400 } // indent
                }),
                new Paragraph({
                    children: [new TextRun({ text: "(Tanda Tangan Elektronik)", italics: true })],
                    alignment: AlignmentType.RIGHT,
                    spacing: { before: 800 },
                    indent: { right: 300 }
                }),
            ]
        }]
    })

    const buffer = await Packer.toBuffer(doc);

    return new NextResponse(buffer as any, {
        headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition': `attachment; filename="Surat_Pencatatan_${record.nama_pencaker}.docx"`,
        },
    })
}

function createLine(label: string, value: string) {
    return new Paragraph({
        children: [
            new TextRun({ text: label, bold: true }),
            new TextRun({ text: ": " + (value || '-') })
        ],
        spacing: { after: 100 },
        indent: { left: 720 } // 0.5 inch
    })
}
