export type AdminRole = "ADMIN" | "SUPER_ADMIN";

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
};

export type AdminTag = {
  id: string;
  name: string;
  slug: string;
  color: string | null;
};

export type TechCategory =
  | "FRONTEND"
  | "BACKEND"
  | "DATABASE"
  | "DEVOPS"
  | "DESIGN"
  | "OTHER";

export type AdminTechnology = {
  id: string;
  name: string;
  icon: string;
  category: TechCategory;
  order: number;
};

export type AdminProjectImage = {
  id: string;
  image: string;
  caption: string | null;
  order: number;
};

export type AdminProject = {
  id: string;
  title: string;
  description: string;
  image: string;
  metric: string | null;
  demoUrl: string | null;
  githubUrl: string | null;
  videoUrl: string | null;
  featured: boolean;
  order: number;
  technologies: AdminTechnology[];
  tags: AdminTag[];
  images: AdminProjectImage[];
  createdAt: string;
  updatedAt: string;
};

export type ProjectPayload = {
  title: string;
  description: string;
  image: string;
  metric: string;
  demoUrl: string;
  githubUrl: string;
  videoUrl: string;
  featured: boolean;
  order: number;
  tags: string[];
  technologies: string[];
  images: { image: string; caption: string }[];
};

export type ServerIssue = {
  path?: (string | number)[];
  message?: string;
};

export type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: ServerIssue[];
};

export type UploadedAsset = {
  path: string;
  filename: string;
  storage: string;
  url: string;
};

export type AdminExperience = {
  id: string;
  title: string;
  company: string;
  companyLogo: string | null;
  location: string | null;
  startDate: string;
  endDate: string | null;
  description: string;
  order: number;
  technologies: AdminTechnology[];
  createdAt: string;
  updatedAt: string;
};

export type ExperiencePayload = {
  title: string;
  company: string;
  companyLogo: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
  order: number;
  technologies: string[];
};

export type TechnologyPayload = {
  name: string;
  icon: string;
  category: TechCategory;
  order: number;
};

export type AdminTestimonial = {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string | null;
  content: string;
  rating: number;
  featured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type TestimonialPayload = {
  name: string;
  role: string;
  company: string;
  avatar: string;
  content: string;
  rating: number;
  featured: boolean;
  order: number;
};

export type AdminGalleryImage = {
  id: string;
  title: string | null;
  image: string;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type GalleryImagePayload = {
  title: string;
  image: string;
  order: number;
};

export type AdminProfile = {
  id: string;
  name: string;
  tagline: string;
  bio: string;
  avatar: string;
  resumeUrl: string | null;
  email: string;
  phone: string | null;
  location: string | null;
  github: string | null;
  linkedin: string | null;
  twitter: string | null;
  website: string | null;
  updatedAt: string;
};

export type ProfilePayload = {
  name: string;
  tagline: string;
  bio: string;
  avatar: string;
  resumeUrl: string;
  email: string;
  phone: string;
  location: string;
  github: string;
  linkedin: string;
  twitter: string;
  website: string;
};
