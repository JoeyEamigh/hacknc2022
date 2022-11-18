import { PrismaClient, Prisma } from '../index';
const prisma = new PrismaClient();

async function main() {
  await prisma.school.upsert({
    where: { rmpId: 'U2Nob29sLTEyMzI=' },
    create: { rmpId: 'U2Nob29sLTEyMzI=', name: 'The University of North Carolina at Chapel Hill' },
    update: { name: 'The University of North Carolina at Chapel Hill' },
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
