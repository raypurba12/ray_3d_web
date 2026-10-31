import type {
  TExperience,
  TNavLink,
  TProject,
  TTechnology,
  TTestimonial,
} from "../types";

export const navigation: TNavLink[] = [
  { id: "about", title: "About" },
  { id: "experience", title: "Experience" },
  { id: "tech", title: "Tech" },
  { id: "work", title: "Work" },
  { id: "gallery", title: "Gallery" },
  { id: "contact", title: "Contact" },
];

// CMS-driven content. These stay empty so the site never shows invented work;
// real entries are loaded from the API and cached locally for offline visits.
export const techStack: TTechnology[] = [];
export const experiences: TExperience[] = [];
export const testimonials: TTestimonial[] = [];
export const projects: TProject[] = [];
