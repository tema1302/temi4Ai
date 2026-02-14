import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create Admin User
  const passwordHash = await bcrypt.hash('Mda_Archive_2026!', 10);
  await prisma.user.upsert({
    where: { username: 'admin_mda' },
    update: {},
    create: {
      username: 'admin_mda',
      passwordHash: passwordHash,
    },
  });

  const mockAlumni = [
    {
      fullName: 'Иванов Иван Иванович',
      rank: 'ierey',
      church: 'Храм Христа Спасителя',
      address: 'г. Москва, ул. Волхонка, 15',
      lat: 55.7446,
      lon: 37.6055,
      status: 'approved',
      isVerified: true,
      consentAccepted: true
    },
    {
      fullName: 'Петров Алексей Сергеевич',
      rank: 'protoierey',
      church: 'Спасо-Преображенский собор',
      address: 'г. Тверь, Соборная пл., 1',
      lat: 56.8596,
      lon: 35.9118,
      status: 'approved',
      isVerified: true,
      consentAccepted: true
    }
  ];

  for (const a of mockAlumni) {
    await prisma.alumni.create({ data: a });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
