const fallbackOrigin =
  typeof window !== "undefined" ? window.location.origin : "https://raypurba.com";

const siteUrl = (import.meta.env.VITE_SITE_URL ?? "").trim() || fallbackOrigin;

export const site = {
  url: siteUrl.replace(/\/+$/, ""),
  name: "Ray Purba",
  title: "Ray Purba — Creative Developer & 3D Portfolio",
  description:
    "Portfolio of Ray Purba, a creative developer building immersive 3D web experiences, resilient frontend architectures, and fluid interactions.",
  contactEmail: (import.meta.env.VITE_CONTACT_EMAIL ?? "").trim(),
  location: "Jakarta, Indonesia",
} as const;
