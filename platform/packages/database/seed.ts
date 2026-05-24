import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting migration seed...');

  // Read the legacy landingPageData.json
  const dataPath = path.join(__dirname, '../../../../src/data/landingPageData.json');
  if (!fs.existsSync(dataPath)) {
    console.warn(`Legacy data not found at ${dataPath}. Skipping migration.`);
    return;
  }

  const legacyData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  // 1. Create the Default Tenant
  const tenant = await prisma.tenant.upsert({
    where: { domain: 'conquerorfitness.com' },
    update: {},
    create: {
      name: 'Conqueror Fitness Hub',
      domain: 'conquerorfitness.com',
      status: 'active',
    },
  });

  console.log(`Configured Tenant: ${tenant.name} (${tenant.id})`);

  // 2. Migrate the Landing Page into the CMS Schema
  const page = await prisma.cmsPage.upsert({
    where: {
      tenantId_slug: {
        tenantId: tenant.id,
        slug: 'landing-page',
      },
    },
    update: {},
    create: {
      tenantId: tenant.id,
      slug: 'landing-page',
      title: legacyData.siteMeta?.title || 'Conqueror Fitness Landing Page',
      isPublished: true,
    },
  });

  // 3. Create an initial Revision with the legacy data
  await prisma.cmsRevision.create({
    data: {
      pageId: page.id,
      content: legacyData, // Pushing the entire JSON block into the JSONB column
      authorId: 'system_migration',
    },
  });

  console.log(`Migrated landing page data into CmsPage (${page.slug})`);
  console.log('Migration seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
