import { request } from "../../../lib/api";
import type { AdminTestimonial, TestimonialPayload } from "../../../types/admin";

export const listTestimonials = () =>
  request<AdminTestimonial[]>("/testimonials", { auth: false });

export const getTestimonial = (id: string) =>
  request<AdminTestimonial>(`/testimonials/${id}`, { auth: false });

export const createTestimonial = (payload: TestimonialPayload) =>
  request<AdminTestimonial>("/testimonials", { method: "POST", body: payload });

export const updateTestimonial = (id: string, payload: TestimonialPayload) =>
  request<AdminTestimonial>(`/testimonials/${id}`, {
    method: "PUT",
    body: payload,
  });

export const deleteTestimonial = (id: string) =>
  request<void>(`/testimonials/${id}`, { method: "DELETE" });
