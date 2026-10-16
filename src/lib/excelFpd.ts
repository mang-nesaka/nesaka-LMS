import ExcelJS from 'exceljs';

const BORDER_BOX: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: 'FF000000' } },
  left: { style: 'thin', color: { argb: 'FF000000' } },
  bottom: { style: 'thin', color: { argb: 'FF000000' } },
  right: { style: 'thin', color: { argb: 'FF000000' } }
};

const BLUE_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FF0070C0' }
};

export function populateExactFpdWorksheet(worksheet: ExcelJS.Worksheet, r: any, programTitle?: string) {
  // Page setup agar ketika dicetak / di-export ke PDF pas dalam 1 halaman lebar (tidak terpotong ke samping)
  worksheet.pageSetup = {
    orientation: 'portrait',
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    paperSize: 9 // A4
  };

  worksheet.views = [{ showGridLines: true }];

  // Atur 43 kolom dengan lebar proporsional
  worksheet.columns = [
    { width: 3 },   // A (1)
    { width: 4 },   // B (2): Point (a., b., etc)
    { width: 4 },   // C (3)
    { width: 4 },   // D (4)
    { width: 4 },   // E (5)
    { width: 4 },   // F (6)
    { width: 4 },   // G (7)
    { width: 4 },   // H (8)
    { width: 4 },   // I (9)
    { width: 4 },   // J (10)
    { width: 3 },   // K (11): Titik dua ":"
    ...Array.from({ length: 32 }).map(() => ({ width: 3.5 })) // L to AQ (12 to 43)
  ];

  // Helper untuk membuat kotak digit tunggal
  const makeDigit = (row: number, col: number, char: string = '') => {
    const cell = worksheet.getCell(row, col);
    cell.value = char || '';
    cell.border = BORDER_BOX;
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.font = { name: 'Arial', size: 9, bold: true };
  };

  // Helper untuk membuat kotak input bergaris penuh (persegi panjang)
  const makeBox = (row: number, startCol: number, endCol: number, value: string = '', align: 'left' | 'center' = 'left') => {
    if (startCol === endCol) {
      makeDigit(row, startCol, value);
      return;
    }
    try {
      worksheet.mergeCells(row, startCol, row, endCol);
    } catch (e) {}

    const firstCell = worksheet.getCell(row, startCol);
    firstCell.value = value || '';
    firstCell.alignment = { horizontal: align, vertical: 'middle', indent: align === 'left' ? 1 : 0 };
    firstCell.font = { name: 'Arial', size: 9 };

    for (let c = startCol; c <= endCol; c++) {
      worksheet.getCell(row, c).border = BORDER_BOX;
    }
  };

  // Helper untuk banner biru seksi
  const makeBanner = (row: number, title: string) => {
    try {
      worksheet.mergeCells(row, 2, row, 43);
    } catch (e) {}

    const cell = worksheet.getCell(row, 2);
    cell.value = title;
    cell.alignment = { horizontal: 'right', vertical: 'middle' };
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF000000' } };

    for (let c = 2; c <= 43; c++) {
      const cur = worksheet.getCell(row, c);
      cur.fill = BLUE_FILL;
    }
  };

  const setLabel = (row: number, col: number, text: string, bold = false) => {
    const cell = worksheet.getCell(row, col);
    cell.value = text;
    cell.font = { name: 'Arial', size: 9, bold };
    cell.alignment = { vertical: 'middle' };
  };

  // 1. JUDUL ATAS
  worksheet.getCell('R1').value = 'FORMULIR PESERTA DIDIK';
  worksheet.getCell('R1').font = { name: 'Arial', size: 12, bold: true };
  worksheet.getCell('R1').alignment = { horizontal: 'center', vertical: 'middle' };

  makeBox(1, 38, 42, 'F-PD', 'center');
  worksheet.getCell(1, 38).font = { name: 'Arial', size: 11, bold: true };

  // 2. TANGGAL & REG (Row 3)
  setLabel(3, 2, 'Tanggal :');
  const now = r.createdAt ? new Date(r.createdAt) : new Date();
  const dStr = String(now.getDate()).padStart(2, '0');
  const mStr = String(now.getMonth() + 1).padStart(2, '0');
  const yStr = String(now.getFullYear());

  makeBox(3, 5, 7, dStr, 'center');
  setLabel(3, 8, '/', true);
  makeBox(3, 9, 11, mStr, 'center');
  setLabel(3, 12, '/', true);
  makeBox(3, 13, 16, yStr, 'center');

  setLabel(3, 27, 'REG  :');
  const regDigits = [dStr[0], dStr[1], '/', mStr[0], mStr[1], '/', yStr[0], yStr[1], yStr[2], yStr[3]];
  regDigits.forEach((char, idx) => {
    if (char === '/') {
      setLabel(3, 31 + idx, '/', true);
    } else {
      makeDigit(3, 31 + idx, char);
    }
  });

  // 3. TINGKAT & PROGRAM (Row 5)
  setLabel(5, 2, '-   Tingkat');
  setLabel(5, 11, ':');
  makeDigit(5, 12, '1');
  makeDigit(5, 13, '0');

  setLabel(5, 19, 'Program   :');
  makeBox(5, 24, 38, programTitle || 'Teknik Otomotif', 'left');

  // --- SEKSI 1: IDENTITAS PESERTA DIDIK ---
  makeBanner(7, 'IDENTITAS PESERTA DIDIK (WAJIB DI ISI)');

  // a. Nama Lengkap (Row 9)
  setLabel(9, 2, 'a.   Nama Lengkap');
  setLabel(9, 11, ':');
  makeBox(9, 12, 43, (r.namaLengkap || '').toUpperCase());

  // b. Jenis Kelamin (Row 11)
  setLabel(11, 2, 'b.   Jenis Kelamin');
  setLabel(11, 11, ':');
  makeBox(11, 12, 22, r.jenisKelamin || '');

  // c. NISN & NIS (Row 13)
  setLabel(13, 2, 'c.   NISN');
  setLabel(13, 11, ':');
  const nisn = (r.nisn || '').replace(/\D/g, '').padEnd(10, ' ');
  for (let i = 0; i < 10; i++) {
    makeDigit(13, 12 + i, nisn[i] !== ' ' ? nisn[i] : '');
  }
  setLabel(13, 24, 'NIS     :');
  const nis = (r.nis || '').replace(/\D/g, '').padEnd(9, ' ');
  for (let i = 0; i < 9; i++) {
    makeDigit(13, 28 + i, nis[i] !== ' ' ? nis[i] : '');
  }

  // e. No Seri Ijazah (Row 15)
  setLabel(15, 2, 'e.   NOMOR SERI IJAZAH');
  setLabel(15, 11, ':');
  makeBox(15, 12, 43, r.noIjazah || '');

  // f. No Ujian Sekolah (Row 17)
  setLabel(17, 2, 'f.    No. Ujian Sekolah Kelas 9');
  setLabel(17, 11, ':');
  makeBox(17, 12, 43, r.noUjian || '');

  // g. NIK (Row 19)
  setLabel(19, 2, 'g.   No.Induk Kependudukan(NIK)');
  setLabel(19, 11, ':');
  makeBox(19, 12, 43, r.nik || '');

  // NPSN Sekolah Asal (Row 20)
  setLabel(20, 3, 'NPSN Sekolah Asal');
  setLabel(20, 11, ':');
  makeBox(20, 12, 43, r.npsnAsal || '');

  // Nama Sekolah Asal (Row 21)
  setLabel(21, 3, 'Nama Sekolah Asal');
  setLabel(21, 11, ':');
  makeBox(21, 12, 43, r.sekolahAsal || '');

  // h. Tempat, Tgl Lahir (Row 22)
  setLabel(22, 2, 'h.   Tempat, Tgl Lahir');
  setLabel(22, 11, ':');
  makeBox(22, 12, 26, (r.tempatLahir || '').toUpperCase());
  setLabel(22, 27, ',');
  const tglParts = (r.tanggalLahir || '').split(/[-/]/);
  let tD = '01', tM = '01', tY = '2009';
  if (tglParts.length === 3) {
    if (tglParts[0].length === 4) {
      tY = tglParts[0]; tM = tglParts[1].padStart(2, '0'); tD = tglParts[2].padStart(2, '0');
    } else {
      tD = tglParts[0].padStart(2, '0'); tM = tglParts[1].padStart(2, '0'); tY = tglParts[2];
    }
  }
  makeDigit(22, 29, tD[0]); makeDigit(22, 30, tD[1]);
  setLabel(22, 31, '/', true);
  makeDigit(22, 32, tM[0]); makeDigit(22, 33, tM[1]);
  setLabel(22, 34, '/', true);
  makeDigit(22, 35, tY[0]); makeDigit(22, 36, tY[1]); makeDigit(22, 37, tY[2]); makeDigit(22, 38, tY[3]);

  // i. Agama (Row 24)
  setLabel(24, 2, 'i.    Agama');
  setLabel(24, 11, ':');
  makeBox(24, 12, 26, r.agama || '');

  // j. Berkebutuhan Khusus (Row 26)
  setLabel(26, 2, 'j.    Berkebutuhan Khusus');
  setLabel(26, 11, ':');
  makeBox(26, 12, 38, r.berkebutuhanKhusus || 'TIDAK');

  // g. Alamat (Row 28)
  setLabel(28, 2, 'g.   Alamat Tempat Tinggal');
  setLabel(28, 11, ':');
  makeBox(28, 12, 43, r.alamat || '');

  // Dusun, RT, RW (Row 30)
  setLabel(30, 3, '- Dusun');
  setLabel(30, 11, ':');
  makeBox(30, 12, 27, r.dusun || '');
  setLabel(30, 29, 'RT');
  let rtVal = '', rwVal = '';
  if (r.rtRw) {
    const parts = r.rtRw.split(/[/,-]/);
    rtVal = parts[0]?.trim() || '';
    rwVal = parts[1]?.trim() || '';
  }
  makeBox(30, 31, 33, rtVal, 'center');
  setLabel(30, 35, 'RW');
  makeBox(30, 37, 39, rwVal, 'center');

  // Kelurahan & Kode Pos (Row 32)
  setLabel(32, 3, '- Kelurahan / Desa');
  setLabel(32, 11, ':');
  makeBox(32, 12, 26, r.kelurahan || '');
  setLabel(32, 28, 'Kode Pos');
  makeBox(32, 32, 39, r.kodePos || '', 'center');

  // Kecamatan (Row 34)
  setLabel(34, 3, '- Kecamatan');
  setLabel(34, 11, ':');
  makeBox(34, 12, 43, r.kecamatan || '');

  // Kabupaten (Row 36)
  setLabel(36, 3, '- Kabupaten / Kota');
  setLabel(36, 11, ':');
  makeBox(36, 12, 43, r.kabupaten || '');

  // Propinsi (Row 38)
  setLabel(38, 3, '- Propinsi');
  setLabel(38, 11, ':');
  makeBox(38, 12, 43, r.propinsi || '');

  // l. Transportasi (Row 40)
  setLabel(40, 2, 'l.    Alat Transportasi ke Sekolah');
  setLabel(40, 11, ':');
  makeBox(40, 12, 34, r.transportasi || '');

  // m. Jenis Tinggal (Row 42)
  setLabel(42, 2, 'm.  Jenis Tinggal');
  setLabel(42, 11, ':');
  makeBox(42, 12, 34, r.jenisTinggal || '');

  // n. No Telepon & No HP (Row 44)
  setLabel(44, 2, 'n.   No Telepon Rumah');
  setLabel(44, 11, ':');
  makeBox(44, 12, 26, r.noTelp || '');
  setLabel(44, 28, 'No. Hp  :');
  makeBox(44, 32, 43, r.noHp || '');

  // o. Email Pribadi (Row 46)
  setLabel(46, 2, 'o.   Email Pribadi');
  setLabel(46, 11, ':');
  makeBox(46, 12, 43, r.emailPribadi || r.student?.email || '');

  // p. No. KKS (Row 48)
  setLabel(48, 2, 'p.   No. KKS');
  setLabel(48, 11, ':');
  makeBox(48, 12, 34, r.noKks || '');

  // q. KPS / PKH (Row 50)
  setLabel(50, 2, 'q.   Apakah Penerima KPS / PKH');
  setLabel(50, 11, ':');
  makeBox(50, 12, 17, r.penerimaKps || 'Tidak', 'center');
  setLabel(50, 19, 'No. KPS :');
  makeBox(50, 24, 43, r.noKps || '');

  // Layak PIP (Row 52)
  setLabel(52, 2, '-    Usulan dari sekolah Layak PIP');
  setLabel(52, 11, ':');
  makeBox(52, 12, 17, r.usulanPip || 'Tidak', 'center');
  setLabel(52, 19, 'Alasan Layak :');
  makeBox(52, 25, 43, r.alasanPip || 'Usulan sekolah');

  // Penerima KIP (Row 53)
  setLabel(53, 2, '-    Penerima KIP');
  setLabel(53, 11, ':');
  makeBox(53, 12, 17, r.penerimaKip || 'Tidak', 'center');
  setLabel(53, 19, 'No. KIP');
  makeBox(53, 24, 43, r.noKip || '');

  // Nama di KIP (Row 54)
  setLabel(54, 2, '-    Nama Tertera di KIP');
  setLabel(54, 11, ':');
  makeBox(54, 12, 34, r.namaDiKip || '');

  // Alasan Tolak KIP (Row 55)
  setLabel(55, 2, '-    Alasan Menolak KIP');
  setLabel(55, 11, ':');
  makeBox(55, 12, 34, r.alasanTolakKip || '');

  // No Registrasi Akta (Row 56)
  setLabel(56, 2, '-    No Registrasi Akta Lahir');
  setLabel(56, 11, ':');
  makeBox(56, 12, 43, r.noAktaLahir || '');

  // Lintang & Bujur (Rows 57-58)
  setLabel(57, 2, '-    Lintang');
  setLabel(57, 11, ':');
  makeBox(57, 12, 34, r.lintang || '');
  setLabel(58, 2, '-    Bujur');
  setLabel(58, 11, ':');
  makeBox(58, 12, 34, r.bujur || '');

  // --- SEKSI 2: DATA AYAH KANDUNG ---
  makeBanner(59, 'DATA AYAH KANDUNG (WAJIB DIISI)');

  setLabel(60, 2, 'r.   Nama Ayah');
  setLabel(60, 11, ':');
  makeBox(60, 12, 33, (r.namaAyah || '').toUpperCase());
  setLabel(60, 35, 'Tahun Lahir');
  const thAyah = String(r.tahunLahirAyah || '').padEnd(4, ' ');
  for (let i = 0; i < 4; i++) makeDigit(60, 39 + i, thAyah[i] !== ' ' ? thAyah[i] : '');

  setLabel(61, 3, '- Berkebutuhan Khusus');
  setLabel(61, 11, ':');
  makeBox(61, 12, 43, r.kebutuhanAyah || 'TIDAK');

  setLabel(63, 3, '- Pekerjaan');
  setLabel(63, 11, ':');
  makeBox(63, 12, 38, r.pekerjaanAyah || '');

  setLabel(64, 3, '- Pendidikan');
  setLabel(64, 11, ':');
  makeBox(64, 12, 38, r.pendidikanAyah || '');

  setLabel(66, 3, '- Penghasilan Bulanan');
  setLabel(66, 11, ':');
  makeBox(66, 12, 38, r.penghasilanAyah || '');

  // --- SEKSI 3: DATA IBU KANDUNG ---
  makeBanner(68, 'DATA IBU KANDUNG (WAJIB DIISI)');

  setLabel(70, 2, 's.   Nama Ibu');
  setLabel(70, 11, ':');
  makeBox(70, 12, 33, (r.namaIbu || '').toUpperCase());
  setLabel(70, 35, 'Tahun Lahir');
  const thIbu = String(r.tahunLahirIbu || '').padEnd(4, ' ');
  for (let i = 0; i < 4; i++) makeDigit(70, 39 + i, thIbu[i] !== ' ' ? thIbu[i] : '');

  setLabel(72, 3, '- Berkebutuhan Khusus');
  setLabel(72, 11, ':');
  makeBox(72, 12, 43, r.kebutuhanIbu || 'TIDAK');

  setLabel(74, 3, '- Pekerjaan');
  setLabel(74, 11, ':');
  makeBox(74, 12, 38, r.pekerjaanIbu || '');

  setLabel(76, 3, '- Pendidikan');
  setLabel(76, 11, ':');
  makeBox(76, 12, 38, r.pendidikanIbu || '');

  setLabel(78, 3, '- Penghasilan Bulanan');
  setLabel(78, 11, ':');
  makeBox(78, 12, 38, r.penghasilanIbu || '');

  // --- SEKSI 4: DATA WALI ---
  makeBanner(80, 'DATA WALI');

  setLabel(82, 2, 't.   Nama Wali');
  setLabel(82, 11, ':');
  makeBox(82, 12, 33, (r.namaWali || '').toUpperCase());
  setLabel(82, 35, 'Tahun Lahir');
  const thWali = String(r.tahunLahirWali || '').padEnd(4, ' ');
  for (let i = 0; i < 4; i++) makeDigit(82, 39 + i, thWali[i] !== ' ' ? thWali[i] : '');

  setLabel(84, 3, '- Pekerjaan');
  setLabel(84, 11, ':');
  makeBox(84, 12, 38, r.pekerjaanWali || '');

  setLabel(86, 3, '- Pendidikan');
  setLabel(86, 11, ':');
  makeBox(86, 12, 38, r.pendidikanWali || '');

  setLabel(88, 3, '- Penghasilan');
  setLabel(88, 11, ':');
  makeBox(88, 12, 38, r.penghasilanWali || '');

  // --- SEKSI 5: DATA PERIODIK ---
  makeBanner(90, 'DATA PERIODIK (WAJIB DIISI)');

  setLabel(92, 2, 'u.   Tinggi Badan');
  setLabel(92, 11, ':');
  const tb = String(r.tinggiBadan || '').replace(/\D/g, '').padStart(3, ' ');
  makeDigit(92, 13, tb[0]); makeDigit(92, 14, tb[1]); makeDigit(92, 15, tb[2]);
  setLabel(92, 17, 'cm');

  setLabel(92, 24, 'v.   Berat Badan');
  const bb = String(r.beratBadan || '').replace(/\D/g, '').padStart(2, ' ');
  makeDigit(92, 28, bb[0]); makeDigit(92, 29, bb[1]);
  setLabel(92, 31, 'kg');

  setLabel(94, 2, 'w.  Jarak Tempat Tinggal Kesekolah');
  setLabel(94, 11, ':');
  makeBox(94, 13, 22, r.jarakSekolah?.includes('Lebih') ? '2' : '1', 'center');
  setLabel(94, 24, '2) lebih dari 1km,sebutkan :');
  makeBox(94, 30, 32, '5', 'center');
  setLabel(94, 34, 'km');

  setLabel(96, 2, 'x.   Waktu Tempuh Berangkat Kesekolah');
  setLabel(96, 11, ':');
  makeBox(96, 13, 22, '1', 'center');
  setLabel(96, 24, '2) jika lebih dari 60 menit,sebutkan :');
  const wt = String(r.waktuTempuh || '').replace(/\D/g, '').padStart(2, '0');
  makeDigit(96, 33, wt[0]); makeDigit(96, 34, wt[1]);
  setLabel(96, 36, 'Menit');

  setLabel(98, 2, 'y.   Jumlah Saudara Kandung');
  setLabel(98, 11, ':');
  makeBox(98, 13, 15, String(r.jmlSaudara || '0'), 'center');

  setLabel(100, 2, 'y1. Anak Ke');
  setLabel(100, 11, ':');
  makeBox(100, 13, 15, String(r.anakKe || '1'), 'center');

  setLabel(102, 2, 'y2. Cita-cita');
  setLabel(102, 11, ':');
  makeBox(102, 13, 32, r.citaCita || '');

  setLabel(104, 2, 'y3. Hobi');
  setLabel(104, 11, ':');
  makeBox(104, 13, 32, r.hobi || '');

  setLabel(106, 2, 'y4. Pernah TK/Paud');
  setLabel(106, 11, ':');
  makeBox(106, 13, 32, r.asalTkPaud || 'Tidak');

  // --- SEKSI 6: TABEL PRESTASI ---
  makeBanner(108, 'DATA PERIODIK (WAJIB DIISI)');

  setLabel(110, 2, 'z.');
  makeBox(110, 4, 13, 'Jenis Prestasi', 'center');
  makeBox(110, 14, 19, 'Tingkat', 'center');
  makeBox(110, 20, 36, 'Nama Prestasi', 'center');
  makeBox(110, 37, 43, 'Tahun / Penyelenggaraan', 'center');

  for (let rIdx = 111; rIdx <= 114; rIdx++) {
    makeBox(rIdx, 4, 13, '', 'center');
    makeBox(rIdx, 14, 19, '', 'center');
    makeBox(rIdx, 20, 36, '', 'center');
    makeBox(rIdx, 37, 43, '', 'center');
  }

  // --- SEKSI 7: TABEL BEASISWA ---
  makeBanner(116, 'DATA PERIODIK (WAJIB DIISI)');

  setLabel(117, 2, 'aa');
  makeBox(117, 4, 9, 'Jenis', 'center');
  makeBox(117, 10, 28, 'Penyelenggara / Sumber', 'center');
  makeBox(117, 29, 35, 'Tahun Mulai', 'center');
  makeBox(117, 36, 43, 'Tahun Selesai', 'center');

  for (let rIdx = 118; rIdx <= 120; rIdx++) {
    makeBox(rIdx, 4, 9, '', 'center');
    makeBox(rIdx, 10, 28, '', 'center');
    makeBox(rIdx, 29, 35, '', 'center');
    makeBox(rIdx, 36, 43, '', 'center');
  }

  // --- PENGESAHAN & TANDA TANGAN ---
  setLabel(122, 4, 'Yang bertanda tangan Orang Tua/Wali atau Siswa');
  setLabel(122, 28, '……………………………….,  ……………………………………………');

  setLabel(124, 4, 'bertanggung jawab secara hukum terhadap kebenaran data yang tercantum.');
  setLabel(124, 32, 'Responden,');

  setLabel(126, 30, `(  ${(r.namaLengkap || '').toUpperCase()}  )`, true);
  worksheet.getCell(126, 30).alignment = { horizontal: 'center' };

  setLabel(127, 30, 'Tanda Tangan & Nama Terang');
  worksheet.getCell(127, 30).alignment = { horizontal: 'center' };
}

