import { chmod, writeFile } from 'node:fs/promises';
import { PrismaClient } from '@prisma/client';
import { generateDemoDataset } from '../src/lib/demo-dataset.mjs';
import { importDemoDataset, type DemoDataset } from '../src/lib/demo-import.ts';

const prisma = new PrismaClient();
const credentialsPath = '/tmp/nesaka-demo-credentials.csv';

try {
  const dataset = generateDemoDataset() as DemoDataset;
  const result = await importDemoDataset(prisma, dataset);
  if (result.credentialsCount > 0) {
    await writeFile(credentialsPath, `\uFEFF${result.credentialsCsv}`, { mode: 0o600 });
    await chmod(credentialsPath, 0o600);
  }
  console.log(JSON.stringify({
    classroomsCreated: result.classroomsCreated,
    teachersCreated: result.teachersCreated,
    studentsCreated: result.studentsCreated,
    schedulesCreated: result.schedulesCreated,
    credentialFile: result.credentialsCount > 0 ? credentialsPath : null,
    credentialsCount: result.credentialsCount,
  }));
} catch (error) {
  console.error('Demo data import failed:', error instanceof Error ? error.message : 'Unknown error');
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
