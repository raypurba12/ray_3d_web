import { z } from 'zod';

const shortText = (max: number) =>
  z.string().trim().min(1, 'This field is required').max(max);

const longText = (max: number) =>
  z.string().trim().min(1, 'This field is required').max(max);

const sectionHeading = z.object({
  label: shortText(80),
  title: shortText(160),
});

export const updateSiteContentSchema = z.object({
  hero: z.object({
    badge: shortText(160),
    eyebrow: shortText(160),
    title: shortText(200),
    titleAccent: shortText(200),
    intro: longText(600),
  }),
  sections: z.object({
    about: sectionHeading.extend({ content: longText(1200) }),
    experience: sectionHeading,
    tech: sectionHeading,
    works: sectionHeading.extend({ content: longText(1200) }),
    gallery: sectionHeading.extend({ content: longText(600) }),
    feedbacks: sectionHeading,
  }),
  contact: sectionHeading,
  footer: z.object({
    tagline: shortText(120),
    note: longText(300),
  }),
});

export type SiteContentInput = z.infer<typeof updateSiteContentSchema>;
