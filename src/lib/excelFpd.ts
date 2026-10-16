import ExcelJS from 'exceljs';

export const RAW_FPD_TEMPLATE_CSV = `FORMULIR PESERTA DIDIK,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,F-PD,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
Tanggal : ,,,,15,,/,07,, /,2026,,,,,,,,,,,,,,,,,,,REG  :,,,,1,5, /,0,7, /,2,0,2,5
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
 - ,Tingkat,,,,,, ,,  ,  :,1,0,,,Program,,, :,Teknik Otomotif,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
IDENTITAS PESERTA DIDIK (WAJIB DI ISI),,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
a.,Nama Lengkap,,,,,,,,,  :, ADIT AVRIL LIYANTO,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
b.,Jenis Kelamin,,,,,,,,,  :,Laki-laki,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
c.,NISN,,,,,,,,,  :,0,0,9,3,9,8,8,1,5,3,,,,NIS,,  :,2,5,2,6,1,0,2,0,2,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
e.,NOMOR SERI IJAZAH,,,,,,,,,  :,,,,,,,,,,,,,,,,,,,,,*) diisikan data dari jenjang sebelumnya,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
f.,No. Ujian Sekolah Kelas 9,,,,,,,,,  :,,,,,,,,,,,,,,,,,,,,,*) diisikan data dari jenjang sebelumnya,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
g.,No.Induk Kependudukan(NIK),,,,,,,,,  :,3212221504090005,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,NPSN Sekolah Asal,,,,,,,,,  :,,,,,,,,,,,,,,,,,,,,,*) diisikan data dari jenjang sebelumnya,,,,,,,,,,,
,Nama Sekolah Asal,,,,,,,,,  :, ,,,,,,,,,,,,,,,,,,,,*) diisikan data dari jenjang sebelumnya,,,,,,,,,,,
h.,"Tempat, Tgl Lahir",,,,,,,,,  :,Indramayu,,,,,,,,,,,,,,,,,,,,",",1,5,/,0,4,/,2,0,0,9,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
i.,Agama,,,,,,,,,  :,Islam,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
j.,Berkebutuhan Khusus,,,,,,,,,  :,Tidak ada,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
g.,Alamat Tempat Tinggal,,,,,,,,,  :,Blok Kebon,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
  -,Dusun,,,,,,,,,  :,,,,,,,,,,,,,,,,,,,,,,,RT,,,,RW,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
  -,Kelurahan / Desa,,,,,,,,,  :,Sidamulya,,,,,,,,,,,,,,,,,,,,,,Kode Pos,,,45255,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
  -,Kecamatan,,,,,,,,,  :,Sidamulya,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
  -,Kabupaten / Kota,,,,,,,,,  :,Kec. Bongas,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
  -,Propinsi,,,,,,,,,  :,Kab. Indramayu,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
I.,Alat Transportasi ke Sekolah,,,,,,,,,  :,Sepeda motor,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
m.,Jenis Tinggal,,,,,,,,,  :,Bersama orang tua,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
n.,No Telepon Rumah,,,,,,,,,  :,,,,,,,,,,,,,,No. Hp,,  :,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
o.,Email Pribadi,,,,,,,,,  :,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
p.,No. KKS,,,,,,,,,  :,,,,,,,,,,,,,,,,,,,,,,,,,*) KKS  : Kartu Keluarga Sejahtera,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
q.,Apakah Penerima KPS / PKH,,,,,,,,,  :,Tidak ,,,,No. KPS :,,,,,,,,,,,,,,,,,,,,*) KPS  : Kartu Perlindungan Sosial,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
-,Usulan dari sekolah Layak PIP,,,,,,,,,  :,Ya ,,,,Alasan Layak :,,,,Siswa Miskin/Rentan Miskin,,,,,,,,,,,,,,,,*) PIP  : Program Indonesia Pintar,,,,,,,
-,Penerima KIP,,,,,,,,,  :,Tidak ,,,,No. KIP,,,,,,,,,,,,,,,,,,,,*) KIP  : Kartu Indonesia Pintar,,,,,,,
-,Nama Tertera di KIP,,,,,,,,,  :,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
-,Alasan Menolak KIP,,,,,,,,,  :,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
-,No Registrasi Akta Lahir,,,,,,,,,  :,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
-,Lintang,,,,,,,,,  :,-6.377900000000,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
-,Bujur,,,,,,,,,  :,108.034900000000,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
DATA AYAH KANDUNG (WAJIB DIISI),,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
r.,Nama Ayah,,,,,,,,,  :,Ahmad,,,,,,,,,,,,,,,,,,,,,,,,Tahun Lahir,,,,0,,,
,  -,Berkebutuhan Khusus,,,,,,,,  :,Tidak ada,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,  -,Pekerjaan,,,,,,,,  :,Pedagang Kecil,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,  -,Pendidikan,,,,,,,,  :,-,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,  -,Penghasilan Bulanan,,,,,,,,  :," Kurang dari Rp. 500,000    ",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
DATA IBU KANDUNG (WAJIB DIISI),,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
s.,Nama Ibu,,,,,,,,,  :,Taswinah,,,,,,,,,,,,,,,,,,,,,,,,Tahun Lahir,,,,1,9,9,0
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,  -,Berkebutuhan Khusus,,,,,,,,  :,Tidak ada,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,  -,Pekerjaan,,,,,,,,  :,Pedagang Kecil,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,  -,Pendidikan,,,,,,,,  :,SD / sederajat,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,  -,Penghasilan Bulanan,,,,,,,,  :,"Kurang dari Rp. 500,000",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
DATA WALI,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
t.,Nama Wali,,,,,,,,,  :,,,,,,,,,,,,,,,,,,,,,,,,,Tahun Lahir,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,  -,Pekerjaan,,,,,,,,  :,-,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,  -,Pendidikan,,,,,,,,  :,-,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,  -,Penghasilan,,,,,,,,  :,-,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
DATA PERIODIK (WAJIB DIISI),,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
u.,Tinggi Badan,,,,,,,,,,,  :,1,6,0,cm,,,,,,v.,Berat Badan,,,,,4,5,,kg,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
w.,Jarak Tempat Tinggal Kesekolah,,,,,,,,,,,  :,2,,,,,,,,,,"2) lebih dari 1km,sebutkan :",,,,,,,,1,5,km,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
x.,Waktu Tempuh Berangkat Kesekolah,,,,,,,,,,,  :,0,,,,,,,,,,"2) jika lebih dari 60 menit,sebutkan :",,,,,,,,,,,1,5,,Menit,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
y.,Jumlah Saudara Kandung  ,,,,,,,,,,,  :,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
y1.,Anak Ke,,,,,,,,,,,  :,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
y2.,Cita-cita,,,,,,,,,,,  :,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
y3.,Hobi,,,,,,,,,,,  :,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
y4.,Pernah TK/Paud,,,,,,,,,,,  :,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
DATA PERIODIK (WAJIB DIISI),,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
z.,Jenis Prestasi,,,,,,,,Tingkat,,,,,Nama Prestasi,,,,,,,,,,,,,Tahun,,,,,Penyelenggaraan,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,     ,,,,,,,,,,,,,     ,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,     ,,,,,,,,,,,,,     ,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,     ,,,,,,,,,,,,,     ,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,     ,,,,,,,,,,,,,     ,,,,,,,,,,,,,,,,,,,,,,,,,,,,
DATA PERIODIK (WAJIB DIISI),,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
aa,,Jenis,,,,,Penyelenggara / Sumber,,,,,,,,,,,,,,,,,,,,,,,,,,Tahun Mulai,,,,,Tahun Selesai,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,Yang bertanda tangan Orang Tua/Wali atau Siswa,,,,,,,,,,,,,,,,,,,,,,,,,,,,," ………………………………., ………………………………………………………………",,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,bertanggung jawab secara hukum terhadap kebenaran data yang tercantum.,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,"Responden,",,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,(…………………………………………………………………..),,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,Tanda Tangan & Nama Terang,,,,,,,,,`;

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

