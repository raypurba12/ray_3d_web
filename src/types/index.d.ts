export type TCommonProps = {
  title?: string;
  name?: string;
  icon?: string;
};

export type TExperience = {
  companyName: string;
  iconBg: string;
  date: string;
  points: string[];
  order?: number;
} & Required<Omit<TCommonProps, "name">>;

export type TTestimonial = {
  testimonial: string;
  designation: string;
  company: string;
  image: string;
  rating?: number;
  featured?: boolean;
  order?: number;
} & Required<Pick<TCommonProps, "name">>;

export type TProjectImage = {
  id: string;
  image: string;
  caption: string;
};

export type TProject = {
  id: string;
  description: string;
  tags: {
    name: string;
    color: string;
  }[];
  image: string;
  sourceCodeLink: string;
  liveDemoLink?: string;
  videoLink?: string;
  metric?: string;
  images?: TProjectImage[];
  technologies?: TTechnology[];
  featured?: boolean;
  order?: number;
} & Required<Pick<TCommonProps, "name">>;

export type TTechnology = Required<Omit<TCommonProps, "title">> & {
  order?: number;
  category?: string;
};

export type TGalleryImage = {
  id: string;
  title: string;
  image: string;
  order: number;
};

export type TNavLink = {
  id: string;
} & Required<Pick<TCommonProps, "title">>;

export type TMotion = {
  direction: "up" | "down" | "left" | "right" | "";
  type: "tween" | "spring" | "just" | "";
  delay: number;
  duration: number;
};

export type SiteSectionCopy = {
  label: string;
  title: string;
};

export type SiteContent = {
  hero: {
    badge: string;
    eyebrow: string;
    title: string;
    titleAccent: string;
    intro: string;
  };
  sections: {
    about: SiteSectionCopy & { content: string };
    experience: SiteSectionCopy;
    tech: SiteSectionCopy;
    works: SiteSectionCopy & { content: string };
    gallery: SiteSectionCopy & { content: string };
    feedbacks: SiteSectionCopy;
  };
  contact: SiteSectionCopy;
  footer: {
    tagline: string;
    note: string;
  };
};
