import { PrismaClient, Prisma } from '../index';
const prisma = new PrismaClient();

async function main() {
  await prisma.school.upsert({
    where: { id: 'U2Nob29sLTEyMzI=' },
    create: { id: 'U2Nob29sLTEyMzI=', name: 'The University of North Carolina at Chapel Hill' },
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