const templateRows = RAW_FPD_TEMPLATE_CSV.split(/\r?\n/).map(parseCSVLine);

export function buildExactFpdGrid(r: any, programTitle?: string): string[][] {
  // Deep clone template grid (127 baris x 43 kolom)
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
  if (grid[60]) grid[60][11] = r.kebutuhanAyah || 'Tidak ada';
  if (grid[62]) grid[62][11] = r.pekerjaanAyah || '';
  if (grid[63]) grid[63][11] = r.pendidikanAyah || '';
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
  if (grid[71]) grid[71][11] = r.kebutuhanIbu || 'Tidak ada';
  if (grid[73]) grid[73][11] = r.pekerjaanIbu || '';
  if (grid[75]) grid[75][11] = r.pendidikanIbu || '';
  if (grid[77]) grid[77][11] = r.penghasilanIbu || '';

  // DATA WALI
  if (grid[81]) {
    grid[81][11] = r.namaWali || '';
    grid[81][39] = r.tahunLahirWali || '';
  }
  if (grid[83]) grid[83][11] = r.pekerjaanWali || '';
  if (grid[85]) grid[85][11] = r.pendidikanWali || '';
  if (grid[87]) grid[87][11] = r.penghasilanWali || '';

  // DATA PERIODIK
  if (grid[91]) {
    const tb = String(r.tinggiBadan || '').replace(/\D/g, '').padStart(3, ' ');
    grid[91][13] = tb[0]; grid[91][14] = tb[1]; grid[91][15] = tb[2];
    const bb = String(r.beratBadan || '').replace(/\D/g, '').padStart(2, ' ');
    grid[91][28] = bb[0]; grid[91][29] = bb[1];
  }
  if (grid[93]) {
    grid[93][13] = r.jarakSekolah?.includes('Lebih') ? '2' : '1';
  }
  if (grid[95]) {
    const wt = String(r.waktuTempuh || '').replace(/\D/g, '').padStart(2, '0');
    grid[95][34] = wt[0]; grid[95][35] = wt[1];
  }
  if (grid[97]) grid[97][13] = String(r.jmlSaudara || '0');
  if (grid[99]) grid[99][13] = String(r.anakKe || '1');
  if (grid[101]) grid[101][13] = r.citaCita || '';
  if (grid[103]) grid[103][13] = r.hobi || '';
  if (grid[105]) grid[105][13] = r.asalTkPaud || 'Ya';

  // Tanda Tangan
  if (grid[124]) {
    grid[124][32] = `( ${r.namaLengkap} )`;
  }

  return grid;
}

