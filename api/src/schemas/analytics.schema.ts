import { z } from 'zod';

const visitorId = z.string().trim().min(8).max(64);

export const trackPageViewSchema = z.object({
  path: z.string().trim().min(1).max(300),
  referrer: z.string().trim().max(500).optional().nullable(),
  visitorId,
});

export const trackCvDownloadSchema = z.object({
  visitorId,
});

export type TrackPageViewInput = z.infer<typeof trackPageViewSchema>;
export type TrackCvDownloadInput = z.infer<typeof trackCvDownloadSchema>;
