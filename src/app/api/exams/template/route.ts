import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';

export async function GET() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'LMS EduSpace CBT System';
  const worksheet = workbook.addWorksheet('Template Soal CBT');

  worksheet.views = [{ showGridLines: true }];

  // Setup Kolom
  worksheet.columns = [
    { header: 'No', key: 'no', width: 6 },
    { header: 'Pertanyaan / Soal (Mendukung Teks, KaTeX $...$, & Arab)', key: 'question', width: 45 },
    { header: 'URL Gambar Soal (Opsional)', key: 'imageUrl', width: 28 },
    { header: 'Pilihan A', key: 'optionA', width: 22 },
    { header: 'Pilihan B', key: 'optionB', width: 22 },
    { header: 'Pilihan C', key: 'optionC', width: 22 },
    { header: 'Pilihan D', key: 'optionD', width: 22 },
    { header: 'Pilihan E (Opsional)', key: 'optionE', width: 22 },
    { header: 'Kunci (A/B/C/D/E)', key: 'key', width: 15 },
  ];

  // Style Header Row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.height = 28;

  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4F46E5' }, // Indigo-600
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' },
    };
  });

  // Contoh Soal 1: Umum / Kejuruan
  worksheet.addRow({
    no: 1,
    question: 'Komponen mesin yang berfungsi untuk mengubah gerak naik turun piston menjadi gerak putar adalah...',
    imageUrl: '',
    optionA: 'Crankshaft (Poros Engkol)',
    optionB: 'Camshaft (Poros Bubungan)',
    optionC: 'Connecting Rod (Batang Piston)',
    optionD: 'Flywheel (Roda Gila)',
    optionE: 'Cylinder Block',
    key: 'A',
  });

  // Contoh Soal 2: Soal Bergambar
  worksheet.addRow({
    no: 2,
    question: 'Perhatikan diagram kelistrikan di bawah ini. Komponen yang ditunjukkan oleh huruf X berfungsi sebagai...',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
    optionA: 'Sekring (Fuse pengaman)',
    optionB: 'Relay pemutus arus',
    optionC: 'Resistor beban',
    optionD: 'Kapasitor penyimpan muatan',
    optionE: 'Alternator pembangkit',
    key: 'B',
  });

  // Contoh Soal 3: Matematika dengan Rumus KaTeX ($...$)
  worksheet.addRow({
    no: 3,
    question: 'Tentukan turunan pertama dari fungsi kuadrat $f(x) = 3x^2 + 8x - 5$. Nilai dari $f\'(2)$ adalah...',
    imageUrl: '',
    optionA: '$20$',
    optionB: '$14$',
    optionC: '$24$',
    optionD: '$18$',
    optionE: '$16$',
    key: 'A',
  });

  // Contoh Soal 4: Bahasa Arab (RTL)
  worksheet.addRow({
    no: 4,
    question: 'Perhatikan kalimat hikmah berikut: مَنْ جَدَّ وَجَدَ . Terjemahan yang tepat untuk peribahasa tersebut adalah...',
    imageUrl: '',
    optionA: 'Barang siapa yang bersabar maka ia akan beruntung',
    optionB: 'Barang siapa yang bersungguh-sungguh maka ia akan berhasil',
    optionC: 'Ilmu itu lebih utama daripada harta benda',
    optionD: 'Waktu laksana pedang yang tajam',
    optionE: 'Kejujuran membawa kepada ketenangan hati',
    key: 'B',
  });

  // Contoh Soal 5: Rumus Matematika Pecahan & Akar KaTeX
  worksheet.addRow({
    no: 5,
    question: 'Akar-akar penyelesaian dari persamaan kuadrat $ax^2 + bx + c = 0$ dapat dihitung menggunakan rumus $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$. Jika $b^2 - 4ac > 0$, maka sifat akarnya adalah...',
    imageUrl: '',
    optionA: 'Dua akar real berlainan',
    optionB: 'Dua akar real kembar',
    optionC: 'Akar imajiner / tidak real',
    optionD: 'Akar bernilai nol',
    optionE: 'Akar tidak terdefinisi',
    key: 'A',
  });

  // Berikan border tipis pada semua cell contoh
  for (let r = 2; r <= 6; r++) {
    const row = worksheet.getRow(r);
    row.height = 24;
    row.eachCell((cell, colNumber) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      };
      cell.font = { name: 'Arial', size: 9.5 };
      if (colNumber === 1 || colNumber === 9) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      }
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="Template_Soal_Ujian_CBT.xlsx"',
    },
  });
}
