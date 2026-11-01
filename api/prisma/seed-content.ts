import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { slugify } from '../src/utils/slug';

const prisma = new PrismaClient();

const TAG_COLORS: Record<string, string> = {
  'Pengembangan Web': '#3b82f6',
  'Grafik 3D': '#10b981',
  'Full Stack': '#8b5cf6',
  Frontend: '#f59e0b',
  Backend: '#ef4444',
  'Integrasi API': '#06b6d4',
  Pencarian: '#a855f7',
  'Desain UI': '#ec4899',
  'Visualisasi Data': '#14b8a6',
  WebGL: '#d4ff00',
};

const TECHNOLOGIES = [
  { name: 'React', icon: 'react', category: 'FRONTEND', order: 1 },
  { name: 'TypeScript', icon: 'typescript', category: 'FRONTEND', order: 2 },
  {
    name: 'JavaScript',
    icon: '/uploads/1793382884749-b0740f9c-df67-474f-9e35-5125d42c7c74.png',
    category: 'FRONTEND',
    order: 3,
  },
  { name: 'Three.js', icon: 'threejs', category: 'FRONTEND', order: 4 },
  {
    name: 'HTML 5',
    icon: '/uploads/1793382884686-b372ba5c-2d80-4022-aa1e-3b92900cd12e.png',
    category: 'FRONTEND',
    order: 5,
  },
  {
    name: 'CSS 3',
    icon: '/uploads/1793382884720-a3a61cfa-3c15-4f4a-8f92-98ecb1cc8e86.png',
    category: 'FRONTEND',
    order: 6,
  },
  {
    name: 'Redux Toolkit',
    icon: '/uploads/1793382884834-3f2adca9-426b-46c1-84c2-eab732f9696e.png',
    category: 'FRONTEND',
    order: 7,
  },
  { name: 'Tailwind CSS', icon: 'tailwind', category: 'FRONTEND', order: 8 },
  {
    name: 'Figma',
    icon: '/uploads/1793382885056-2f24d9a9-893b-47cb-ba5f-3b6d7b36d26b.png',
    category: 'DESIGN',
    order: 9,
  },
  { name: 'Node.js', icon: 'nodejs', category: 'BACKEND', order: 10 },
  { name: 'Express', icon: 'express', category: 'BACKEND', order: 11 },
  { name: 'Prisma', icon: 'prisma', category: 'BACKEND', order: 12 },
  { name: 'MySQL', icon: 'mysql', category: 'DATABASE', order: 13 },
  {
    name: 'MongoDB',
    icon: '/uploads/1793382884961-d2814d85-9bcc-4a2c-85c3-044116b94e7d.png',
    category: 'DATABASE',
    order: 14,
  },
  {
    name: 'Git',
    icon: '/uploads/1793382885004-26f7f762-0d56-4765-95ed-63722bb47e68.png',
    category: 'DEVOPS',
    order: 15,
  },
  {
    name: 'Docker',
    icon: '/uploads/1793382885029-547f0187-b395-487d-9daf-1bdcd78c699f.png',
    category: 'DEVOPS',
    order: 16,
  },
] as const;

type ProjectSeed = {
  title: string;
  aliases?: string[];
  description: string;
  image: string;
  metric: string;
  demoUrl: string | null;
  githubUrl: string | null;
  featured: boolean;
  order: number;
  tags: string[];
  technologies: string[];
};

