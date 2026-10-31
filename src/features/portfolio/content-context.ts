import { createContext, useContext } from "react";

import type {
  TExperience,
  TGalleryImage,
  TProject,
  TTechnology,
  TTestimonial,
} from "../../types";
import type { PortfolioProfile } from "./mappers";

export type PortfolioContent = {
  profile: PortfolioProfile;
  projects: TProject[];
  technologies: TTechnology[];
  experiences: TExperience[];
  testimonials: TTestimonial[];
  gallery: TGalleryImage[];
};

export const PortfolioContentContext =
  createContext<PortfolioContent | null>(null);

export const usePortfolioContent = () => {
  const content = useContext(PortfolioContentContext);

  if (!content) {
    throw new Error(
      "usePortfolioContent must be used within a ContentProvider."
    );
  }

  return content;
};
