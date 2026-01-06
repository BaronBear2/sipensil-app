import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, { params }: { params: Promise<{ type: string }> }) {
    const supabase = await createClient()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const resolvedParams = await params
    const type = resolvedParams.type

    if (!id) return NextResponse.json({ error: 'ID Required' }, { status: 400 })

    // 1. GENERATE LPK REPORT
    if (type === 'lpk-report') {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        console.log('GENERATE WORD DEBUG:', { id, type, user: user?.id, userError })

        const { data: rawReport, error: fetchError } = await supabase
            .from('lpk_reports')
            .select(`
                *,
                profiles (
                   *,
                   profile_lpk (*)
                )
            `)
            .eq('id', id)
            .single()

        if (fetchError) console.error('GENERATE WORD FETCH ERROR:', fetchError)

        if (!rawReport) return NextResponse.json({ error: 'Report not found', details: fetchError }, { status: 404 })

        const report: any = rawReport
        // Map data_karyawan to karyawan if needed for the template
        if (!report.karyawan && report.data_karyawan) {
            report.karyawan = report.data_karyawan
        }

        // Extract Profile Data safely
        const profile = report.profiles || {}
        // profile_lpk is usually an object if 1:1, but verify if array
        const lpkProfile = Array.isArray(profile.profile_lpk) ? profile.profile_lpk[0] : (profile.profile_lpk || {})

        // Use LPK Profile data if available, fallback to Profile data
        // Fix: Use correct column names from schema (address_office, email_official)
        const address = lpkProfile.address_office || profile.address_office || '-'
        const phone = lpkProfile.phone || profile.phone || '-'
        const email = lpkProfile.email_official || profile.email_official || '-'

        // Logic to prepare dynamic data from Supabase
        const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
        const semesterText = report.semester === '1' || report.semester === 'Ganjil' ? 'Januari s/d Juni' : 'Juli s/d Desember'

        // Helper accessors
        const r = report
        const akreditasi = r.data_akreditasi || { no_sk: '-', ruang_lingkup: '-' }
        const tuk = r.data_tuk || { kejuruan: '', skema: '', kapasitas: '', lsp_lisensi: '' }
        const karyawan = r.data_karyawan || {
            laki: { pelatih_tetap: 0, pelatih_tidak_tetap: 0, instruktur_tetap: 0, instruktur_tidak_tetap: 0, asesor: 0, berwenang: 0 },
            perempuan: { pelatih_tetap: 0, pelatih_tidak_tetap: 0, instruktur_tetap: 0, instruktur_tidak_tetap: 0, asesor: 0, berwenang: 0 },
            ket: { pelatih_tetap: '', pelatih_tidak_tetap: '', instruktur_tetap: '', instruktur_tidak_tetap: '', asesor: '', berwenang: '' }
        }

        // Data Umum Mappings (Fallback to Profile LPK)
        const noIzin = report.no_izin || lpkProfile.license_number || '-'
        const tglIzin = lpkProfile.license_date ? new Date(lpkProfile.license_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'
        const jenisLpk = report.jenis_lpk || lpkProfile.lpk_type || '-'
        const kepalaLpk = report.kepala_lpk || lpkProfile.director_name || '-'
        const telpKepala = report.telp_kepala || lpkProfile.director_phone || '-'

        // NEW: Operational PJ Mappings
        const pjName = report.penanggung_jawab || lpkProfile.operational_pj || profile.full_name || '-'
        const jabatanPj = report.jabatan || lpkProfile.operational_pj_title || 'Penanggung Jawab'
        const telpPj = lpkProfile.operational_pj_phone || '-'

        const htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
            <meta charset='utf-8'>
            <title>Laporan LPK ${report.nama_lpk}</title>
            <style>
                body { font-family: "Arial", sans-serif; font-size: 11pt; line-height: 1.15; color: black; }
                table { border-collapse: collapse; width: 100%; vertical-align: top; margin-bottom: 10px; }
                td { vertical-align: top; padding: 2px; }
                .bordered td, .bordered th { border: 1px solid black; padding: 5px; font-size: 12pt; }
                .center { text-align: center; }
                .bold { font-weight: bold; }
                .underline { text-decoration: underline; }
                .header-table td { font-size: 11pt; line-height: 1.3; }
            </style>
        </head>
        <body>
        
            <div class="center bold" style="font-size: 14pt;">
                ${report.nama_lpk.toUpperCase()}
            </div>
            <br/><br/><br/>
        
            <table class="header-table" style="border: none;">
                <tr>
                    <td width="12%"></td>
                    <td width="2%"></td>
                    <td width="41%"></td>
                    <td width="45%" style="text-align: left;">Bekasi, ${today}</td>
                </tr>
                <tr>
                    <td>Nomor</td>
                    <td>:</td>
                    <td>(Nomor surat LPK)</td>
                    <td class="bold">Kepada</td>
                </tr>
                <tr>
                    <td>Sifat</td>
                    <td>:</td>
                    <td>Biasa</td>
                    <td class="bold">Yth,</td>
                </tr>
                <tr>
                    <td>Lampiran</td>
                    <td>:</td>
                    <td>-</td>
                    <td class="bold">Kepala Dinas Ketenagakerjaan Kabupaten Bekasi</td>
                </tr>
                <tr>
                    <td>Perihal</td>
                    <td>:</td>
                    <td class="bold">Laporan Kegiatan ${report.nama_lpk}<br/>Periode 6 Bulan (${semesterText})</td>
                    <td>di -</td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td style="padding-left: 40px;" class="bold">T E M P A T</td>
                </tr>
            </table>
        
            <br/><br/>
        
            <p>Dengan Hormat,</p>
            <p style="text-align: justify;">Bersama Surat ini kami laporkan kepada bapak/ibu Kepala Dinas Ketenagakejaan Kabupaten Bekasi, Perihal pelaporan kegiatan ${report.nama_lpk} Periode 6 Bulan ( ${semesterText} ) dengan program kejuruan/program pelatihan sebagai berikut :</p>
            
            <ol style="margin-left: 40px;">
                ${(report.data_penyelenggaraan || []).map((prog: any) => `<li>${prog.nama || prog.nama_program}</li>`).join('')}
            </ol>
        
            <p>Demikian laporan kami, atas kerjasamanya kami ucapkan terima kasih.</p>
        
            <br/>
        
            <table style="border: none;">
                <tr>
                    <td width="60%"></td>
                    <td width="40%" class="center">
                        ${report.nama_lpk}<br/><br/><br/><br/><br/>
                        <span class="bold">(${pjName})</span><br/>
                        ${jabatanPj}
                    </td>
                </tr>
            </table>
        
            <br style="page-break-before: always;"/>
        
            <div class="center bold" style="font-size: 12pt;">
                LAPORAN KEGIATAN LEMBAGA PELATIHAN KERJA<br/>
                Laporan Semester/Tahun : ${report.semester} / ${report.tahun}
            </div>
        
            <p class="bold">A. Data Umum</p>
            <table class="bordered">
                <tr><td width="5%">1.</td><td width="35%">Nama LPK</td><td colspan="4">${report.nama_lpk}</td></tr>
                <tr><td>2.</td><td>Nomor Registrasi</td><td colspan="4">${report.no_reg}</td></tr>
                <tr>
                    <td>3.</td>
                    <td>Alamat :<br/>a. Kantor<br/>b. Telp/Fax<br/>c. E-mail</td>
                    <td colspan="4"><br/>${address}<br/>${phone}<br/>${email}</td>
                </tr>
                <tr>
                    <td>4.</td>
                    <td>Nomor/Tanggal Izin atau Tanda Daftar LPK/ Sertifikat Standar</td>
                    <td colspan="4">${noIzin}<br/>${tglIzin}</td>
                </tr>
                <tr><td>5.</td><td>Jenis LPK</td><td colspan="4">${jenisLpk}</td></tr>
                <tr>
                    <td>6.</td>
                    <td>Nama Kepala/Direktur LPK<br/>Nomor telephone</td>
                    <td colspan="4">${kepalaLpk}<br/>${telpKepala}</td>
                </tr>
                <tr>
                    <td>7.</td>
                    <td>Nama Penanggungjawab operasional LPK<br/>Jabatan<br/>Nomor telephone</td>
                    <td colspan="4">${pjName}<br/>${jabatanPj}<br/>${telpPj}</td>
                </tr>
                <tr>
                    <td>8.</td>
                    <td>Status Akreditasi <br/> Nomor SK Akreditasi</td>
                    <td colspan="4">${akreditasi.no_sk ? 'Terakreditasi' : 'Belum Terakreditasi'} <br/> ${akreditasi.no_sk || '-'}</td>
                </tr>
                <tr>
                    <td>9.</td>
                    <td>Ruang lingkup LPK (Program kegiatan dan pelatihan yang ditawarkan)</td>
                    <td colspan="4">${akreditasi.ruang_lingkup || '-'}</td>
                </tr>
                <tr class="center bold">
                    <td rowspan="2">10.</td>
                    <td rowspan="2">Jumlah karyawan</td>
                    <td rowspan="2">Laki-laki</td>
                    <td rowspan="2">Perempuan</td>
                    <td colspan="2" rowspan="2">Keterangan</td>
                </tr>
                <tr></tr>
                <tr><td></td><td>a. Tenaga pelatihan tetap</td><td>${karyawan.laki?.pelatih_tetap || 0}</td><td>${karyawan.perempuan?.pelatih_tetap || 0}</td><td colspan="2">${karyawan.ket?.pelatih_tetap || ''}</td></tr>
                <tr><td></td><td>b. Tenaga pelatihan tidak tetap</td><td>${karyawan.laki?.pelatih_tidak_tetap || 0}</td><td>${karyawan.perempuan?.pelatih_tidak_tetap || 0}</td><td colspan="2">${karyawan.ket?.pelatih_tidak_tetap || ''}</td></tr>
                <tr><td></td><td>c. Instruktur tetap</td><td>${karyawan.laki?.instruktur_tetap || 0}</td><td>${karyawan.perempuan?.instruktur_tetap || 0}</td><td colspan="2">${karyawan.ket?.instruktur_tetap || ''}</td></tr>
                <tr><td></td><td>d. Instruktur tidak tetap</td><td>${karyawan.laki?.instruktur_tidak_tetap || 0}</td><td>${karyawan.perempuan?.instruktur_tidak_tetap || 0}</td><td colspan="2">${karyawan.ket?.instruktur_tidak_tetap || ''}</td></tr>
                <tr><td></td><td>e. Asesor kompetensi</td><td>${karyawan.laki?.asesor || 0}</td><td>${karyawan.perempuan?.asesor || 0}</td><td colspan="2">${karyawan.ket?.asesor || ''}</td></tr>
                <tr><td></td><td>f. Instruktur/asesor yang berkewenangan</td><td>${karyawan.laki?.berwenang || 0}</td><td>${karyawan.perempuan?.berwenang || 0}</td><td colspan="2">${karyawan.ket?.berwenang || ''}</td></tr>
            </table>
        
            <p class="bold">B. Kegiatan Pengembangan Program Pelatihan</p>
            <table class="bordered">
                <tr class="center bold">
                    <td>No.</td><td>Nama Program</td><td>Inisiator / Pemohon</td><td>Durasi Pelatihan (JP)</td><td>Standar Kompetensi</td><td>Keterangan</td>
                </tr>
                ${renderRows(report.data_pengembangan_program || report.data_pengembangan, 6)}
            </table>
        
            <p class="bold">C. Kegiatan Penyelenggaraan Pelatihan</p>
            <table class="bordered">
                <tr class="center bold">
                    <td>No.</td><td>Nama Program</td><td>Jadwal Pelaksanaan</td><td>Jumlah Peserta</td><td>Jumlah Lulusan</td><td>Keterangan</td>
                </tr>
                ${renderRows(report.data_penyelenggaraan, 6)}
            </table>
        
            <p class="bold">Sebagai TUK</p>
            <table class="bordered">
                <tr class="center bold">
                    <td>1</td><td>Kejuruan</td><td>Skema Sertifikasi</td><td>Kapasitas</td><td>LSP</td>
                </tr>
                <tr>
                    <td height="20">1</td>
                    <td>${tuk.kejuruan || '-'}</td>
                    <td>${tuk.skema || '-'}</td>
                    <td>${tuk.kapasitas || '-'}</td>
                    <td>${tuk.lsp_lisensi || '-'}</td>
                </tr>
            </table>

        
            <p class="bold">D. Kegiatan Penyelenggaraan Uji Kompetensi</p>
            <table class="bordered">
                <tr class="center bold">
                    <td>No.</td><td>Nama LSP</td><td>Skema Sertifikasi</td><td>Jadwal Pelaksanaan</td><td>Jumlah Peserta Uji</td><td>Jumlah yang Dinyataka Kompeten</td><td>Keterangan</td>
                </tr>
                ${renderRows(report.data_uji_kompetensi, 7)}
            </table>
        
            <p class="bold">E. Kegiatan Pengembangan Kelembagaan dan SDM LPK</p>
            <table class="bordered">
                <tr class="center bold">
                    <td>No.</td><td>Nama Kegiatan</td><td>Jadwal</td><td>Lokasi</td><td>Penyelenggara</td><td>Keterangan</td>
                </tr>
                ${renderRows(report.data_pengembangan_kelembagaan, 6)}
            </table>
        
            <p class="bold">F. Kegiatan/Kerjasama dengan Stake Holder Terkait</p>
            <table class="bordered">
                <tr class="center bold">
                    <td>No.</td><td>Nama Mitra</td><td>Alamat</td><td>Bentuk Kemitraan</td>
                </tr>
                ${renderRows(report.data_mitra || report.data_kerjasama, 4)}
            </table>
        
            <p class="bold">G. Kendala yang Dihadapi dan Solusi yang Dilakikan</p>
            <table class="bordered">
                <tr class="center bold">
                    <td>No.</td><td>Kendala</td><td>Solusi</td><td>Keterangan</td>
                </tr>
                ${renderRows(report.data_kendala, 4)}
            </table>
        
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

// Helper to render empty rows if no data exists
function renderRows(data: any[], columnCount: number) {
    if (!data || !Array.isArray(data) || data.length === 0) {
        return `<tr>${Array(columnCount).fill('<td>&nbsp;</td>').join('')}</tr>`
    }
    return data.map((row: any, i: number) => `
        <tr>
            <td>${i + 1}</td>
            ${Object.values(row).slice(0, columnCount - 1).map((val: any) => `<td>${val || ''}</td>`).join('')}
        </tr>
    `).join('')
}