const PROJECTS: ProjectSeed[] = [
  {
    title: 'Morent — Platform Rental Mobil',
    aliases: ['Morent — Car Rental Platform'],
    description:
      'Platform rental mobil dengan katalog kendaraan yang responsif, filter lanjutan, alur pemesanan yang jelas, dan antarmuka gelap yang cepat serta mudah diakses.',
    image: '/uploads/seed-project-morent.webp',
    metric: 'Responsif penuh • Skor Lighthouse 98',
    demoUrl: null,
    githubUrl: 'https://github.com/raypurba',
    featured: true,
    order: 0,
    tags: ['Pengembangan Web', 'Frontend', 'Desain UI'],
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Figma'],
  },
  {
    title: 'JobIt — Aplikasi Pencarian Kerja',
    aliases: ['JobIt — Job Discovery App'],
    description:
      'Aplikasi pencarian kerja yang menggabungkan lowongan dari berbagai sumber, dilengkapi pencarian global, filter lokasi, dan pengalaman jelajah yang fokus tanpa distraksi.',
    image: '/uploads/seed-project-jobit.webp',
    metric: 'Pencarian multi-sumber • Filter instan',
    demoUrl: null,
    githubUrl: 'https://github.com/raypurba',
    featured: false,
    order: 1,
    tags: ['Pengembangan Web', 'Frontend', 'Integrasi API', 'Pencarian'],
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Node.js'],
  },
  {
    title: 'TripGuide — Perencana Perjalanan AI',
    aliases: ['TripGuide — AI Travel Planner'],
    description:
      'Perencana perjalanan berbantuan AI yang menyusun itinerary personal, merangkum wawasan destinasi, dan menyatukan riset yang tersebar dalam satu alur terpandu.',
    image: '/uploads/seed-project-tripguide.webp',
    metric: 'Itinerary AI • Integrasi peta',
    demoUrl: null,
    githubUrl: 'https://github.com/raypurba',
    featured: false,
    order: 2,
    tags: ['Pengembangan Web', 'Full Stack', 'Grafik 3D'],
    technologies: ['React', 'Node.js', 'Three.js', 'MongoDB'],
  },
  {
    title: 'Nusantara Atlas — Peta 3D Interaktif',
    description:
      'Eksplorasi kepulauan Indonesia dalam peta 3D interaktif. Pengguna dapat memutar globe, memilih wilayah, dan melihat ringkasan data geografis dengan animasi yang halus di desktop maupun mobile.',
    image: '/uploads/seed-project-nusantara-atlas.webp',
    metric: 'WebGL • 60 FPS di desktop',
    demoUrl: null,
    githubUrl: 'https://github.com/raypurba',
    featured: true,
    order: 3,
    tags: ['Grafik 3D', 'WebGL', 'Visualisasi Data'],
    technologies: ['Three.js', 'React', 'TypeScript', 'Tailwind CSS'],
  },
  {
    title: 'Orbit — Dashboard Analitik SaaS',
    description:
      'Dashboard analitik untuk memantau metrik produk secara real-time: ringkasan KPI, tren harian, dan tabel aktivitas dengan visualisasi ringan serta navigasi yang konsisten.',
    image: '/uploads/seed-project-orbit-analytics.webp',
    metric: 'Real-time • 12 metrik utama',
    demoUrl: null,
    githubUrl: 'https://github.com/raypurba',
    featured: false,
    order: 4,
    tags: ['Pengembangan Web', 'Full Stack', 'Visualisasi Data', 'Backend'],
    technologies: ['React', 'TypeScript', 'Node.js', 'Express', 'Prisma', 'MySQL'],
  },
];

type ExperienceSeed = {
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string | null;
  description: string;
  order: number;
  technologies: string[];
};

const EXPERIENCES: ExperienceSeed[] = [
  {
    title: 'Freelance Full Stack Developer',
    company: 'Self-Employed',
    location: 'Jambi, Indonesia',
    startDate: '2023-06-01',
    endDate: null,
    description:
      'Membangun website portfolio interaktif dan company profile menggunakan React, TypeScript, dan Three.js.\nMengembangkan CMS admin berbasis Express, Prisma, dan MySQL untuk mengelola seluruh konten situs.\nMenerapkan optimasi performa WebGL dan aksesibilitas agar situs tetap ringan di perangkat mobile.',
    order: 0,
    technologies: [
      'React',
      'TypeScript',
      'Three.js',
      'Node.js',
      'Express',
      'Prisma',
      'MySQL',
      'Tailwind CSS',
    ],
  },
  {
    title: 'Sarjana Komputer',
    company: 'Universitas Dinamika Bangsa',
    location: 'Jambi',
    startDate: '2022-09-26',
    endDate: '2026-03-03',
    description:
      'Menempuh pendidikan S.Kom. dengan fokus pada rekayasa perangkat lunak, basis data, dan pemrograman web.\nMenggabungkan kemampuan analisis dan pemecahan masalah untuk merancang arsitektur aplikasi yang terstruktur.',
    order: 1,
    technologies: [],
  },
  {
    title: 'Web Developer — Proyek Klien',
    company: 'Berbagai Klien',
    location: 'Remote',
    startDate: '2022-01-01',
    endDate: '2023-05-31',
    description:
      'Mengembangkan landing page dan company profile untuk UMKM dan komunitas.\nMenerjemahkan kebutuhan klien menjadi antarmuka responsif dengan HTML, CSS, JavaScript, dan React.\nMenjaga komunikasi, revisi, dan serah terima proyek secara mandiri.',
    order: 2,
    technologies: ['React', 'JavaScript', 'HTML 5', 'CSS 3', 'Node.js'],
  },
];

