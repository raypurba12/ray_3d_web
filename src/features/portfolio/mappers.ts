import {
  css,
  docker,
  figma,
  git,
  html,
  javascript,
  mongodb,
  nodejs,
  reactjs,
  redux,
  tailwind,
  threejs,
  typescript,
} from "../../assets";
import { resolveAssetUrl } from "../../lib/api";
import type {
  TExperience,
  TGalleryImage,
  TProject,
  TTechnology,
  TTestimonial,
} from "../../types";
import type {
  PublicExperience,
  PublicGalleryImage,
  PublicProfile,
  PublicProject,
  PublicTechnology,
  PublicTestimonial,
} from "./api";

export type PortfolioProfile = {
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

const BUNDLED_TECH_ICONS: Record<string, string> = {
  html: html,
  html5: html,
  css: css,
  css3: css,
  javascript: javascript,
  js: javascript,
  typescript: typescript,
  ts: typescript,
  react: reactjs,
  reactjs: reactjs,
  redux: redux,
  reduxtoolkit: redux,
  tailwind: tailwind,
  tailwindcss: tailwind,
  node: nodejs,
  nodejs: nodejs,
  mongodb: mongodb,
  three: threejs,
  threejs: threejs,
  git: git,
  figma: figma,
  docker: docker,
};

const normalizeName = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]/g, "");

const escapeXml = (value: string) =>
  value.replace(/[<>&'"]/g, (char) => {
    switch (char) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      default:
        return "&quot;";
    }
  });

// Custom technologies without a bundled/uploaded icon get a deterministic
// initials badge instead of an unrelated placeholder image.
const initialsIcon = (name: string) => {
  const letters =
    name
      .trim()
      .split(/\s+/)
      .map((word) => word.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  let hash = 0;
  for (const char of name) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  const hue = hash % 360;
  const fontSize = letters.length > 1 ? 46 : 56;

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">` +
    `<rect width="128" height="128" rx="28" fill="hsl(${hue},55%,15%)"/>` +
    `<rect x="5" y="5" width="118" height="118" rx="24" fill="none" stroke="hsl(${hue},85%,62%)" stroke-opacity="0.4" stroke-width="3"/>` +
    `<text x="64" y="66" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="700" fill="hsl(${hue},90%,68%)" text-anchor="middle" dominant-baseline="central">${escapeXml(letters)}</text>` +
    `</svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

const resolveTechnologyIcon = (technology: PublicTechnology) => {
  const icon = technology.icon.trim();

  if (/^(https?:|data:|\/uploads\/)/i.test(icon)) {
    return resolveAssetUrl(icon);
  }

  return (
    BUNDLED_TECH_ICONS[normalizeName(technology.name)] ??
    BUNDLED_TECH_ICONS[normalizeName(icon)] ??
    initialsIcon(technology.name)
  );
};

const byOrder = <T extends { order?: number }>(a: T, b: T) =>
  (a.order ?? 0) - (b.order ?? 0);

export const mapTechnology = (
  technology: PublicTechnology
): TTechnology => ({
  name: technology.name,
  icon: resolveTechnologyIcon(technology),
  order: technology.order,
  category: technology.category,
});

export const mapTechnologies = (
  technologies: PublicTechnology[]
): TTechnology[] => technologies.map(mapTechnology).sort(byOrder);

export const mapProject = (project: PublicProject): TProject => ({
  id: project.id,
  name: project.title,
  description: project.description,
  tags: project.tags.map((tag) => ({
    name: tag.name,
    color: tag.color ?? "",
  })),
  image: project.image ? resolveAssetUrl(project.image) : "",
  sourceCodeLink: project.githubUrl ?? "",
  liveDemoLink: project.demoUrl ?? undefined,
  videoLink: project.videoUrl ? resolveAssetUrl(project.videoUrl) : undefined,
  metric: project.metric ?? undefined,
  featured: project.featured,
  order: project.order,
  technologies: mapTechnologies(project.technologies ?? []),
  images: project.images?.map((image) => ({
    id: image.id,
    image: resolveAssetUrl(image.image),
    caption: image.caption ?? "",
  })),
});

export const mapProjects = (projects: PublicProject[]): TProject[] =>
  projects.map(mapProject).sort(byOrder);

const formatMonth = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
};

const formatDateRange = (startDate: string, endDate: string | null) =>
  `${formatMonth(startDate)} – ${endDate ? formatMonth(endDate) : "Present"}`;

const toPoints = (description: string) => {
  const lines = description
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);

  if (lines.length > 1) return lines;

  const source = lines[0] ?? description.trim();
  const sentences = source
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  return sentences.length > 0 ? sentences : [source];
};

export const mapExperience = (
  experience: PublicExperience
): TExperience => ({
  title: experience.title,
  companyName: experience.company,
  icon: experience.companyLogo
    ? resolveAssetUrl(experience.companyLogo)
    : "",
  iconBg: "#121216",
  date: formatDateRange(experience.startDate, experience.endDate),
  points: toPoints(experience.description),
  order: experience.order,
});

export const mapExperiences = (
  experiences: PublicExperience[]
): TExperience[] => experiences.map(mapExperience).sort(byOrder);

export const mapTestimonial = (
  testimonial: PublicTestimonial
): TTestimonial => ({
  testimonial: testimonial.content,
  name: testimonial.name,
  designation: testimonial.role,
  company: testimonial.company,
  image: testimonial.avatar ? resolveAssetUrl(testimonial.avatar) : "",
  rating: testimonial.rating,
  featured: testimonial.featured,
  order: testimonial.order,
});

export const mapTestimonials = (
  testimonials: PublicTestimonial[]
): TTestimonial[] => testimonials.map(mapTestimonial).sort(byOrder);

export const mapProfile = (profile: PublicProfile): PortfolioProfile => ({
  name: profile.name,
  tagline: profile.tagline,
  bio: profile.bio,
  avatar: profile.avatar ? resolveAssetUrl(profile.avatar) : "",
  resumeUrl: profile.resumeUrl ? resolveAssetUrl(profile.resumeUrl) : "",
  email: profile.email,
  phone: profile.phone ?? "",
  location: profile.location ?? "",
  github: profile.github ?? "",
  linkedin: profile.linkedin ?? "",
  twitter: profile.twitter ?? "",
  website: profile.website ?? "",
});

export const mapGallery = (
  images: PublicGalleryImage[]
): TGalleryImage[] =>
  images
    .map((image) => ({
      id: image.id,
      title: image.title ?? "",
      image: resolveAssetUrl(image.image),
      order: image.order,
    }))
    .sort(byOrder);
