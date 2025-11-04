const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const saltRounds = 10;

  const admins = [
    {
      adminId: '0519',
      password: '@admin2025',
      role: 'admin',
    },
    {
      adminId: '0520',
      password: '@superadmin2025',
      role: 'superadmin',
    },
    {
      adminId: '0521',
      password: '@workassigned2025',
      role: 'workassigned',
    },
    {
      adminId: '0522',
      password: '@recieve2025',
      role: 'applicationreceive',
    },
  ];

  for (const admin of admins) {
    const hashedPassword = await bcrypt.hash(admin.password, saltRounds);
    await prisma.admin.upsert({
      where: { adminId: admin.adminId },
      update: {},
      create: {
        adminId: admin.adminId,
        password: hashedPassword,
        role: admin.role,
      },
    });
  }

  console.log('Admins seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });