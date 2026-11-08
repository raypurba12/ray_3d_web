import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

import { config } from "../../constants/config";
import { site } from "../../constants/site";
import {
  fetchExperiences,
  fetchGallery,
  fetchProfile,
  fetchProjects,
  fetchSiteContent,
  fetchTechnologies,
  fetchTestimonials,
} from "./api";
import {
  PortfolioContentContext,
  type ContentStatus,
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
import { DEFAULT_SITE_CONTENT, resolveSiteContent } from "./site-content";

const CACHE_KEY = "rp_content_v1";
const CACHE_VERSION = 3;

type CachedPayload = {
  version: number;
  savedAt: string;
  content: PortfolioContent;
};

const STATIC_PROFILE: PortfolioProfile = {
  name: site.name,
  tagline: "Creative Developer & WebGL Architect",
  bio: config.sections.about.content,
  avatar: "",
  resumeUrl: "",
  email: site.contactEmail,
  phone: "",
  location: site.location,
  github: "",
  linkedin: "",
  twitter: "",
  website: "",
};

const createStaticContent = (): PortfolioContent => ({
  profile: STATIC_PROFILE,
  projects: [],
  technologies: [],
  experiences: [],
  testimonials: [],
  gallery: [],
  site: DEFAULT_SITE_CONTENT,
});

const isContentShape = (value: unknown): value is PortfolioContent => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<PortfolioContent>;

  return (
    Boolean(candidate.profile) &&
    Array.isArray(candidate.projects) &&
    Array.isArray(candidate.technologies) &&
    Array.isArray(candidate.experiences) &&
    Array.isArray(candidate.testimonials) &&
    Array.isArray(candidate.gallery) &&
    Boolean(candidate.site)
  );
};

const readCache = (): PortfolioContent | null => {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<CachedPayload>;
    if (parsed.version !== CACHE_VERSION || !isContentShape(parsed.content)) {
      return null;
    }

    return parsed.content;
  } catch {
    return null;
  }
};

const writeCache = (content: PortfolioContent) => {
  try {
    const payload: CachedPayload = {
      version: CACHE_VERSION,
      savedAt: new Date().toISOString(),
      content,
    };
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Storage unavailable (private mode/quota) — the site still works online.
  }
};

const fetchAll = () =>
  Promise.allSettled([
    fetchProfile(),
    fetchProjects(),
    fetchTechnologies(),
    fetchExperiences(),
    fetchTestimonials(),
    fetchGallery(),
    fetchSiteContent(),
  ]);

type SettledResults = Awaited<ReturnType<typeof fetchAll>>;

const mergeResults = (previous: PortfolioContent, results: SettledResults) => {
  const [profile, projects, technologies, experiences, testimonials, gallery, site] =
    results;

  let succeeded = 0;
  const content: PortfolioContent = { ...previous };

  if (profile.status === "fulfilled") {
    content.profile = mapProfile(profile.value);
    succeeded += 1;
  }
  if (projects.status === "fulfilled") {
    content.projects = mapProjects(projects.value);
    succeeded += 1;
  }
  if (technologies.status === "fulfilled") {
    content.technologies = mapTechnologies(technologies.value);
    succeeded += 1;
  }
  if (experiences.status === "fulfilled") {
    content.experiences = mapExperiences(experiences.value);
    succeeded += 1;
  }
  if (testimonials.status === "fulfilled") {
    content.testimonials = mapTestimonials(testimonials.value);
    succeeded += 1;
  }
  if (gallery.status === "fulfilled") {
    content.gallery = mapGallery(gallery.value);
    succeeded += 1;
  }
  if (site.status === "fulfilled") {
    content.site = resolveSiteContent(site.value);
    succeeded += 1;
  }

  return { content, succeeded };
};

const toStatus = (succeeded: number, total: number): ContentStatus => {
  if (succeeded === total) return "ready";
  if (succeeded > 0) return "partial";
  return "error";
};

export const ContentProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState(() => {
    const cached = readCache();
    return {
      content: cached ?? createStaticContent(),
      status: "loading" as ContentStatus,
      usingCache: Boolean(cached),
    };
  });

  const contentRef = useRef(state.content);
  const mountedRef = useRef(true);

  useEffect(() => {
    contentRef.current = state.content;
  }, [state.content]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    const results = await fetchAll();
    if (!mountedRef.current) return;

    const { content, succeeded } = mergeResults(contentRef.current, results);
    const total = results.length;

    if (succeeded > 0) {
      contentRef.current = content;
      writeCache(content);
    }

    setState({
      content,
      status: toStatus(succeeded, total),
      usingCache: succeeded === 0 ? readCache() !== null : false,
    });
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      ...state.content,
      status: state.status,
      usingCache: state.usingCache,
      refresh,
    }),
    [state, refresh]
  );

  return (
    <PortfolioContentContext.Provider value={value}>
      {children}
    </PortfolioContentContext.Provider>
  );
};
