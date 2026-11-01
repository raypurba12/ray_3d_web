import { config } from "../../constants/config";
import type { SiteContent, SiteSectionCopy } from "../../types";

export const DEFAULT_SITE_CONTENT: SiteContent = {
  hero: {
    badge: config.hero.badge,
    eyebrow: config.hero.eyebrow,
    title: config.hero.title,
    titleAccent: config.hero.titleAccent,
    intro: config.hero.intro,
  },
  sections: {
    about: {
      label: config.sections.about.p,
      title: config.sections.about.h2,
      content: config.sections.about.content,
    },
    experience: {
      label: config.sections.experience.p,
      title: config.sections.experience.h2,
    },
    tech: {
      label: config.sections.tech.p,
      title: config.sections.tech.h2,
    },
    works: {
      label: config.sections.works.p,
      title: config.sections.works.h2,
      content: config.sections.works.content,
    },
    gallery: {
      label: config.sections.gallery.p,
      title: config.sections.gallery.h2,
      content: config.sections.gallery.content,
    },
    feedbacks: {
      label: config.sections.feedbacks.p,
      title: config.sections.feedbacks.h2,
    },
  },
  contact: {
    label: config.contact.p,
    title: config.contact.h2,
  },
  footer: {
    tagline: config.footer.tagline,
    note: config.footer.note,
  },
};

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};

const str = (value: unknown, fallback: string) =>
  typeof value === "string" && value.trim().length > 0 ? value : fallback;

const heading = (
  raw: unknown,
  fallback: SiteSectionCopy
): SiteSectionCopy => {
  const value = asRecord(raw);
  return {
    label: str(value.label, fallback.label),
    title: str(value.title, fallback.title),
  };
};

const withContent = (
  raw: unknown,
  fallback: SiteSectionCopy & { content: string }
) => {
  const value = asRecord(raw);
  return {
    ...heading(value, fallback),
    content: str(value.content, fallback.content),
  };
};

export const resolveSiteContent = (raw: unknown): SiteContent => {
  const data = asRecord(raw);
  const hero = asRecord(data.hero);
  const sections = asRecord(data.sections);
  const contact = asRecord(data.contact);
  const footer = asRecord(data.footer);
  const defaults = DEFAULT_SITE_CONTENT;

  return {
    hero: {
      badge: str(hero.badge, defaults.hero.badge),
      eyebrow: str(hero.eyebrow, defaults.hero.eyebrow),
      title: str(hero.title, defaults.hero.title),
      titleAccent: str(hero.titleAccent, defaults.hero.titleAccent),
      intro: str(hero.intro, defaults.hero.intro),
    },
    sections: {
      about: withContent(sections.about, defaults.sections.about),
      experience: heading(sections.experience, defaults.sections.experience),
      tech: heading(sections.tech, defaults.sections.tech),
      works: withContent(sections.works, defaults.sections.works),
      gallery: withContent(sections.gallery, defaults.sections.gallery),
      feedbacks: heading(sections.feedbacks, defaults.sections.feedbacks),
    },
    contact: heading(contact, defaults.contact),
    footer: {
      tagline: str(footer.tagline, defaults.footer.tagline),
      note: str(footer.note, defaults.footer.note),
    },
  };
};
