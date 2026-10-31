import { request } from "../../../lib/api";
import type { AdminTechnology, TechnologyPayload } from "../../../types/admin";

export const listTechnologies = () =>
  request<AdminTechnology[]>("/technologies", { auth: false });

export const getTechnology = (id: string) =>
  request<AdminTechnology>(`/technologies/${id}`, { auth: false });

export const createTechnology = (payload: TechnologyPayload) =>
  request<AdminTechnology>("/technologies", { method: "POST", body: payload });

export const updateTechnology = (id: string, payload: TechnologyPayload) =>
  request<AdminTechnology>(`/technologies/${id}`, {
    method: "PUT",
    body: payload,
  });

export const deleteTechnology = (id: string) =>
  request<void>(`/technologies/${id}`, { method: "DELETE" });
