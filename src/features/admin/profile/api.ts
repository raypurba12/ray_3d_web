import { ApiError, request } from "../../../lib/api";
import type { AdminProfile, ProfilePayload } from "../../../types/admin";

export const getProfile = () =>
  request<AdminProfile>("/profile", { auth: false });

export const getProfileOrNull = async (): Promise<AdminProfile | null> => {
  try {
    return await getProfile();
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
};

export const saveProfile = (payload: ProfilePayload) =>
  request<AdminProfile>("/profile", { method: "PUT", body: payload });