const TESTIMONIALS = [
  {
    name: 'Rizky Pratama',
    role: 'Product Lead',
    company: 'Studio Nusantara',
    content:
      'Ray mampu menerjemahkan brief yang rumit menjadi pengalaman 3D yang halus dan mudah dipakai. Perhatiannya pada detail performa membuat produk kami tetap ringan di berbagai perangkat.',
    rating: 5,
    featured: true,
    order: 0,
  },
  {
    name: 'Nadia Kusuma',
    role: 'Founder',
    company: 'Karya Digital',
    content:
      'Kerja sama dengan Ray sangat terstruktur. Ia tidak hanya mengeksekusi desain, tetapi juga mengusulkan perbaikan arsitektur frontend yang membuat rilis berikutnya jauh lebih cepat.',
    rating: 5,
    featured: true,
    order: 1,
  },
  {
    name: 'Bagas Saputra',
    role: 'CTO',
    company: 'Orbit Labs',
    content:
      'Dashboard yang dibangun Ray stabil, rapi, dan mudah dikembangkan. Dokumentasi serta struktur kodenya memudahkan tim kami untuk melanjutkan pekerjaan.',
    rating: 5,
    featured: false,
    order: 2,
  },
  {
    name: 'Sarah Lim',
    role: 'Design Director',
    company: 'Lumen Studio',
    content:
      'Jarang ada engineer yang sama kuat dalam matematika WebGL dan arsitektur React yang bersih. Ray adalah design engineer yang lengkap.',
    rating: 5,
    featured: false,
    order: 3,
  },
];

const GALLERY = [
  { title: 'Studi Antarmuka Web', image: '/uploads/1793382885496-d0f5b3a3-7989-45f1-85fb-49b2c9746fef.png', order: 0 },
  { title: 'Studi Antarmuka Mobile', image: '/uploads/1793382885525-84028414-9568-423a-880b-96c0f3879102.png', order: 1 },
  { title: 'Arsitektur Backend', image: '/uploads/1793382885557-149ce8d0-6eca-4e57-afb1-b45c9e92ff2d.png', order: 2 },
  { title: 'Arah Kreatif', image: '/uploads/1793382885580-66033248-d539-42c1-89b9-82ab91217989.png', order: 3 },
  { title: 'Dunia 3D Imersif', image: '/uploads/seed-gallery-immersive.webp', order: 4 },
];

const findProject = (project: ProjectSeed) =>
  prisma.project.findFirst({
    where: {
      title: { in: [project.title, ...(project.aliases ?? [])] },
    },
  });

async function seedProfile() {
  const profile = {
    name: 'Ray Purba',
    tagline: 'Pengembang Kreatif & Arsitek WebGL',
    bio:
      'Pengembang kreatif yang berfokus pada pengalaman web 3D imersif, arsitektur frontend yang tangguh, dan interaksi yang terasa hidup. Berpengalaman membangun aplikasi React + TypeScript serta memadukan Three.js/WebGL dengan CMS kustom berbasis Express, Prisma, dan MySQL.\nSaya senang mengubah ide yang kompleks menjadi produk digital yang cepat, aksesibel, dan menyenangkan dipakai.',
    avatar: '/uploads/1793378932917-7c34bce8-4966-43f6-8609-5c837f900951.jpg',
    resumeUrl: '/uploads/1793380974675-d2722cbc-db2b-4c29-9dce-061677d0f8bd.pdf',
    email: 'hello@raypurba.com',
    phone: null,
    location: 'Jambi, Indonesia',
    github: 'https://github.com/raypurba',
    linkedin: 'https://linkedin.com/in/raypurba',
    twitter: 'https://twitter.com/raypurba',
    website: 'https://raypurba.my.id',
  };

  await prisma.profile.upsert({
    where: { id: 'profile' },
    update: profile,
    create: { id: 'profile', ...profile },
  });
}

async function seedTechnologies() {
  for (const technology of TECHNOLOGIES) {
    await prisma.technology.upsert({
      where: { name: technology.name },
      update: {
        icon: technology.icon,
        category: technology.category,
        order: technology.order,
      },
      create: technology,
    });
  }
}

