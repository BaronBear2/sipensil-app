
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, TextRun, AlignmentType, BorderStyle } from 'docx'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id } = await params

    // 1. Auth & Data Fetch
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Check Access (User Owns OR Admin)
    // For simplicity, we check if user owns it OR if user is admin.
    // Fetch user profile to check role
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const isAdmin = profile?.role?.includes('ADMIN') || profile?.role === 'SUPER_ADMIN' || profile?.role === 'DINAS' // Adjust based on your role naming

    const query = supabase.from('lpk_reports').select('*').eq('id', id)
    if (!isAdmin) {
        query.eq('user_id', user.id)
    }
    const { data: report, error } = await query.single()

    if (error || !report) return NextResponse.json({ error: 'Report not found or access denied' }, { status: 404 })

    // 2. Generate DOCX
    const doc = new Document({
        sections: [{
            properties: {},
            children: [
                new Paragraph({
                    children: [new TextRun({ text: "LAPORAN PERIODIK LEMBAGA PELATIHAN KERJA", bold: true, size: 28 })],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 200 }
                }),
                new Paragraph({
                    children: [new TextRun({ text: `Semester: ${report.semester} | Tahun: ${report.tahun}`, size: 24 })],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 }
                }),

                // DATA UMUM
                createHeading("Data Umum"),
                createKeyValue("Nama LPK", report.nama_lpk),
                createKeyValue("No. VIN/Reg", report.no_reg),
                new Paragraph({ spacing: { after: 200 } }),

                // A. STATUS AKREDITASI
                createHeading("A. Status Akreditasi"),
                createKeyValue("No. SK", report.data_akreditasi?.no_sk || '-'),
                createKeyValue("Ruang Lingkup", report.data_akreditasi?.ruang_lingkup || '-'),
                new Paragraph({ spacing: { after: 200 } }),

                // B. KARYAWAN (Simplified Table)
                createHeading("B. Data Karyawan (Instruktur & Tenaga Pelatih)"),
                createKaryawanTable(report.data_karyawan),
                new Paragraph({ spacing: { after: 200 } }),

                // C. PENGEMBANGAN PROGRAM
                createHeading("C. Pengembangan Program Pelatihan"),
                createDynamicTable(report.data_pengembangan_program, ["Program", "Inisiator", "Durasi", "Standar", "Keterangan"], ["nama", "inisiator", "durasi", "standar", "ket"]),
                new Paragraph({ spacing: { after: 200 } }),

                // D. PENYELENGGARAAN
                createHeading("D. Penyelenggaraan Pelatihan"),
                createDynamicTable(report.data_penyelenggaraan, ["Program", "Jadwal", "Peserta", "Lulusan", "Keterangan"], ["nama", "jadwal", "peserta", "lulusan", "ket"]),
                new Paragraph({ spacing: { after: 200 } }),

                // E. UJI KOMPETENSI
                createHeading("E. Uji Kompetensi"),
                createDynamicTable(report.data_uji_kompetensi, ["LSP", "Skema", "Jadwal", "Peserta", "Kompeten", "Ket"], ["lsp", "skema", "jadwal", "peserta", "kompeten", "ket"]),
                new Paragraph({ spacing: { after: 200 } }),

                // F. KERJASAMA MITRA
                createHeading("F. Kerjasama Mitra"),
                createDynamicTable(report.data_mitra, ["Mitra", "Alamat", "Bentuk Kerjasama"], ["nama", "alamat", "bentuk"]),
                new Paragraph({ spacing: { after: 200 } }),

                // G. KENDALA
                createHeading("G. Kendala & Solusi"),
                createDynamicTable(report.data_kendala, ["Masalah", "Solusi", "Keterangan"], ["masalah", "solusi", "ket"]),
            ],
        }],
    });

    const buffer = await Packer.toBuffer(doc);

    return new NextResponse(buffer as any, {
        headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition': `attachment; filename="Laporan_LPK_${report.semester}_${report.tahun}.docx"`,
        },
    })
}

// HELPERS
function createHeading(text: string) {
    return new Paragraph({
        children: [new TextRun({ text, bold: true, size: 24 })],
        spacing: { before: 200, after: 100 }
    })
}

function createKeyValue(key: string, value: string) {
    return new Paragraph({
        children: [
            new TextRun({ text: `${key}: `, bold: true }),
            new TextRun({ text: value || '-' })
        ]
    })
}

function createDynamicTable(data: any[], headers: string[], keys: string[]) {
    if (!data || data.length === 0) return new Paragraph({ text: "(Tidak ada data)" })

    const headerRow = new TableRow({
        children: headers.map(h => new TableCell({
            children: [new Paragraph({ text: h, alignment: AlignmentType.CENTER })],
            shading: { fill: "EEEEEE" },
            verticalAlign: AlignmentType.CENTER,
        })),
    })

    const rows = data.map(item => new TableRow({
        children: keys.map(k => new TableCell({
            children: [new Paragraph({ text: String(item[k] || '-') })],
        }))
    }))

    return new Table({
        rows: [headerRow, ...rows],
        width: { size: 100, type: WidthType.PERCENTAGE },
    })
}

function createKaryawanTable(data: any) {
    if (!data) return new Paragraph({ text: "-" })

    // Simple summary table
    return new Table({
        rows: [
            new TableRow({
                children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Kategori", bold: true })] })], shading: { fill: "EEEEEE" } }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Laki-laki", bold: true })] })], shading: { fill: "EEEEEE" } }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Perempuan", bold: true })] })], shading: { fill: "EEEEEE" } }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Total", bold: true })] })], shading: { fill: "EEEEEE" } }),
                ]
            }),
            ...['pelatih_tetap', 'pelatih_tidak_tetap', 'instruktur_tetap', 'instruktur_tidak_tetap', 'asesor', 'berwenang'].map(key => {
                const l = Number(data.laki?.[key] || 0)
                const p = Number(data.perempuan?.[key] || 0)
                return new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph({ text: key.replace(/_/g, ' ').toUpperCase() })] }),
                        new TableCell({ children: [new Paragraph({ text: l.toString() })] }),
                        new TableCell({ children: [new Paragraph({ text: p.toString() })] }),
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: (l + p).toString(), bold: true })] })] }),
                    ]
                })
            })
        ],
        width: { size: 100, type: WidthType.PERCENTAGE }
    })
}
