import { request } from "../../../lib/api";
import type {
  AdminGalleryImage,
  GalleryImagePayload,
} from "../../../types/admin";

export const listGalleryImages = () =>
  request<AdminGalleryImage[]>("/gallery", { auth: false });

export const getGalleryImage = (id: string) =>
  request<AdminGalleryImage>(`/gallery/${id}`, { auth: false });

export const createGalleryImage = (payload: GalleryImagePayload) =>
  request<AdminGalleryImage>("/gallery", { method: "POST", body: payload });

export const updateGalleryImage = (
  id: string,
  payload: GalleryImagePayload
) =>
  request<AdminGalleryImage>(`/gallery/${id}`, {
    method: "PUT",
    body: payload,
  });

export const deleteGalleryImage = (id: string) =>
  request<void>(`/gallery/${id}`, { method: "DELETE" });
