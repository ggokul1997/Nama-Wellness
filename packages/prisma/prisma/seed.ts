/// <reference types="node" />
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const adminEmail = 'admin@namawellness.com';
  const adminPasswordHash = await bcrypt.hash('Admin@Nama2026', 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: adminPasswordHash,
      emailVerified: true,
      status: 'active',
      profile: {
        create: {
          firstName: 'Platform',
          lastName: 'Admin',
          timezone: 'Asia/Kolkata'
        }
      },
      roles: {
        create: {
          role: 'admin',
          productVariant: 'edpro'
        }
      }
    }
  });

  console.log(`Seeded default admin user: ${admin.email}`);

  const testCompany = await prisma.company.upsert({
    where: { companyCode: 'ACME2026' },
    update: {},
    create: {
      name: 'Acme Corp',
      companyCode: 'ACME2026',
      employeeLimit: 25,
      contactEmail: 'contact@acme.com',
      status: 'active'
    }
  });
  console.log('Seeded test company: ACME2026');
  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
