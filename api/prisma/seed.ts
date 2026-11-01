import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { passwordSchema } from '../src/schemas/auth.schema';
import { hashPassword } from '../src/utils/password';

const prisma = new PrismaClient();

const isProduction = process.env.NODE_ENV === 'production';

const readAdminCredentials = () => {
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;

  if (isProduction && (!email || !password)) {
    throw new Error(
      'ADMIN_EMAIL and ADMIN_PASSWORD are required to seed in production.'
    );
  }

  if (!email || !password) {
    throw new Error(
      'Set ADMIN_EMAIL and ADMIN_PASSWORD before seeding (see .env.example).'
    );
  }

  const passwordCheck = passwordSchema.safeParse(password);

  if (!passwordCheck.success) {
    throw new Error(
      `ADMIN_PASSWORD is too weak: ${passwordCheck.error.issues[0]?.message ?? 'invalid password'}`
    );
  }

  return { email, password };
};

async function main() {
  console.log('Seeding database...');

  const { email, password } = readAdminCredentials();
  const adminPassword = await hashPassword(password);
  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: adminPassword,
      name: 'Admin User',
      role: 'SUPER_ADMIN',
    },
  });
  console.log(`Admin user ready: ${admin.email}`);

  await prisma.profile.upsert({
    where: { id: 'profile' },
    update: {},
    create: {
      id: 'profile',
      name: 'Ray Purba',
      tagline: 'Full Stack Developer & 3D Web Specialist',
      bio: 'Passionate developer specializing in creating immersive 3D web experiences with React, Three.js, and modern web technologies.',
      avatar: '',
      email: '',
      location: 'Indonesia',
      github: '',
      linkedin: '',
      twitter: '',
      website: '',
    },
  });
  console.log('Profile record ready');

  const technologies = [
    { name: 'React', icon: 'react', category: 'FRONTEND', order: 1 },
    { name: 'TypeScript', icon: 'typescript', category: 'FRONTEND', order: 2 },
    { name: 'Three.js', icon: 'threejs', category: 'FRONTEND', order: 3 },
    { name: 'Node.js', icon: 'nodejs', category: 'BACKEND', order: 4 },
    { name: 'Express', icon: 'express', category: 'BACKEND', order: 5 },
    { name: 'MySQL', icon: 'mysql', category: 'DATABASE', order: 6 },
    { name: 'Prisma', icon: 'prisma', category: 'BACKEND', order: 7 },
    { name: 'Tailwind CSS', icon: 'tailwind', category: 'FRONTEND', order: 8 },
  ];

  for (const tech of technologies) {
    await prisma.technology.upsert({
      where: { name: tech.name },
      update: { icon: tech.icon, order: tech.order },
      create: tech,
    });
  }
  console.log(`Technologies ready: ${technologies.length}`);

  const tags = [
    { name: 'Web Development', slug: 'web-dev', color: '#3b82f6' },
    { name: '3D Graphics', slug: '3d-graphics', color: '#10b981' },
    { name: 'Full Stack', slug: 'full-stack', color: '#8b5cf6' },
    { name: 'Frontend', slug: 'frontend', color: '#f59e0b' },
    { name: 'Backend', slug: 'backend', color: '#ef4444' },
  ];

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    });
  }
  console.log(`Tags ready: ${tags.length}`);

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
