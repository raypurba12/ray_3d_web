import { request } from "../../../lib/api";
import type {
  AdminProject,
  AdminTechnology,
  ProjectPayload,
} from "../../../types/admin";

export const listProjects = () =>
  request<AdminProject[]>("/projects", { auth: false });

export const getProject = (id: string) =>
  request<AdminProject>(`/projects/${id}`, { auth: false });

export const createProject = (payload: ProjectPayload) =>
  request<AdminProject>("/projects", { method: "POST", body: payload });

export const updateProject = (id: string, payload: ProjectPayload) =>
  request<AdminProject>(`/projects/${id}`, { method: "PUT", body: payload });

export const deleteProject = (id: string) =>
  request<void>(`/projects/${id}`, { method: "DELETE" });

export const listTechnologies = () =>
  request<AdminTechnology[]>("/technologies", { auth: false });
