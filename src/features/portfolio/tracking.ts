import { API_BASE } from "../../lib/api";

const VISITOR_KEY = "portfolio_visitor_id";
let pageViewSent = false;

const createVisitorId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

const getVisitorId = (): string => {
  try {
    const existing = window.localStorage.getItem(VISITOR_KEY);
    if (existing) return existing;

    const id = createVisitorId();
    window.localStorage.setItem(VISITOR_KEY, id);
    return id;
  } catch {
    return "";
  }
};

const post = (path: string, body: Record<string, unknown>) => {
  const visitorId = getVisitorId();
  if (!visitorId) return;

  void fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, visitorId }),
    keepalive: true,
  }).catch(() => undefined);
};

export const trackPageView = () => {
  if (pageViewSent) return;
  pageViewSent = true;

  post("/analytics/pageview", {
    path: window.location.pathname,
    referrer: document.referrer || null,
  });
};

export const trackCvDownload = () => post("/analytics/cv-download", {});
