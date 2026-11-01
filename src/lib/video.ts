export type VideoSource =
  | { kind: "youtube"; id: string; embedUrl: string }
  | { kind: "vimeo"; id: string; embedUrl: string }
  | { kind: "file"; url: string };

const VIDEO_ID = /^[A-Za-z0-9_-]{6,20}$/;

const youtubeId = (url: URL): string => {
  if (url.hostname === "youtu.be") {
    return url.pathname.slice(1).split("/")[0] ?? "";
  }

  if (url.pathname === "/watch") {
    return url.searchParams.get("v") ?? "";
  }

  const prefix = ["/embed/", "/shorts/", "/live/", "/v/"].find((path) =>
    url.pathname.startsWith(path)
  );

  return prefix ? url.pathname.slice(prefix.length).split("/")[0] ?? "" : "";
};

const vimeoId = (url: URL): string => {
  const parts = url.pathname.split("/").filter(Boolean);
  if (parts[0] === "video") return parts[1] ?? "";
  return parts[parts.length - 1] ?? "";
};

export const parseVideoSource = (value: string): VideoSource | null => {
  const raw = value.trim();
  if (!raw) return null;

  let url: URL;
  try {
    const base =
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost";
    url = new URL(raw, base);
  } catch {
    return null;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return null;

  const host = url.hostname.replace(/^www\./i, "").toLowerCase();

  if (host === "youtu.be" || host === "youtube.com" || host === "m.youtube.com") {
    const id = youtubeId(url);
    if (!VIDEO_ID.test(id)) return null;
    return {
      kind: "youtube",
      id,
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`,
    };
  }

  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const id = vimeoId(url);
    if (!/^\d{6,12}$/.test(id)) return null;
    return {
      kind: "vimeo",
      id,
      embedUrl: `https://player.vimeo.com/video/${id}?autoplay=1`,
    };
  }

  if (/\.(mp4|webm)$/i.test(url.pathname)) {
    return { kind: "file", url: url.href };
  }

  return null;
};
