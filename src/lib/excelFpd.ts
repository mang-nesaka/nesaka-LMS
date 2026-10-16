import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';

function parseCSVLine(text: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (inQuotes && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      result.push(cur);
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur);
  return result;
}

// Baca template mentah
const rawTemplatePath = path.join(process.cwd(), 'src/lib/template_fpd.raw.csv');
const rawTemplate = fs.readFileSync(rawTemplatePath, 'utf8');
const templateRows = rawTemplate.split(/\r?\n/).map(parseCSVLine);

export function buildExactFpdGrid(r: any, programTitle?: string): string[][] {
  // Deep clone matrix template (127 baris x 43 kolom)
  const grid: string[][] = templateRows.map(row => [...row]);

  // Tanggal submit
  const now = r.createdAt ? new Date(r.createdAt) : new Date();
  const d = String(now.getDate()).padStart(2, '0');
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const y = String(now.getFullYear());

  // Row 3 (Index 2): Tanggal & Reg
  if (grid[2]) {
    grid[2][4] = d;
    grid[2][7] = m;
    grid[2][10] = y;
    // REG digits: d[0], d[1], '/', m[0], m[1], '/', y[0], y[1], y[2], y[3]
    const regDigits = [d[0], d[1], '/', m[0], m[1], '/', y[0], y[1], y[2], y[3]];
    regDigits.forEach((char, idx) => {
      if (grid[2][33 + idx] !== undefined) grid[2][33 + idx] = char;
    });
  }

  // Row 5 (Index 4): Program
  if (grid[4]) {
    grid[4][19] = programTitle || 'Teknik Otomotif';
  }

  // Row 9 (Index 8): Nama Lengkap
  if (grid[8]) grid[8][11] = r.namaLengkap || '';

  // Row 11 (Index 10): Jenis Kelamin
  if (grid[10]) grid[10][11] = r.jenisKelamin || '';

  // Row 13 (Index 12): NISN & NIS
  if (grid[12]) {
    const nisnStr = (r.nisn || '').replace(/\D/g, '').padEnd(10, ' ');
    for (let i = 0; i < 10; i++) {
      grid[12][11 + i] = nisnStr[i] !== ' ' ? nisnStr[i] : '';
    }
    const nisStr = (r.nis || '').replace(/\D/g, '').padEnd(9, ' ');
    for (let i = 0; i < 9; i++) {
      grid[12][27 + i] = nisStr[i] !== ' ' ? nisStr[i] : '';
    }
  }

  // Row 15 (Index 14): No Seri Ijazah
  if (grid[14]) grid[14][11] = r.noIjazah || '';

  // Row 17 (Index 16): No Ujian SMP
  if (grid[16]) grid[16][11] = r.noUjian || '';

  // Row 19 (Index 18): NIK
  if (grid[18]) grid[18][11] = r.nik || '';

  // Row 20 (Index 19): NPSN Sekolah Asal
  if (grid[19]) grid[19][11] = r.npsnAsal || '';

  // Row 21 (Index 20): Nama Sekolah Asal
  if (grid[20]) grid[20][11] = r.sekolahAsal || '';

  // Row 22 (Index 21): Tempat, Tanggal Lahir
  if (grid[21]) {
    grid[21][11] = r.tempatLahir || '';
    if (r.tanggalLahir) {
      // Misal format YYYY-MM-DD atau DD/MM/YYYY
      const parts = r.tanggalLahir.split(/[-/]/);
      let tD = '01', tM = '01', tY = '2009';
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          tY = parts[0]; tM = parts[1].padStart(2, '0'); tD = parts[2].padStart(2, '0');
        } else {
          tD = parts[0].padStart(2, '0'); tM = parts[1].padStart(2, '0'); tY = parts[2];
        }
      }
      grid[21][32] = tD[0]; grid[21][33] = tD[1];
      grid[21][35] = tM[0]; grid[21][36] = tM[1];
      grid[21][38] = tY[0]; grid[21][39] = tY[1]; grid[21][40] = tY[2]; grid[21][41] = tY[3];
    }
  }

  // Row 24 (Index 23): Agama
  if (grid[23]) grid[23][11] = r.agama || '';

  // Row 26 (Index 25): Berkebutuhan Khusus
  if (grid[25]) grid[25][11] = r.berkebutuhanKhusus || 'Tidak ada';

  // Row 28 (Index 27): Alamat
  if (grid[27]) grid[27][11] = r.alamat || '';

  // Row 30 (Index 29): Dusun, RT, RW
  if (grid[29]) {
    grid[29][11] = r.dusun || '';
    if (r.rtRw) {
      const parts = r.rtRw.split(/[/,-]/);
      if (parts[0]) grid[29][34] = parts[0].trim();
      if (parts[1]) grid[29][38] = parts[1].trim();
    }
  }

  // Row 32 (Index 31): Kelurahan / Desa & Kode Pos
  if (grid[31]) {
    grid[31][11] = r.kelurahan || '';
    grid[31][36] = r.kodePos || '';
  }

  // Row 34 (Index 33): Kecamatan
  if (grid[33]) grid[33][11] = r.kecamatan || '';

  // Row 36 (Index 35): Kabupaten / Kota
  if (grid[35]) grid[35][11] = r.kabupaten || '';

  // Row 38 (Index 37): Propinsi
  if (grid[37]) grid[37][11] = r.propinsi || '';

  // Row 40 (Index 39): Transportasi
  if (grid[39]) grid[39][11] = r.transportasi || '';

  // Row 42 (Index 41): Jenis Tinggal
  if (grid[41]) grid[41][11] = r.jenisTinggal || '';

  // Row 44 (Index 43): No Telepon & No HP
  if (grid[43]) {
    grid[43][11] = r.noTelp || '';
    grid[43][27] = r.noHp || '';
  }

  // Row 46 (Index 45): Email Pribadi
  if (grid[45]) grid[45][11] = r.emailPribadi || r.student?.email || '';

  // Row 48 (Index 47): No. KKS
  if (grid[47]) grid[47][11] = r.noKks || '';

  // Row 50 (Index 49): KPS / PKH
  if (grid[49]) {
    grid[49][11] = r.penerimaKps || 'Tidak';
  }

  // Row 52 (Index 51): PIP
  if (grid[51]) {
    grid[51][11] = r.usulanPip || 'Tidak';
  }

  // Row 53 (Index 52): KIP
  if (grid[52]) {
    grid[52][11] = r.penerimaKip || 'Tidak';
    grid[52][18] = r.noKip || '';
  }

  // Row 54 (Index 53): Nama di KIP
  if (grid[53]) grid[53][11] = r.namaDiKip || '';

  // Row 55 (Index 54): Alasan Menolak KIP
  if (grid[54]) grid[54][11] = r.alasanTolakKip || '';

  // Row 56 (Index 55): No Registrasi Akta Lahir
  if (grid[55]) grid[55][11] = r.noAktaLahir || '';

  // Row 57 (Index 56): Lintang
  if (grid[56]) grid[56][11] = r.lintang || '';

  // Row 58 (Index 57): Bujur
  if (grid[57]) grid[57][11] = r.bujur || '';

  // DATA AYAH
  // Row 60 (Index 59): Nama Ayah & Tahun Lahir
  if (grid[59]) {
    grid[59][11] = r.namaAyah || '';
    grid[59][39] = r.tahunLahirAyah || '';
  }
  // Row 61 (Index 60): Kebutuhan Ayah
  if (grid[60]) grid[60][11] = r.kebutuhanAyah || 'Tidak ada';
  // Row 63 (Index 62): Pekerjaan Ayah
  if (grid[62]) grid[62][11] = r.pekerjaanAyah || '';
  // Row 64 (Index 63): Pendidikan Ayah
  if (grid[63]) grid[63][11] = r.pendidikanAyah || '';
  // Row 66 (Index 65): Penghasilan Ayah
  if (grid[65]) grid[65][11] = r.penghasilanAyah || '';

  // DATA IBU
  // Row 70 (Index 69): Nama Ibu & Tahun Lahir
  if (grid[69]) {
    grid[69][11] = r.namaIbu || '';
    const tIbu = String(r.tahunLahirIbu || '').padEnd(4, ' ');
    if (tIbu.trim()) {
      grid[69][39] = tIbu[0]; grid[69][40] = tIbu[1]; grid[69][41] = tIbu[2]; grid[69][42] = tIbu[3];
    }
  }
  // Row 72 (Index 71): Kebutuhan Ibu
  if (grid[71]) grid[71][11] = r.kebutuhanIbu || 'Tidak ada';
  // Row 74 (Index 73): Pekerjaan Ibu
  if (grid[73]) grid[73][11] = r.pekerjaanIbu || '';
  // Row 76 (Index 75): Pendidikan Ibu
  if (grid[75]) grid[75][11] = r.pendidikanIbu || '';
  // Row 78 (Index 77): Penghasilan Ibu
  if (grid[77]) grid[77][11] = r.penghasilanIbu || '';

  // DATA WALI
  // Row 82 (Index 81): Nama Wali & Tahun Lahir
  if (grid[81]) {
    grid[81][11] = r.namaWali || '';
    grid[81][39] = r.tahunLahirWali || '';
  }
  // Row 84 (Index 83): Pekerjaan Wali
  if (grid[83]) grid[83][11] = r.pekerjaanWali || '';
  // Row 86 (Index 85): Pendidikan Wali
  if (grid[85]) grid[85][11] = r.pendidikanWali || '';
  // Row 88 (Index 87): Penghasilan Wali
  if (grid[87]) grid[87][11] = r.penghasilanWali || '';

  // DATA PERIODIK
  // Row 92 (Index 91): Tinggi & Berat Badan
  if (grid[91]) {
    const tb = String(r.tinggiBadan || '').replace(/\D/g, '').padStart(3, ' ');
    grid[91][13] = tb[0]; grid[91][14] = tb[1]; grid[91][15] = tb[2];
    const bb = String(r.beratBadan || '').replace(/\D/g, '').padStart(2, ' ');
    grid[91][28] = bb[0]; grid[91][29] = bb[1];
  }
  // Row 94 (Index 93): Jarak Sekolah
  if (grid[93]) {
    grid[93][13] = r.jarakSekolah?.includes('Lebih') ? '2' : '1';
  }
  // Row 96 (Index 95): Waktu Tempuh
  if (grid[95]) {
    const wt = String(r.waktuTempuh || '').replace(/\D/g, '').padStart(2, '0');
    grid[95][34] = wt[0]; grid[95][35] = wt[1];
  }
  // Row 98 (Index 97): Jumlah Saudara
  if (grid[97]) grid[97][13] = String(r.jmlSaudara || '0');
  // Row 100 (Index 99): Anak Ke-
  if (grid[99]) grid[99][13] = String(r.anakKe || '1');
  // Row 102 (Index 101): Cita-cita
  if (grid[101]) grid[101][13] = r.citaCita || '';
  // Row 104 (Index 103): Hobi
  if (grid[103]) grid[103][13] = r.hobi || '';
  // Row 106 (Index 105): Pernah TK/Paud
  if (grid[105]) grid[105][13] = r.asalTkPaud || 'Ya';

  // Tanda Tangan
  // Row 125 (Index 124): Nama Siswa di tanda tangan
  if (grid[124]) {
    grid[124][32] = `( ${r.namaLengkap} )`;
  }

  return grid;
}

export function populateExactFpdWorksheet(worksheet: ExcelJS.Worksheet, r: any, programTitle?: string) {
  const grid = buildExactFpdGrid(r, programTitle);

  // Set default column widths for 43 columns
  worksheet.columns = Array.from({ length: 43 }).map((_, idx) => ({
    width: idx === 1 ? 25 : idx === 11 ? 28 : 4
  }));

  grid.forEach((rowValues) => {
    worksheet.addRow(rowValues);
  });
}
