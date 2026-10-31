import { request } from "../../../lib/api";

export type AnalyticsTotals = {
  pageViews: number;
  uniqueVisitors: number;
  cvDownloads: number;
};

export type AnalyticsDay = {
  date: string;
  views: number;
  visitors: number;
  cvDownloads: number;
};

export type AnalyticsSummary = {
  rangeDays: number;
  totals: AnalyticsTotals;
  previous: AnalyticsTotals;
  daily: AnalyticsDay[];
  topReferrers: { source: string; count: number }[];
};

export const getAnalyticsSummary = (days: number) =>
  request<AnalyticsSummary>(`/analytics/summary?days=${days}`);
