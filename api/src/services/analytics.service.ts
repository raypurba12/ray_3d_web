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

type CountRow = { count: bigint };
type DailyRow = { date: string; views: bigint; visitors: bigint };
type DailyDownloadRow = { date: string; count: bigint };
type ReferrerRow = { referrer: string | null; count: bigint };

const toNumber = (value: bigint | number | null | undefined) =>
  Number(value ?? 0);

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

  const [
    currentViews,
    currentVisitors,
    previousViews,
    previousVisitors,
    currentDownloads,
    previousDownloads,
    dailyViews,
    dailyDownloads,
    referrers,
  ] = await Promise.all([
    prisma.$queryRaw<CountRow[]>`
      SELECT COUNT(*) AS count FROM page_views WHERE createdAt >= ${start}
    `,
    prisma.$queryRaw<CountRow[]>`
      SELECT COUNT(DISTINCT visitorId) AS count
      FROM page_views
      WHERE createdAt >= ${start}
    `,
    prisma.$queryRaw<CountRow[]>`
      SELECT COUNT(*) AS count
      FROM page_views
      WHERE createdAt >= ${previousStart} AND createdAt < ${start}
    `,
    prisma.$queryRaw<CountRow[]>`
      SELECT COUNT(DISTINCT visitorId) AS count
      FROM page_views
      WHERE createdAt >= ${previousStart} AND createdAt < ${start}
    `,
    prisma.$queryRaw<CountRow[]>`
      SELECT COUNT(*) AS count FROM cv_downloads WHERE createdAt >= ${start}
    `,
    prisma.$queryRaw<CountRow[]>`
      SELECT COUNT(*) AS count
      FROM cv_downloads
      WHERE createdAt >= ${previousStart} AND createdAt < ${start}
    `,
    prisma.$queryRaw<DailyRow[]>`
      SELECT
        DATE_FORMAT(createdAt, '%Y-%m-%d') AS date,
        COUNT(*) AS views,
        COUNT(DISTINCT visitorId) AS visitors
      FROM page_views
      WHERE createdAt >= ${start}
      GROUP BY date
      ORDER BY date ASC
    `,
    prisma.$queryRaw<DailyDownloadRow[]>`
      SELECT
        DATE_FORMAT(createdAt, '%Y-%m-%d') AS date,
        COUNT(*) AS count
      FROM cv_downloads
      WHERE createdAt >= ${start}
      GROUP BY date
      ORDER BY date ASC
    `,
    prisma.$queryRaw<ReferrerRow[]>`
      SELECT referrer, COUNT(*) AS count
      FROM page_views
      WHERE createdAt >= ${start}
      GROUP BY referrer
      ORDER BY count DESC
      LIMIT 50
    `,
  ]);

  const daily = Array.from({ length: days }, (_, index) => {
    const date = dateKey(new Date(start.getTime() + index * DAY_MS));
    return { date, views: 0, visitors: 0, cvDownloads: 0 };
  });
  const buckets = new Map(daily.map((bucket) => [bucket.date, bucket]));

  for (const row of dailyViews) {
    const bucket = buckets.get(row.date);
    if (!bucket) continue;
    bucket.views = toNumber(row.views);
    bucket.visitors = toNumber(row.visitors);
  }

  for (const row of dailyDownloads) {
    const bucket = buckets.get(row.date);
    if (bucket) bucket.cvDownloads = toNumber(row.count);
  }

  const referrerCounts = new Map<string, number>();
  for (const row of referrers) {
    const source = referrerSource(row.referrer);
    referrerCounts.set(
      source,
      (referrerCounts.get(source) ?? 0) + toNumber(row.count)
    );
  }

  return {
    rangeDays: days,
    totals: {
      pageViews: toNumber(currentViews[0]?.count),
      uniqueVisitors: toNumber(currentVisitors[0]?.count),
      cvDownloads: toNumber(currentDownloads[0]?.count),
    },
    previous: {
      pageViews: toNumber(previousViews[0]?.count),
      uniqueVisitors: toNumber(previousVisitors[0]?.count),
      cvDownloads: toNumber(previousDownloads[0]?.count),
    },
    daily,
    topReferrers: [...referrerCounts.entries()]
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
  };
};

export type AnalyticsSummary = Awaited<ReturnType<typeof summary>>;
