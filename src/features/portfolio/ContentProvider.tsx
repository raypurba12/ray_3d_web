import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import {
  experiences as staticExperiences,
  projects as staticProjects,
  technologies as staticTechnologies,
  testimonials as staticTestimonials,
} from "../../constants";
import { config } from "../../constants/config";
import {
  fetchExperiences,
  fetchGallery,
  fetchProfile,
  fetchProjects,
  fetchTechnologies,
  fetchTestimonials,
} from "./api";
import {
  PortfolioContentContext,
  type PortfolioContent,
} from "./content-context";
import {
  mapExperiences,
  mapGallery,
  mapProfile,
  mapProjects,
  mapTechnologies,
  mapTestimonials,
  type PortfolioProfile,
} from "./mappers";

const STATIC_PROFILE: PortfolioProfile = {
  name: config.hero.name,
  tagline: "Creative Developer & WebGL Architect",
  bio: config.sections.about.content,
  avatar: "",
  resumeUrl: "",
  email: config.html.email,
  phone: "",
  location: "Jakarta, Indonesia (WIB)",
  github: "",
  linkedin: "",
  twitter: "",
  website: "",
};

const createStaticContent = (): PortfolioContent => ({
  profile: STATIC_PROFILE,
  projects: staticProjects,
  technologies: staticTechnologies,
  experiences: staticExperiences,
  testimonials: staticTestimonials,
  gallery: [],
});

export const ContentProvider = ({ children }: { children: ReactNode }) => {
  const [content, setContent] = useState<PortfolioContent>(createStaticContent);

  useEffect(() => {
    let cancelled = false;

    void Promise.allSettled([
      fetchProfile(),
      fetchProjects(),
      fetchTechnologies(),
      fetchExperiences(),
      fetchTestimonials(),
      fetchGallery(),
    ]).then(
      ([profile, projects, technologies, experiences, testimonials, gallery]) => {
        if (cancelled) return;

        setContent((previous) => ({
          profile:
            profile.status === "fulfilled"
              ? mapProfile(profile.value)
              : previous.profile,
          projects:
            projects.status === "fulfilled"
              ? mapProjects(projects.value)
              : previous.projects,
          technologies:
            technologies.status === "fulfilled"
              ? mapTechnologies(technologies.value)
              : previous.technologies,
          experiences:
            experiences.status === "fulfilled"
              ? mapExperiences(experiences.value)
              : previous.experiences,
          testimonials:
            testimonials.status === "fulfilled"
              ? mapTestimonials(testimonials.value)
              : previous.testimonials,
          gallery:
            gallery.status === "fulfilled"
              ? mapGallery(gallery.value)
              : previous.gallery,
        }));
      }
    );

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PortfolioContentContext.Provider value={content}>
      {children}
    </PortfolioContentContext.Provider>
  );
};
