import { request } from "../../../lib/api";
import type { AdminExperience, ExperiencePayload } from "../../../types/admin";

export const listExperiences = () =>
  request<AdminExperience[]>("/experiences", { auth: false });

export const getExperience = (id: string) =>
  request<AdminExperience>(`/experiences/${id}`, { auth: false });

export const createExperience = (payload: ExperiencePayload) =>
  request<AdminExperience>("/experiences", { method: "POST", body: payload });

export const updateExperience = (id: string, payload: ExperiencePayload) =>
  request<AdminExperience>(`/experiences/${id}`, {
    method: "PUT",
    body: payload,
  });

export const deleteExperience = (id: string) =>
  request<void>(`/experiences/${id}`, { method: "DELETE" });
