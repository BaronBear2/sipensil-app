import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function generateParticipantListPDF(trainingTitle: string, stepName: string, passedUsers: any[]): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    let page = pdfDoc.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();
    let y = height - 50;

    page.drawText('PENGUMUMAN HASIL SELEKSI', { x: 50, y, size: 16, font: boldFont, color: rgb(0, 0, 0) });
    y -= 30;
    
    page.drawText(`Program Pelatihan: ${trainingTitle}`, { x: 50, y, size: 12, font });
    y -= 20;
    
    let stepText = 'Tahap: ';
    if (stepName === 'administrasi') stepText += 'Seleksi Administrasi';
    else if (stepName === 'seleksi_awal') stepText += 'Seleksi Awal (Wawancara)';
    else if (stepName === 'uji_kompetensi') stepText += 'Uji Kompetensi';
    else stepText += stepName;
    
    page.drawText(stepText, { x: 50, y, size: 12, font });
    y -= 30;

    page.drawText('Berikut adalah daftar peserta yang dinyatakan LULUS:', { x: 50, y, size: 12, font });
    y -= 30;

    if (passedUsers.length === 0) {
        page.drawText('- Belum ada peserta -', { x: 50, y, size: 12, font: font, color: rgb(0.5, 0.5, 0.5) });
    } else {
        passedUsers.forEach((u, i) => {
            if (y < 50) {
                page = pdfDoc.addPage([595.28, 841.89]);
                y = height - 50;
            }
            const name = u.profiles?.full_name || 'Tanpa Nama';
            page.drawText(`${i + 1}. ${name}`, { x: 50, y, size: 11, font });
            y -= 20;
        });
    }

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
}
