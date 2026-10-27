import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. School Setting (Titik Sekolah & Waktu Presensi)
  const schoolSetting = await prisma.schoolSetting.upsert({
    where: { id: 'default' },
    update: {
      schoolName: 'SMK Negeri 1 kandanghaur',
      schoolLat: -6.9175,
      schoolLng: 107.6191,
      radiusMeters: 200.0,
      checkInStartTime: '06:30',
      checkInLateTime: '07:00',
      checkOutStartTime: '15:00',
    },
    create: {
      id: 'default',
      schoolName: 'SMK Negeri 1 kandanghaur',
      schoolLat: -6.9175,
      schoolLng: 107.6191,
      radiusMeters: 200.0,
      checkInStartTime: '06:30',
      checkInLateTime: '07:00',
      checkOutStartTime: '15:00',
    },
  });

  // 2. Classrooms
  const classes = [
    { name: 'X RPL 1', code: 'NESAKA-X-RPL-1', level: '10' },
    { name: 'X RPL 2', code: 'NESAKA-X-RPL-2', level: '10' },
    { name: 'X TKJ 1', code: 'NESAKA-X-TKJ-1', level: '10' },
    { name: 'XI RPL 1', code: 'NESAKA-XI-RPL-1', level: '11' },
    { name: 'XII RPL 1', code: 'NESAKA-XII-RPL-1', level: '12' },
  ];

  for (const c of classes) {
    await prisma.classroom.upsert({
      where: { name: c.name },
      update: { code: c.code, level: c.level },
      create: c,
    });
  }

  // 3. User Accounts for All Roles
  const usersToSeed = [
    {
      name: 'Super Administrator',
      email: 'admin@sekolah.com',
      password: 'password123',
      role: 'ADMIN',
    },
    {
      name: 'Staf Tata Usaha',
      email: 'tu@sekolah.com',
      password: 'password123',
      role: 'TU',
    },
    {
      name: 'Dr. H. Ahmad Kepsek, M.Pd.',
      email: 'kepsek@sekolah.com',
      password: 'password123',
      role: 'KEPSEK',
    },
    {
      name: 'Siti Rahmawati, S.Pd. (Wali Kelas)',
      email: 'walikelas@sekolah.com',
      password: 'password123',
      role: 'WALI_KELAS',
      waliKelasOf: 'X RPL 1',
    },
    {
      name: 'Budi Guru Pengajar, M.Kom',
      email: 'guru@sekolah.com',
      password: 'password123',
      role: 'TEACHER',
    },
    {
      name: 'Waka Kurikulum',
      email: 'waka.kurikulum@sekolah.com',
      password: 'password123',
      role: 'WAKA_KURIKULUM',
    },
    {
      name: 'Waka Kesiswaan',
      email: 'waka.kesiswaan@sekolah.com',
      password: 'password123',
      role: 'WAKA_KESISWAAN',
    },
    {
      name: 'Waka Sarana & Prasarana',
      email: 'waka.sarpras@sekolah.com',
      password: 'password123',
      role: 'WAKA_SARPRAS',
    },
    {
      name: 'Waka Hubungan Industri (Hubdin)',
      email: 'waka.hubdin@sekolah.com',
      password: 'password123',
      role: 'WAKA_HUBDIN',
    },
    {
      name: 'Andi Pratama (Siswa)',
      email: 'siswa@sekolah.com',
      password: 'password123',
      role: 'STUDENT',
      studentClass: 'X RPL 1',
      nipOrNis: '20241001',
    },
  ];

  for (const u of usersToSeed) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        role: u.role,
        password: u.password,
        waliKelasOf: u.waliKelasOf || null,
        studentClass: u.studentClass || null,
        nipOrNis: u.nipOrNis || null,
      },
      create: u,
    });
  }

  console.log('Seed executed successfully with all roles & classroom barcodes!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
