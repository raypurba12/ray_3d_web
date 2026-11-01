import { createContext, useContext } from "react";

import type {
  SiteContent,
  TExperience,
  TGalleryImage,
  TProject,
  TTechnology,
  TTestimonial,
} from "../../types";
import type { PortfolioProfile } from "./mappers";

export type ContentStatus = "loading" | "ready" | "partial" | "error";

export type PortfolioContent = {
  profile: PortfolioProfile;
  projects: TProject[];
  technologies: TTechnology[];
  experiences: TExperience[];
  testimonials: TTestimonial[];
  gallery: TGalleryImage[];
  site: SiteContent;
};

export type PortfolioContentValue = PortfolioContent & {
  status: ContentStatus;
  usingCache: boolean;
  refresh: () => Promise<void>;
};

export const PortfolioContentContext =
  createContext<PortfolioContentValue | null>(null);

export const usePortfolioContent = () => {
  const content = useContext(PortfolioContentContext);

  if (!content) {
    throw new Error(
      "usePortfolioContent must be used within a ContentProvider."
    );
  }

  return content;
};