export function populateExactFpdWorksheet(worksheet: ExcelJS.Worksheet, r: any, programTitle?: string) {
  const grid = buildExactFpdGrid(r, programTitle);

  // Pastikan gridlines bawaan Excel selalu aktif dan terlihat
  worksheet.views = [{ showGridLines: true }];

  // Atur lebar 43 kolom agar proporsional
  worksheet.columns = Array.from({ length: 43 }).map((_, idx) => ({
    width: idx === 1 ? 26 : idx === 11 ? 30 : 4.5
  }));

  const thinBox: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };

  const lineBottom: Partial<ExcelJS.Borders> = {
    bottom: { style: 'thin', color: { argb: 'FF475569' } }
  };

  // Tambahkan semua baris
  grid.forEach((rowValues) => {
    worksheet.addRow(rowValues);
  });

  // Helper untuk styling sel
  const styleBox = (rowNum: number, colNum: number) => {
    const cell = worksheet.getCell(rowNum, colNum);
    cell.border = thinBox;
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.font = { name: 'Arial', size: 9, bold: true };
  };

  const styleBottom = (rowNum: number, colNum: number, span = 15) => {
    for (let c = colNum; c < colNum + span; c++) {
      const cell = worksheet.getCell(rowNum, c);
      cell.border = lineBottom;
    }
  };

  const styleHeader = (rowNum: number) => {
    const cell = worksheet.getCell(rowNum, 1);
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF0F172A' } };
    for (let c = 1; c <= 43; c++) {
      const curCell = worksheet.getCell(rowNum, c);
      curCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE2E8F0' }
      };
      curCell.border = {
        top: { style: 'thin', color: { argb: 'FF94A3B8' } },
        bottom: { style: 'thin', color: { argb: 'FF94A3B8' } }
      };
    }
  };

  // 1. Kotak F-PD di Row 1
  const fpdCell = worksheet.getCell(1, 40);
  fpdCell.border = thinBox;
  fpdCell.font = { name: 'Arial', size: 12, bold: true };
  fpdCell.alignment = { horizontal: 'center', vertical: 'middle' };

  // 2. Kotak Tanggal & REG di Row 3
  [5, 8, 11].forEach(col => styleBox(3, col));
  for (let c = 34; c <= 43; c++) styleBox(3, c);

  // 3. Kotak Tingkat di Row 5
  styleBox(5, 12);
  styleBox(5, 13);
  styleBottom(5, 20, 10);

  // 4. Section Headers
  [7, 59, 68, 80, 90, 108, 116].forEach(rowNum => styleHeader(rowNum));

  // 5. Garis Bawah Isian Data Utama
  [9, 11, 15, 17, 19, 20, 21, 24, 26, 28, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 53, 54, 56, 57, 58].forEach(rowNum => {
    styleBottom(rowNum, 12, 16);
  });

  // 6. Kotak Digit NISN (10 digit) & NIS (9 digit) di Row 13
  for (let c = 12; c <= 21; c++) styleBox(13, c);
  for (let c = 28; c <= 36; c++) styleBox(13, c);

  // 7. Kotak Tanggal Lahir di Row 22
  [33, 34, 36, 37, 39, 40, 41, 42].forEach(col => styleBox(22, col));

  // 8. RT / RW di Row 30 & Kode Pos di Row 32
  styleBox(30, 35);
  styleBox(30, 39);
  styleBox(32, 37);

  // 9. Data Orang Tua Garis & Kotak
  [60, 61, 63, 64, 66, 70, 72, 74, 76, 78, 82, 84, 86, 88].forEach(rowNum => {
    styleBottom(rowNum, 12, 16);
  });
  styleBox(60, 40); // Thn Lahir Ayah
  for (let c = 40; c <= 43; c++) styleBox(70, c); // Thn Lahir Ibu
  styleBox(82, 40); // Thn Lahir Wali

  // 10. Data Periodik Kotak Digit
  // Tinggi Badan (Row 92: cols 14, 15, 16)
  styleBox(92, 14); styleBox(92, 15); styleBox(92, 16);
  // Berat Badan (Row 92: cols 29, 30)
  styleBox(92, 29); styleBox(92, 30);
  // Jarak (Row 94: col 14 & cols 32, 33)
  styleBox(94, 14); styleBox(94, 32); styleBox(94, 33);
  // Waktu tempuh (Row 96: col 14 & cols 35, 36)
  styleBox(96, 14); styleBox(96, 35); styleBox(96, 36);
  // Saudara & Anak Ke- (Row 98, 100: col 14)
  styleBox(98, 14); styleBox(100, 14);

  // 11. Garis Tabel Prestasi (Rows 110-114)
  for (let r = 110; r <= 114; r++) {
    for (let c = 1; c <= 43; c++) {
      const cell = worksheet.getCell(r, c);
      cell.border = thinBox;
    }
  }

  // 12. Garis Tabel Beasiswa / Bantuan (Rows 117-121)
  for (let r = 117; r <= 121; r++) {
    for (let c = 1; c <= 43; c++) {
      const cell = worksheet.getCell(r, c);
      cell.border = thinBox;
    }
  }
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