export function buildExactFpdGrid(r: any, programTitle?: string): string[][] {
  const grid: string[][] = Array.from({ length: 127 }, () => Array(43).fill(''));
  grid[0][0] = 'FORMULIR PESERTA DIDIK';
  grid[0][39] = 'F-PD';

  const now = r.createdAt ? new Date(r.createdAt) : new Date();
  const dStr = String(now.getDate()).padStart(2, '0');
  const mStr = String(now.getMonth() + 1).padStart(2, '0');
  const yStr = String(now.getFullYear());

  grid[2][0] = 'Tanggal :';
  grid[2][4] = dStr; grid[2][6] = '/'; grid[2][7] = mStr; grid[2][9] = '/'; grid[2][10] = yStr;
  grid[2][29] = 'REG  :';
  const regDigits = [dStr[0], dStr[1], '/', mStr[0], mStr[1], '/', yStr[0], yStr[1], yStr[2], yStr[3]];
  regDigits.forEach((ch, idx) => { grid[2][33 + idx] = ch; });

  grid[4][0] = '-'; grid[4][1] = 'Tingkat'; grid[4][10] = ':'; grid[4][11] = '1'; grid[4][12] = '0';
  grid[4][15] = 'Program'; grid[4][18] = ':'; grid[4][19] = programTitle || 'Teknik Otomotif';

  grid[6][0] = 'IDENTITAS PESERTA DIDIK (WAJIB DI ISI)';
  grid[8][0] = 'a.'; grid[8][1] = 'Nama Lengkap'; grid[8][10] = ':'; grid[8][11] = (r.namaLengkap || '').toUpperCase();
  grid[10][0] = 'b.'; grid[10][1] = 'Jenis Kelamin'; grid[10][10] = ':'; grid[10][11] = r.jenisKelamin || '';

  grid[12][0] = 'c.'; grid[12][1] = 'NISN'; grid[12][10] = ':';
  const nisn = (r.nisn || '').replace(/\D/g, '').padEnd(10, ' ');
  for (let i = 0; i < 10; i++) grid[12][11 + i] = nisn[i] !== ' ' ? nisn[i] : '';
  grid[12][24] = 'NIS'; grid[12][26] = ':';
  const nis = (r.nis || '').replace(/\D/g, '').padEnd(9, ' ');
  for (let i = 0; i < 9; i++) grid[12][27 + i] = nis[i] !== ' ' ? nis[i] : '';

  grid[14][0] = 'e.'; grid[14][1] = 'NOMOR SERI IJAZAH'; grid[14][10] = ':'; grid[14][11] = r.noIjazah || '';
  grid[16][0] = 'f.'; grid[16][1] = 'No. Ujian Sekolah Kelas 9'; grid[16][10] = ':'; grid[16][11] = r.noUjian || '';
  grid[18][0] = 'g.'; grid[18][1] = 'No.Induk Kependudukan(NIK)'; grid[18][10] = ':'; grid[18][11] = r.nik || '';
  grid[19][1] = 'NPSN Sekolah Asal'; grid[19][10] = ':'; grid[19][11] = r.npsnAsal || '';
  grid[20][1] = 'Nama Sekolah Asal'; grid[20][10] = ':'; grid[20][11] = r.sekolahAsal || '';

  grid[21][0] = 'h.'; grid[21][1] = 'Tempat, Tgl Lahir'; grid[21][10] = ':'; grid[21][11] = (r.tempatLahir || '').toUpperCase();
  grid[23][0] = 'i.'; grid[23][1] = 'Agama'; grid[23][10] = ':'; grid[23][11] = r.agama || '';
  grid[25][0] = 'j.'; grid[25][1] = 'Berkebutuhan Khusus'; grid[25][10] = ':'; grid[25][11] = r.berkebutuhanKhusus || 'TIDAK';

  grid[27][0] = 'g.'; grid[27][1] = 'Alamat Tempat Tinggal'; grid[27][10] = ':'; grid[27][11] = r.alamat || '';
  grid[29][0] = '-'; grid[29][1] = 'Dusun'; grid[29][10] = ':'; grid[29][11] = r.dusun || '';
  grid[31][0] = '-'; grid[31][1] = 'Kelurahan / Desa'; grid[31][10] = ':'; grid[31][11] = r.kelurahan || '';
  grid[33][0] = '-'; grid[33][1] = 'Kecamatan'; grid[33][10] = ':'; grid[33][11] = r.kecamatan || '';
  grid[35][0] = '-'; grid[35][1] = 'Kabupaten / Kota'; grid[35][10] = ':'; grid[35][11] = r.kabupaten || '';
  grid[37][0] = '-'; grid[37][1] = 'Propinsi'; grid[37][10] = ':'; grid[37][11] = r.propinsi || '';

  grid[39][0] = 'l.'; grid[39][1] = 'Alat Transportasi ke Sekolah'; grid[39][10] = ':'; grid[39][11] = r.transportasi || '';
  grid[41][0] = 'm.'; grid[41][1] = 'Jenis Tinggal'; grid[41][10] = ':'; grid[41][11] = r.jenisTinggal || '';
  grid[43][0] = 'n.'; grid[43][1] = 'No Telepon Rumah'; grid[43][10] = ':'; grid[43][11] = r.noTelp || ''; grid[43][27] = r.noHp || '';
  grid[45][0] = 'o.'; grid[45][1] = 'Email Pribadi'; grid[45][10] = ':'; grid[45][11] = r.emailPribadi || '';
  grid[47][0] = 'p.'; grid[47][1] = 'No. KKS'; grid[47][10] = ':'; grid[47][11] = r.noKks || '';
  grid[49][0] = 'q.'; grid[49][1] = 'Apakah Penerima KPS / PKH'; grid[49][10] = ':'; grid[49][11] = r.penerimaKps || 'Tidak';

  grid[58][0] = 'DATA AYAH KANDUNG (WAJIB DIISI)';
  grid[59][0] = 'r.'; grid[59][1] = 'Nama Ayah'; grid[59][10] = ':'; grid[59][11] = (r.namaAyah || '').toUpperCase();
  grid[67][0] = 'DATA IBU KANDUNG (WAJIB DIISI)';
  grid[69][0] = 's.'; grid[69][1] = 'Nama Ibu'; grid[69][10] = ':'; grid[69][11] = (r.namaIbu || '').toUpperCase();
  grid[79][0] = 'DATA WALI';
  grid[81][0] = 't.'; grid[81][1] = 'Nama Wali'; grid[81][10] = ':'; grid[81][11] = (r.namaWali || '').toUpperCase();
  grid[89][0] = 'DATA PERIODIK (WAJIB DIISI)';

  return grid;
}

export function gridToCsv(grid: string[][]): string {
  return grid.map(row => {
    return row.map(cell => {
      if (cell === undefined || cell === null) return '';
      if (cell.includes(',') || cell.includes('"') || cell.includes('\n') || cell.includes('\r')) {
        return `"${cell.replace(/"/g, '""')}"`;
      }
      return cell;
    }).join(',');
  }).join('\r\n');
}
