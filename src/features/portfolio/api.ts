import { request } from "../../lib/api";

export type PublicTag = {
  id: string;
  name: string;
  slug: string;
  color: string | null;
};

export type PublicTechnology = {
  id: string;
  name: string;
  icon: string;
  category: string;
  order: number;
};

export type PublicProjectImage = {
  id: string;
  image: string;
  caption: string | null;
  order: number;
};

export type PublicProject = {
  id: string;
  title: string;
  description: string;
  image: string;
  metric: string | null;
  demoUrl: string | null;
  githubUrl: string | null;
  featured: boolean;
  order: number;
  tags: PublicTag[];
  technologies: PublicTechnology[];
  images: PublicProjectImage[];
};

export type PublicExperience = {
  id: string;
  title: string;
  company: string;
  companyLogo: string | null;
  location: string | null;
  startDate: string;
  endDate: string | null;
  description: string;
  order: number;
  technologies: PublicTechnology[];
};

export type PublicTestimonial = {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string | null;
  content: string;
  rating: number;
  featured: boolean;
  order: number;
};

export type PublicProfile = {
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
};

export type PublicGalleryImage = {
  id: string;
  title: string | null;
  image: string;
  order: number;
};

export const fetchProfile = () =>
  request<PublicProfile>("/profile", { auth: false });

export const fetchProjects = () =>
  request<PublicProject[]>("/projects", { auth: false });

export const fetchTechnologies = () =>
  request<PublicTechnology[]>("/technologies", { auth: false });

export const fetchExperiences = () =>
  request<PublicExperience[]>("/experiences", { auth: false });

export const fetchTestimonials = () =>
  request<PublicTestimonial[]>("/testimonials", { auth: false });

export const fetchGallery = () =>
  request<PublicGalleryImage[]>("/gallery", { auth: false });

export type ContactMessagePayload = {
  name: string;
  email: string;
  message: string;
};

export const sendContactMessage = (payload: ContactMessagePayload) =>
  request<{ id: string }>("/contact", {
    method: "POST",
    body: payload,
    auth: false,
  });
