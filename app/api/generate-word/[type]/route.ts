import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ type: string }> }) {
    const supabase = await createClient()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const resolvedParams = await params
    const type = resolvedParams.type

    if (!id) return NextResponse.json({ error: 'ID Required' }, { status: 400 })

    // 1. GENERATE LPK REPORT
    if (type === 'lpk-report') {
        const { data: report } = await supabase
            .from('lpk_reports')
            .select('*, profiles(company_name, address_office, phone, email_official)')
            .eq('id', id)
            .single()

        if (!report) return NextResponse.json({ error: 'Report not found' }, { status: 404 })

        const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Laporan LPK</title></head>
      <body style="font-family: Arial, sans-serif;">
        <h2 style="text-align: center;">LAPORAN PENYELENGGARAAN PELATIHAN KERJA</h2>
        <h3 style="text-align: center;">${report.nama_lpk}</h3>
        <p style="text-align: center;">Periode: ${report.semester} ${report.tahun}</p>
        <hr/>
        <br/>
        <h3>A. DATA UMUM</h3>
        <table border="1" cellpadding="5" cellspacing="0" width="100%">
            <tr><td width="30%">Nama LPK</td><td>${report.nama_lpk}</td></tr>
            <tr><td>No. Registrasi / VIN</td><td>${report.no_reg}</td></tr>
            <tr><td>Alamat</td><td>${report.profiles?.address_office || '-'}</td></tr>
            <tr><td>Email</td><td>${report.profiles?.email_official || '-'}</td></tr>
        </table>
        
        <h3>B. DATA KARYAWAN</h3>
        <p>Total Instruktur Tetap: ${report.data_karyawan?.instruktur_tetap_l + report.data_karyawan?.instruktur_tetap_p || 0}</p>
        <p>Total Peserta Latih: ${report.data_karyawan?.peserta_l + report.data_karyawan?.peserta_p || 0}</p>

        <h3>C. PENYELENGGARAAN PELATIHAN</h3>
        ${renderTable(report.data_penyelenggaraan, ['kode_program', 'nama_program', 'jml_peserta', 'jml_lulus'])}

        <br/><br/>
        <p style="text-align: right;">Bekasi, ${new Date().toLocaleDateString('id-ID')}</p>
        <p style="text-align: right;">Pimpinan LPK</p>
        <br/><br/>
        <p style="text-align: right;">(_________________)</p>
      </body>
      </html>
    `

        return new NextResponse(htmlContent, {
            headers: {
                'Content-Type': 'application/msword',
                'Content-Disposition': `attachment; filename="Laporan_LPK_${report.nama_lpk}_${report.semester}_${report.tahun}.doc"`
            }
        })
    }

    // 2. GENERATE MAGANG PERMIT (SK)
    if (type === 'magang-agreement') {
        const { data: permit } = await supabase
            .from('magang_permits')
            .select('*, profiles(company_name, address_office, nib)')
            .eq('id', id)
            .single()

        if (!permit) return NextResponse.json({ error: 'Permit not found' }, { status: 404 })

        const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Surat Pencatatan Pemagangan</title></head>
      <body style="font-family: Arial, sans-serif; line-height: 1.5;">
        <div style="text-align: center; font-weight: bold;">
            PEMERINTAH KABUPATEN BEKASI<br/>
            DINAS KETENAGAKERJAAN<br/>
            <span style="font-size: 12px; font-weight: normal;">Kompleks Perkantoran Pemerintah Kabupaten Bekasi, Cikarang Pusat</span>
        </div>
        <hr style="border-top: 3px double #000;"/>
        
        <h3 style="text-align: center; text-decoration: underline;">SURAT TANDA BUKTI PENCATATAN PERJANJIAN PEMAGANGAN</h3>
        <p style="text-align: center;">NOMOR: ${permit.letter_number || 'draft/2025'}</p>

        <p>Yang bertanda tangan di bawah ini Kepala Dinas Ketenagakerjaan Kabupaten Bekasi, menerangkan bahwa:</p>
        
        <table border="0" cellpadding="5" width="100%">
            <tr><td width="30%">Nama Perusahaan</td><td>: ${permit.profiles?.company_name}</td></tr>
            <tr><td>NIB</td><td>: ${permit.profiles?.nib || '-'}</td></tr>
            <tr><td>Alamat</td><td>: ${permit.profiles?.address_office || '-'}</td></tr>
        </table>

        <p>Telah mencatatkan Perjanjian Pemagangan Dalam Negeri dengan ketentuan sebagai berikut:</p>
        
        <table border="0" cellpadding="5" width="100%">
            <tr><td width="30%">Jumlah Peserta</td><td>: ${permit.participant_count} Orang</td></tr>
            <tr><td>Waktu Pelaksanaan</td><td>: ${new Date(permit.start_date).toLocaleDateString()} s/d ${new Date(permit.end_date).toLocaleDateString()}</td></tr>
        </table>

        <p>Demikian surat tanda bukti pencatatan ini dibuat untuk dipergunakan sebagaimana mestinya.</p>
        
        <br/><br/>
        <div style="float: right; text-align: center; width: 40%;">
            <p>Ditetapkan di: Cikarang Pusat</p>
            <p>Pada Tanggal: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <br/>
            <p>KEPALA DINAS KETENAGAKERJAAN</p>
            <p>KABUPATEN BEKASI</p>
            <br/><br/><br/>
            <p style="font-weight: bold; text-decoration: underline;">(NAMA KEPALA DINAS)</p>
            <p>NIP. 19xxxxxxxxxxxx</p>
        </div>
      </body>
      </html>
    `

        return new NextResponse(htmlContent, {
            headers: {
                'Content-Type': 'application/msword',
                'Content-Disposition': `attachment; filename="SK_Magang_${permit.profiles?.company_name}.doc"`
            }
        })
    }

    return NextResponse.json({ error: 'Invalid Type' }, { status: 400 })
}

// Helper simple render table
function renderTable(data: any[], keys: string[]) {
    if (!data || !Array.isArray(data) || data.length === 0) return '<p><i>Tidak ada data</i></p>'

    return `
    <table border="1" cellpadding="5" cellspacing="0" width="100%" style="border-collapse: collapse;">
        <thead style="background-color: #f0f0f0;">
            <tr>${keys.map(k => `<th>${k.toUpperCase().replace('_', ' ')}</th>`).join('')}</tr>
        </thead>
        <tbody>
            ${data.map(row => `<tr>${keys.map(k => `<td>${row[k] || '-'}</td>`).join('')}</tr>`).join('')}
        </tbody>
    </table>
    `
}
