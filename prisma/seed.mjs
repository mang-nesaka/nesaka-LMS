import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create an Admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sekolah.com' },
    update: {},
    create: {
      name: 'Administrator',
      email: 'admin@sekolah.com',
      password: 'password123', // In production, this should be hashed!
      role: 'ADMIN',
    },
  });

  // Create a Teacher user
  const teacher = await prisma.user.upsert({
    where: { email: 'guru@sekolah.com' },
    update: {},
    create: {
      name: 'Budi Guru',
      email: 'guru@sekolah.com',
      password: 'password123',
      role: 'TEACHER',
    },
  });

  // Create a Student user
  const student = await prisma.user.upsert({
    where: { email: 'siswa@sekolah.com' },
    update: {},
    create: {
      name: 'Andi Siswa',
      email: 'siswa@sekolah.com',
      password: 'password123',
      role: 'STUDENT',
    },
  });

  console.log('Seed data created successfully:');
  console.log({ admin, teacher, student });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
