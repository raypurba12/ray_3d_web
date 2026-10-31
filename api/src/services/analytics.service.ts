import prisma from '../config/database';
import type {
  TrackCvDownloadInput,
  TrackPageViewInput,
} from '../schemas/analytics.schema';

const DAY_MS = 24 * 60 * 60 * 1000;

const startOfDay = (date: Date) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const dateKey = (date: Date) => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

const referrerSource = (referrer: string | null) => {
  if (!referrer) return 'Direct';

  try {
    return new URL(referrer).hostname.replace(/^www\./, '');
  } catch {
    return referrer.slice(0, 80);
  }
};

export const trackPageView = (input: TrackPageViewInput) =>
  prisma.pageView.create({
    data: {
      path: input.path,
      referrer: input.referrer || null,
      visitorId: input.visitorId,
    },
    select: { id: true },
  });

export const trackCvDownload = (input: TrackCvDownloadInput) =>
  prisma.cvDownload.create({
    data: { visitorId: input.visitorId },
    select: { id: true },
  });

export const summary = async (days: number) => {
  const today = startOfDay(new Date());
  const start = new Date(today.getTime() - (days - 1) * DAY_MS);
  const previousStart = new Date(start.getTime() - days * DAY_MS);

  const [views, downloads] = await Promise.all([
    prisma.pageView.findMany({
      where: { createdAt: { gte: previousStart } },
      select: { createdAt: true, visitorId: true, referrer: true },
    }),
    prisma.cvDownload.findMany({
      where: { createdAt: { gte: previousStart } },
      select: { createdAt: true, visitorId: true },
    }),
  ]);

  const currentViews = views.filter((view) => view.createdAt >= start);
  const previousViews = views.filter((view) => view.createdAt < start);
  const currentDownloads = downloads.filter((item) => item.createdAt >= start);
  const previousDownloads = downloads.filter((item) => item.createdAt < start);

  const daily = Array.from({ length: days }, (_, index) => ({
    date: dateKey(new Date(start.getTime() + index * DAY_MS)),
    views: 0,
    visitors: new Set<string>(),
    cvDownloads: 0,
  }));
  const buckets = new Map(daily.map((bucket) => [bucket.date, bucket]));

  for (const view of currentViews) {
    const bucket = buckets.get(dateKey(view.createdAt));
    if (!bucket) continue;
    bucket.views += 1;
    bucket.visitors.add(view.visitorId);
  }

  for (const download of currentDownloads) {
    const bucket = buckets.get(dateKey(download.createdAt));
    if (bucket) bucket.cvDownloads += 1;
  }

  const referrerCounts = new Map<string, number>();
  for (const view of currentViews) {
    const source = referrerSource(view.referrer);
    referrerCounts.set(source, (referrerCounts.get(source) ?? 0) + 1);
  }

  const uniqueVisitors = new Set(currentViews.map((view) => view.visitorId)).size;

  return {
    rangeDays: days,
    totals: {
      pageViews: currentViews.length,
      uniqueVisitors,
      cvDownloads: currentDownloads.length,
    },
    previous: {
      pageViews: previousViews.length,
      uniqueVisitors: new Set(previousViews.map((view) => view.visitorId)).size,
      cvDownloads: previousDownloads.length,
    },
    daily: daily.map(({ date, views: viewCount, visitors, cvDownloads }) => ({
      date,
      views: viewCount,
      visitors: visitors.size,
      cvDownloads,
    })),
    topReferrers: [...referrerCounts.entries()]
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
  };
};

export type AnalyticsSummary = Awaited<ReturnType<typeof summary>>;