async function seedProjects() {
  const technologyIds = new Map(
    (await prisma.technology.findMany({ select: { id: true, name: true } })).map(
      (technology) => [technology.name, technology.id]
    )
  );

  const resolveTechnologyIds = (names: string[]) =>
    names.map((name) => {
      const id = technologyIds.get(name);
      if (!id) throw new Error(`Teknologi tidak ditemukan: ${name}`);
      return id;
    });

  const tagIds = new Map<string, string>();

  for (const name of Object.keys(TAG_COLORS)) {
    const tag = await prisma.tag.upsert({
      where: { name },
      update: { color: TAG_COLORS[name] },
      create: { name, slug: slugify(name), color: TAG_COLORS[name] },
    });
    tagIds.set(name, tag.id);
  }

  for (const project of PROJECTS) {
    const existing = await findProject(project);
    const base = {
      title: project.title,
      description: project.description,
      image: project.image,
      metric: project.metric,
      demoUrl: project.demoUrl,
      githubUrl: project.githubUrl,
      featured: project.featured,
      order: project.order,
    };
    const tagConnect = project.tags.map((name) => ({
      id: tagIds.get(name) as string,
    }));
    const technologyConnect = resolveTechnologyIds(project.technologies).map(
      (id) => ({ id })
    );

    if (existing) {
      await prisma.project.update({
        where: { id: existing.id },
        data: {
          ...base,
          tags: { set: tagConnect },
          technologies: { set: technologyConnect },
        },
      });
    } else {
      await prisma.project.create({
        data: {
          ...base,
          tags: { connect: tagConnect },
          technologies: { connect: technologyConnect },
        },
      });
    }
  }

  // Tag yang tidak lagi dipakai proyek mana pun hanya menyisakan noise di CMS.
  await prisma.tag.deleteMany({ where: { projects: { none: {} } } });
}

async function seedExperiences() {
  const technologyIds = new Map(
    (await prisma.technology.findMany({ select: { id: true, name: true } })).map(
      (technology) => [technology.name, technology.id]
    )
  );

  const resolveTechnologyIds = (names: string[]) =>
    names.map((name) => {
      const id = technologyIds.get(name);
      if (!id) throw new Error(`Teknologi tidak ditemukan: ${name}`);
      return id;
    });

  for (const experience of EXPERIENCES) {
    const data = {
      title: experience.title,
      company: experience.company,
      location: experience.location,
      startDate: new Date(experience.startDate),
      endDate: experience.endDate ? new Date(experience.endDate) : null,
      description: experience.description,
      order: experience.order,
      companyLogo: null,
    };
    const technologies = resolveTechnologyIds(experience.technologies).map(
      (id) => ({ id })
    );
    const existing = await prisma.experience.findFirst({
      where: { title: experience.title, company: experience.company },
    });

    if (existing) {
      await prisma.experience.update({
        where: { id: existing.id },
        data: { ...data, technologies: { set: technologies } },
      });
    } else {
      await prisma.experience.create({
        data: { ...data, technologies: { connect: technologies } },
      });
    }
  }
}

async function seedTestimonials() {
  for (const testimonial of TESTIMONIALS) {
    const existing = await prisma.testimonial.findFirst({
      where: { order: testimonial.order },
    });

    if (existing) {
      await prisma.testimonial.update({
        where: { id: existing.id },
        data: testimonial,
      });
    } else {
      await prisma.testimonial.create({ data: testimonial });
    }
  }
}

async function seedGallery() {
  for (const image of GALLERY) {
    const existing = await prisma.galleryImage.findFirst({
      where: { order: image.order },
    });

    if (existing) {
      await prisma.galleryImage.update({
        where: { id: existing.id },
        data: image,
      });
    } else {
      await prisma.galleryImage.create({ data: image });
    }
  }
}

async function main() {
  console.log('Mengisi konten portfolio (Bahasa Indonesia)...');

  await seedProfile();
  console.log('Profil diperbarui');

  await seedTechnologies();
  console.log(`Teknologi siap: ${TECHNOLOGIES.length}`);

  await seedProjects();
  console.log(`Proyek siap: ${PROJECTS.length}`);

  await seedExperiences();
  console.log(`Pengalaman siap: ${EXPERIENCES.length}`);

  await seedTestimonials();
  console.log(`Testimoni siap: ${TESTIMONIALS.length}`);

  await seedGallery();
  console.log(`Galeri siap: ${GALLERY.length}`);

  const [projects, experiences, testimonials, gallery, tags] = await Promise.all([
    prisma.project.count(),
    prisma.experience.count(),
    prisma.testimonial.count(),
    prisma.galleryImage.count(),
    prisma.tag.count(),
  ]);

  console.log(
    `Selesai — proyek: ${projects}, pengalaman: ${experiences}, testimoni: ${testimonials}, galeri: ${gallery}, tag: ${tags}`
  );
}

main()
  .catch((error) => {
    console.error('Seed konten gagal:', error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
