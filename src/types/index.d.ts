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
  description: string;
  tags: {
    name: string;
    color: string;
  }[];
  image: string;
  sourceCodeLink: string;
  liveDemoLink?: string;
  metric?: string;
  images?: TProjectImage[];
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
