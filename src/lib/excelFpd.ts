import ExcelJS from 'exceljs';

export function populateFpdWorksheet(worksheet: ExcelJS.Worksheet, r: any, programTitle?: string) {
  // Set column widths
  worksheet.columns = [
    { width: 5 },   // A: Nomor / Poin (a., b., etc)
    { width: 32 },  // B: Label
    { width: 4 },   // C: ":"
    { width: 35 },  // D: Value
    { width: 22 },  // E: Sub-label
    { width: 25 },  // F: Sub-value / Ket
  ];

  const submitDate = r.createdAt ? new Date(r.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-';

  // 1. Header Judul
  const titleRow = worksheet.addRow(['', 'FORMULIR PESERTA DIDIK', '', '', '', 'F-PD']);
  titleRow.font = { name: 'Arial', size: 14, bold: true };
  titleRow.getCell(6).alignment = { horizontal: 'center' };
  titleRow.getCell(6).border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' },
  };

  const regRow = worksheet.addRow(['', `Tanggal : ${submitDate}`, '', '', '', `REG : ${submitDate}`]);
  regRow.font = { name: 'Arial', size: 10 };

  const progRow = worksheet.addRow(['-', 'Tingkat : 10', '', `Program / Kelas : ${programTitle || 'Teknik Otomotif'}`]);
  progRow.font = { name: 'Arial', size: 10, bold: true };

  worksheet.addRow([]); // Blank row

  // Helper untuk section header
  const addSectionHeader = (title: string) => {
    const row = worksheet.addRow(['', title]);
    row.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF1E293B' } };
    row.getCell(2).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE2E8F0' }
    };
  };

  // Helper untuk data row
  const addFieldRow = (no: string, label: string, val: string | null | undefined, subLabel?: string, subVal?: string | null | undefined) => {
    const row = worksheet.addRow([
      no,
      label,
      ':',
      val || '-',
      subLabel || '',
      subVal || ''
    ]);
    row.font = { name: 'Arial', size: 10 };
    row.getCell(4).font = { name: 'Arial', size: 10, bold: true };
    if (subVal) {
      row.getCell(6).font = { name: 'Arial', size: 10, bold: true };
    }
    return row;
  };

  // --- SEKSI 1: IDENTITAS PESERTA DIDIK ---
  addSectionHeader('IDENTITAS PESERTA DIDIK (WAJIB DI ISI)');
  addFieldRow('a.', 'Nama Lengkap', r.namaLengkap);
  addFieldRow('b.', 'Jenis Kelamin', r.jenisKelamin);
  addFieldRow('c.', 'NISN', r.nisn, 'NIS :', r.nis);
  addFieldRow('e.', 'NOMOR SERI IJAZAH', r.noIjazah, '*) diisikan jenjang sebelumnya');
  addFieldRow('f.', 'No. Ujian Sekolah Kelas 9', r.noUjian, '*) diisikan jenjang sebelumnya');
  addFieldRow('g.', 'No. Induk Kependudukan (NIK)', r.nik);
  addFieldRow('', 'NPSN Sekolah Asal', r.npsnAsal);
  addFieldRow('', 'Nama Sekolah Asal', r.sekolahAsal);
  addFieldRow('h.', 'Tempat, Tgl Lahir', `${r.tempatLahir || '-'}, ${r.tanggalLahir || '-'}`);
  addFieldRow('i.', 'Agama', r.agama);
  addFieldRow('j.', 'Berkebutuhan Khusus', r.berkebutuhanKhusus || 'Tidak ada');
  addFieldRow('k.', 'Alamat Tempat Tinggal', r.alamat);
  addFieldRow('-', 'Dusun / Kampung', r.dusun, 'RT / RW :', r.rtRw);
  addFieldRow('-', 'Kelurahan / Desa', r.kelurahan, 'Kode Pos :', r.kodePos);
  addFieldRow('-', 'Kecamatan', r.kecamatan);
  addFieldRow('-', 'Kabupaten / Kota', r.kabupaten);
  addFieldRow('-', 'Propinsi', r.propinsi);
  addFieldRow('l.', 'Alat Transportasi ke Sekolah', r.transportasi);
  addFieldRow('m.', 'Jenis Tinggal', r.jenisTinggal);
  addFieldRow('n.', 'No Telepon Rumah', r.noTelp, 'No. HP / WA :', r.noHp);
  addFieldRow('o.', 'Email Pribadi', r.emailPribadi);
  addFieldRow('p.', 'No. KKS', r.noKks, '*) Kartu Keluarga Sejahtera');
  addFieldRow('q.', 'Penerima KPS / PKH', r.penerimaKps);
  addFieldRow('-', 'Usulan dari Sekolah Layak PIP', r.usulanPip);
  addFieldRow('-', 'Penerima KIP', r.penerimaKip, 'No. KIP :', r.noKip);
  addFieldRow('-', 'Nama Tertera di KIP', r.namaDiKip);
  addFieldRow('-', 'Alasan Menolak KIP', r.alasanTolakKip);
  addFieldRow('-', 'No Registrasi Akta Lahir', r.noAktaLahir);
  addFieldRow('-', 'Titik Koordinat (Lintang, Bujur)', `${r.lintang || '-'}, ${r.bujur || '-'}`);

  worksheet.addRow([]); // Blank row

  // --- SEKSI 2: DATA AYAH KANDUNG ---
  addSectionHeader('DATA AYAH KANDUNG (WAJIB DIISI)');
  addFieldRow('r.', 'Nama Ayah', r.namaAyah, 'Tahun Lahir :', r.tahunLahirAyah);
  addFieldRow('-', 'Berkebutuhan Khusus', r.kebutuhanAyah || 'Tidak ada');
  addFieldRow('-', 'Pekerjaan', r.pekerjaanAyah);
  addFieldRow('-', 'Pendidikan', r.pendidikanAyah);
  addFieldRow('-', 'Penghasilan Bulanan', r.penghasilanAyah);

  worksheet.addRow([]); // Blank row

  // --- SEKSI 3: DATA IBU KANDUNG ---
  addSectionHeader('DATA IBU KANDUNG (WAJIB DIISI)');
  addFieldRow('s.', 'Nama Ibu', r.namaIbu, 'Tahun Lahir :', r.tahunLahirIbu);
  addFieldRow('-', 'Berkebutuhan Khusus', r.kebutuhanIbu || 'Tidak ada');
  addFieldRow('-', 'Pekerjaan', r.pekerjaanIbu);
  addFieldRow('-', 'Pendidikan', r.pendidikanIbu);
  addFieldRow('-', 'Penghasilan Bulanan', r.penghasilanIbu);

  worksheet.addRow([]); // Blank row

  // --- SEKSI 4: DATA WALI ---
  addSectionHeader('DATA WALI');
  addFieldRow('t.', 'Nama Wali', r.namaWali, 'Tahun Lahir :', r.tahunLahirWali);
  addFieldRow('-', 'Pekerjaan', r.pekerjaanWali);
  addFieldRow('-', 'Pendidikan', r.pendidikanWali);
  addFieldRow('-', 'Penghasilan', r.penghasilanWali);

  worksheet.addRow([]); // Blank row

  // --- SEKSI 5: DATA PERIODIK ---
  addSectionHeader('DATA PERIODIK (WAJIB DIISI)');
  addFieldRow('u.', 'Tinggi Badan', r.tinggiBadan ? `${r.tinggiBadan} cm` : '-', 'v. Berat Badan :', r.beratBadan ? `${r.beratBadan} kg` : '-');
  addFieldRow('w.', 'Jarak Tempat Tinggal ke Sekolah', r.jarakSekolah);
  addFieldRow('x.', 'Waktu Tempuh Berangkat ke Sekolah', r.waktuTempuh);
  addFieldRow('y.', 'Jumlah Saudara Kandung', r.jmlSaudara, 'y1. Anak Ke- :', r.anakKe);
  addFieldRow('y2.', 'Cita-cita', r.citaCita);
  addFieldRow('y3.', 'Hobi', r.hobi);
  addFieldRow('y4.', 'Pernah TK / PAUD', r.asalTkPaud);

  worksheet.addRow([]); // Blank row

  // --- TANDA TANGAN / PENGESAHAN ---
  const signNote = worksheet.addRow(['', 'Yang bertanda tangan Orang Tua/Wali atau Siswa bertanggung jawab secara hukum terhadap kebenaran data yang tercantum.']);
  signNote.font = { name: 'Arial', size: 9, italic: true };

  worksheet.addRow([]);
  const respRow = worksheet.addRow(['', '', '', '', 'Responden,']);
  respRow.font = { name: 'Arial', size: 10 };
  respRow.getCell(5).alignment = { horizontal: 'center' };

  worksheet.addRow([]);
  worksheet.addRow([]);

  const nameSignRow = worksheet.addRow(['', '', '', '', `( ${r.namaLengkap} )`]);
  nameSignRow.font = { name: 'Arial', size: 10, bold: true, underline: true };
  nameSignRow.getCell(5).alignment = { horizontal: 'center' };

  const capRow = worksheet.addRow(['', '', '', '', 'Tanda Tangan & Nama Terang']);
  capRow.font = { name: 'Arial', size: 9 };
  capRow.getCell(5).alignment = { horizontal: 'center' };
}
