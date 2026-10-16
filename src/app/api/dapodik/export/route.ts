import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth_token')?.value;

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (currentUser?.role !== 'ADMIN' && currentUser?.role !== 'TU') {
    return new NextResponse('Forbidden: Hanya TU atau Admin yang bisa mendownload data Dapodik', { status: 403 });
  }

  const records = await prisma.dapodikForm.findMany({
    include: {
      student: {
        select: {
          name: true,
          email: true,
          enrollments: {
            include: {
              course: { select: { title: true } }
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'asc' },
  });

  // Susun header sesuai template spreadsheet
  const headers = [
    "No",
    "Tanggal Submit",
    "Kelas / Jurusan",
    "Nama Lengkap",
    "Jenis Kelamin",
    "NISN",
    "NIS",
    "Nomor Seri Ijazah",
    "No Ujian Sekolah SMP",
    "NIK",
    "NPSN Sekolah Asal",
    "Nama Sekolah Asal",
    "Tempat Lahir",
    "Tanggal Lahir",
    "Agama",
    "Berkebutuhan Khusus",
    "Alamat Tempat Tinggal",
    "RT/RW",
    "Dusun",
    "Kelurahan / Desa",
    "Kecamatan",
    "Kabupaten / Kota",
    "Propinsi",
    "Kode Pos",
    "Transportasi",
    "Jenis Tinggal",
    "No Telepon Rumah",
    "No HP",
    "Email Pribadi",
    "No KKS",
    "Penerima KPS/PKH",
    "Usulan PIP",
    "Penerima KIP",
    "No KIP",
    "Nama di KIP",
    "Alasan Menolak KIP",
    "No Registrasi Akta Lahir",
    "Lintang",
    "Bujur",
    // Data Ayah
    "Nama Ayah",
    "Tahun Lahir Ayah",
    "Kebutuhan Khusus Ayah",
    "Pekerjaan Ayah",
    "Pendidikan Ayah",
    "Penghasilan Ayah",
    // Data Ibu
    "Nama Ibu",
    "Tahun Lahir Ibu",
    "Kebutuhan Khusus Ibu",
    "Pekerjaan Ibu",
    "Pendidikan Ibu",
    "Penghasilan Ibu",
    // Data Wali
    "Nama Wali",
    "Tahun Lahir Wali",
    "Pekerjaan Wali",
    "Pendidikan Wali",
    "Penghasilan Wali",
    // Data Periodik
    "Tinggi Badan (cm)",
    "Berat Badan (kg)",
    "Jarak Tempat Tinggal ke Sekolah",
    "Waktu Tempuh ke Sekolah",
    "Jumlah Saudara Kandung",
    "Anak Ke-",
    "Cita-cita",
    "Hobi",
    "Pernah TK/PAUD"
  ];

  const escapeCsv = (str: string | null | undefined) => {
    if (!str) return '""';
    const clean = String(str).replace(/"/g, '""');
    return `"${clean}"`;
  };

  const rows = records.map((r, index) => {
    const courseTitles = r.student.enrollments.map(e => e.course.title).join("; ") || "-";
    return [
      index + 1,
      r.createdAt.toISOString().split('T')[0],
      escapeCsv(courseTitles),
      escapeCsv(r.namaLengkap),
      escapeCsv(r.jenisKelamin),
      escapeCsv(r.nisn),
      escapeCsv(r.nis),
      escapeCsv(r.noIjazah),
      escapeCsv(r.noUjian),
      escapeCsv(r.nik),
      escapeCsv(r.npsnAsal),
      escapeCsv(r.sekolahAsal),
      escapeCsv(r.tempatLahir),
      escapeCsv(r.tanggalLahir),
      escapeCsv(r.agama),
      escapeCsv(r.berkebutuhanKhusus),
      escapeCsv(r.alamat),
      escapeCsv(r.rtRw),
      escapeCsv(r.dusun),
      escapeCsv(r.kelurahan),
      escapeCsv(r.kecamatan),
      escapeCsv(r.kabupaten),
      escapeCsv(r.propinsi),
      escapeCsv(r.kodePos),
      escapeCsv(r.transportasi),
      escapeCsv(r.jenisTinggal),
      escapeCsv(r.noTelp),
      escapeCsv(r.noHp),
      escapeCsv(r.emailPribadi || r.student.email),
      escapeCsv(r.noKks),
      escapeCsv(r.penerimaKps),
      escapeCsv(r.usulanPip),
      escapeCsv(r.penerimaKip),
      escapeCsv(r.noKip),
      escapeCsv(r.namaDiKip),
      escapeCsv(r.alasanTolakKip),
      escapeCsv(r.noAktaLahir),
      escapeCsv(r.lintang),
      escapeCsv(r.bujur),

      escapeCsv(r.namaAyah),
      escapeCsv(r.tahunLahirAyah),
      escapeCsv(r.kebutuhanAyah),
      escapeCsv(r.pekerjaanAyah),
      escapeCsv(r.pendidikanAyah),
      escapeCsv(r.penghasilanAyah),

      escapeCsv(r.namaIbu),
      escapeCsv(r.tahunLahirIbu),
      escapeCsv(r.kebutuhanIbu),
      escapeCsv(r.pekerjaanIbu),
      escapeCsv(r.pendidikanIbu),
      escapeCsv(r.penghasilanIbu),

      escapeCsv(r.namaWali),
      escapeCsv(r.tahunLahirWali),
      escapeCsv(r.pekerjaanWali),
      escapeCsv(r.pendidikanWali),
      escapeCsv(r.penghasilanWali),

      escapeCsv(r.tinggiBadan),
      escapeCsv(r.beratBadan),
      escapeCsv(r.jarakSekolah),
      escapeCsv(r.waktuTempuh),
      escapeCsv(r.jmlSaudara),
      escapeCsv(r.anakKe),
      escapeCsv(r.citaCita),
      escapeCsv(r.hobi),
      escapeCsv(r.asalTkPaud),
    ].join(',');
  });

  // Berikan BOM (\uFEFF) agar Microsoft Excel langsung membaca sebagai UTF-8 dengan rapi
  const csvContent = '\uFEFF' + [headers.map(h => `"${h}"`).join(','), ...rows].join('\r\n');

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="Rekap_Formulir_Dapodik_Siswa_${new Date().toISOString().split('T')[0]}.csv"`,
    },
  });
}
