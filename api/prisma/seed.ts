import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/password';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await hashPassword('admin123');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@raypurba.com' },
    update: {},
    create: {
      email: 'admin@raypurba.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'SUPER_ADMIN',
    },
  });
  console.log('✅ Created admin user:', admin.email);
  console.log('   📧 Email: admin@raypurba.com');
  console.log('   🔑 Password: admin123');

  // Create profile
  await prisma.profile.upsert({
    where: { id: 'profile' },
    update: {},
    create: {
      id: 'profile',
      name: 'Ray Purba',
      tagline: 'Full Stack Developer & 3D Web Specialist',
      bio: 'Passionate developer specializing in creating immersive 3D web experiences with React, Three.js, and modern web technologies.',
      avatar: '/avatar.jpg',
      email: 'hello@raypurba.com',
      location: 'Indonesia',
      github: 'https://github.com/raypurba',
      linkedin: 'https://linkedin.com/in/raypurba',
      twitter: 'https://twitter.com/raypurba',
      website: 'https://raypurba.com',
    },
  });
  console.log('✅ Created profile');

  // Create technologies
  const technologies = [
    { name: 'React', icon: '/tech/react.png', category: 'FRONTEND', order: 1 },
    { name: 'TypeScript', icon: '/tech/typescript.png', category: 'FRONTEND', order: 2 },
    { name: 'Three.js', icon: '/tech/threejs.svg', category: 'FRONTEND', order: 3 },
    { name: 'Node.js', icon: '/tech/nodejs.png', category: 'BACKEND', order: 4 },
    { name: 'Express', icon: '/tech/express.png', category: 'BACKEND', order: 5 },
    { name: 'MySQL', icon: '/tech/mysql.png', category: 'DATABASE', order: 6 },
    { name: 'Prisma', icon: '/tech/prisma.png', category: 'BACKEND', order: 7 },
    { name: 'Tailwind CSS', icon: '/tech/tailwind.png', category: 'FRONTEND', order: 8 },
  ];

  for (const tech of technologies) {
    await prisma.technology.upsert({
      where: { name: tech.name },
      update: {},
      create: tech,
    });
  }
  console.log('✅ Created', technologies.length, 'technologies');

  // Create tags
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
  console.log('✅ Created', tags.length, 'tags');

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
