import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  notifyUnauthorized,
  storeTokens,
} from "./auth-storage";
import type { ApiEnvelope, UploadedAsset } from "../types/admin";

const DEFAULT_API_URL = "http://localhost:5000/api";

export const API_BASE = (
  import.meta.env.VITE_API_URL ?? DEFAULT_API_URL
).replace(/\/+$/, "");
export const API_ORIGIN = new URL(API_BASE).origin;

export class ApiError extends Error {
  readonly status: number;
  readonly issues?: ApiEnvelope<unknown>["errors"];

  constructor(
    status: number,
    message: string,
    issues?: ApiEnvelope<unknown>["errors"]
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.issues = issues;
  }
}

export const resolveAssetUrl = (image: string): string => {
  if (!image) return "";
  if (/^(https?:|data:|blob:)/i.test(image)) return image;
  return `${API_ORIGIN}${image.startsWith("/") ? "" : "/"}${image}`;
};

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: boolean;
  retried?: boolean;
};

let refreshPromise: Promise<string> | null = null;

const refreshAccessToken = (): Promise<string> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return Promise.reject(new ApiError(401, "Sesi berakhir."));
  }

  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (response) => {
        const payload = (await response.json().catch(() => null)) as
          | ApiEnvelope<{ accessToken: string; refreshToken: string }>
          | null;

        if (!response.ok || !payload?.data) {
          throw new ApiError(
            response.status,
            payload?.error ?? "Sesi berakhir."
          );
        }

        storeTokens(payload.data.accessToken, payload.data.refreshToken);
        return payload.data.accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

const expireSession = (): never => {
  clearSession();
  notifyUnauthorized();
  throw new ApiError(401, "Sesi berakhir. Silakan login kembali.");
};

export const request = async <T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> => {
  const { method = "GET", body, auth = true, retried = false } = options;

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const token = getAccessToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      0,
      `Tidak dapat terhubung ke server (${API_ORIGIN}). Pastikan API berjalan.`
    );
  }

  const skipRefresh =
    path.startsWith("/auth/login") || path.startsWith("/auth/refresh");

  if (response.status === 401 && auth && !retried && !skipRefresh) {
    try {
      await refreshAccessToken();
    } catch {
      expireSession();
    }
    return request<T>(path, { ...options, retried: true });
  }

  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!response.ok || !payload?.success) {
    throw new ApiError(
      response.status,
      payload?.error ?? `Permintaan gagal (${response.status}).`,
      payload?.errors
    );
  }

  return payload.data as T;
};

export const uploadFile = (
  file: File,
  onProgress?: (percent: number) => void
): Promise<UploadedAsset> =>
  new Promise((resolve, reject) => {
    const send = (retried: boolean) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${API_BASE}/upload`);

      const token = getAccessToken();
      if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      };

      xhr.onerror = () =>
        reject(new ApiError(0, "Upload gagal. Periksa koneksi ke server."));

      xhr.onload = async () => {
        let payload: ApiEnvelope<UploadedAsset> | null = null;
        try {
          payload = JSON.parse(xhr.responseText) as ApiEnvelope<UploadedAsset>;
        } catch {
          payload = null;
        }

        if (xhr.status === 401 && !retried) {
          try {
            await refreshAccessToken();
          } catch {
            clearSession();
            notifyUnauthorized();
            reject(new ApiError(401, "Sesi berakhir. Silakan login kembali."));
            return;
          }
          send(true);
          return;
        }

        if (xhr.status >= 200 && xhr.status < 300 && payload?.data) {
          resolve(payload.data);
          return;
        }

        reject(
          new ApiError(
            xhr.status,
            payload?.error ?? `Upload gagal (${xhr.status}).`,
            payload?.errors
          )
        );
      };

      const formData = new FormData();
      formData.append("file", file);
      xhr.send(formData);
    };

    send(false);
  });
