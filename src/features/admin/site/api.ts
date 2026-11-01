import { request } from "../../../lib/api";
import type { SiteContent } from "../../../types";

export const getSiteContent = () =>
  request<unknown>("/site-content", { auth: false });

export const saveSiteContent = (payload: SiteContent) =>
  request<unknown>("/site-content", { method: "PUT", body: payload });
