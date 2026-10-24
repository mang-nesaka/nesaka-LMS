"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth';


export async function saveDapodikForm(formData: FormData) {
  const { id: userId } = await requireRole('STUDENT');

  // Cek apakah siswa sudah pernah mengisi
  const existing = await prisma.dapodikForm.findUnique({
    where: { studentId: userId },
  });

  if (existing) {
    throw new Error('Formulir Dapodik sudah pernah dikirim dan tidak dapat diubah kembali.');
  }

  const get = (key: string) => {
    const val = formData.get(key);
    return typeof val === 'string' ? val.trim() : null;
  };

  const namaLengkap = get('namaLengkap');
  const jenisKelamin = get('jenisKelamin');
  const nisn = get('nisn');
  const nik = get('nik');
  const tempatLahir = get('tempatLahir');
  const tanggalLahir = get('tanggalLahir');
  const agama = get('agama');
  const alamat = get('alamat');
  const noHp = get('noHp');
  const namaAyah = get('namaAyah');
  const namaIbu = get('namaIbu');

  if (!namaLengkap || !jenisKelamin || !nisn || !nik || !tempatLahir || !tanggalLahir || !agama || !alamat || !noHp || !namaAyah || !namaIbu) {
    throw new Error('Mohon lengkapi seluruh field wajib yang berbintang (*).');
  }

  await prisma.dapodikForm.create({
    data: {
      studentId: userId,
      namaLengkap,
      jenisKelamin,
      nisn,
      nis: get('nis'),
      noIjazah: get('noIjazah'),
      noUjian: get('noUjian'),
      nik,
      npsnAsal: get('npsnAsal'),
      sekolahAsal: get('sekolahAsal'),
      tempatLahir,
      tanggalLahir,
      agama,
      berkebutuhanKhusus: get('berkebutuhanKhusus') || 'Tidak ada',
      alamat,
      rtRw: get('rtRw'),
      dusun: get('dusun'),
      kelurahan: get('kelurahan'),
      kecamatan: get('kecamatan'),
      kabupaten: get('kabupaten'),
      propinsi: get('propinsi'),
      kodePos: get('kodePos'),
      transportasi: get('transportasi'),
      jenisTinggal: get('jenisTinggal'),
      noTelp: get('noTelp'),
      noHp,
      emailPribadi: get('emailPribadi'),
      noKks: get('noKks'),
      penerimaKps: get('penerimaKps') || 'Tidak',
      usulanPip: get('usulanPip') || 'Tidak',
      penerimaKip: get('penerimaKip') || 'Tidak',
      noKip: get('noKip'),
      namaDiKip: get('namaDiKip'),
      alasanTolakKip: get('alasanTolakKip'),
      noAktaLahir: get('noAktaLahir'),
      lintang: get('lintang'),
      bujur: get('bujur'),

      namaAyah,
      tahunLahirAyah: get('tahunLahirAyah'),
      kebutuhanAyah: get('kebutuhanAyah') || 'Tidak ada',
      pekerjaanAyah: get('pekerjaanAyah'),
      pendidikanAyah: get('pendidikanAyah'),
      penghasilanAyah: get('penghasilanAyah'),

      namaIbu,
      tahunLahirIbu: get('tahunLahirIbu'),
      kebutuhanIbu: get('kebutuhanIbu') || 'Tidak ada',
      pekerjaanIbu: get('pekerjaanIbu'),
      pendidikanIbu: get('pendidikanIbu'),
      penghasilanIbu: get('penghasilanIbu'),

      namaWali: get('namaWali'),
      tahunLahirWali: get('tahunLahirWali'),
      pekerjaanWali: get('pekerjaanWali'),
      pendidikanWali: get('pendidikanWali'),
      penghasilanWali: get('penghasilanWali'),

      tinggiBadan: get('tinggiBadan'),
      beratBadan: get('beratBadan'),
      jarakSekolah: get('jarakSekolah'),
      waktuTempuh: get('waktuTempuh'),
      jmlSaudara: get('jmlSaudara'),
      anakKe: get('anakKe'),
      citaCita: get('citaCita'),
      hobi: get('hobi'),
      asalTkPaud: get('asalTkPaud'),
    },
  });

  revalidatePath('/dashboard/dapodik');
  return { success: true };
}
