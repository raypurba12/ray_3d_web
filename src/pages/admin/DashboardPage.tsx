import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  Eye,
  FileDown,
  Link2,
  Percent,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";

import {
  getAnalyticsSummary,
  type AnalyticsSummary,
} from "../../features/admin/analytics/api";
import { ListError, ListSkeleton } from "../../features/admin/ui/ListState";
import { PageHeader } from "../../features/admin/ui/PageHeader";
import { describeError } from "../../features/admin/ui/serverErrors";
import { buttonGhost, panelClass } from "../../features/admin/ui/styles";

const RANGES = [7, 14, 30] as const;

const numberFormat = new Intl.NumberFormat("id-ID");

const formatNumber = (value: number) => numberFormat.format(value);

const formatDay = (date: string) =>
  new Date(`${date}T12:00:00`).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });

const Delta = ({ current, previous }: { current: number; previous: number }) => {
  if (previous === 0) {
    return (
      <span className="text-white/30">
        {current > 0 ? "data baru" : "belum ada data"}
      </span>
    );
  }

  const change = Math.round(((current - previous) / previous) * 100);

  if (change === 0) {
    return <span className="text-white/40">sama dengan periode lalu</span>;
  }

  const positive = change > 0;

  return (
    <span
      className={`inline-flex items-center gap-1 ${
        positive ? "text-emerald-400" : "text-red-300"
      }`}
    >
      {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {Math.abs(change)}% vs periode lalu
    </span>
  );
};

const StatCard = ({
  label,
  value,
  icon,
  footer,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  footer: ReactNode;
}) => (
  <div className={`${panelClass} p-5`}>
    <div className="flex items-center justify-between gap-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
        {label}
      </p>
      <span className="text-acid">{icon}</span>
    </div>
    <p className="mt-3 font-display text-3xl font-bold text-white">{value}</p>
    <div className="mt-2 text-xs">{footer}</div>
  </div>
);

const DashboardPage = () => {
  const [days, setDays] = useState<number>(14);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getAnalyticsSummary(days)
      .then((data) => {
        if (!cancelled) setSummary(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(describeError(err, "Gagal memuat statistik."));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [days, reloadKey]);

  const reload = () => setReloadKey((key) => key + 1);

  const conversionRate =
    summary && summary.totals.uniqueVisitors > 0
      ? Math.round(
          (summary.totals.cvDownloads / summary.totals.uniqueVisitors) * 100
        )
      : 0;

  const maxBar = summary
    ? Math.max(
        1,
        ...summary.daily.map((day) => Math.max(day.views, day.cvDownloads))
      )
    : 1;
  const labelStep = summary
    ? Math.max(1, Math.ceil(summary.daily.length / 10))
    : 1;
  const hasTraffic = summary
    ? summary.totals.pageViews > 0 || summary.totals.cvDownloads > 0
    : false;
  const maxReferrer = summary
    ? Math.max(1, ...summary.topReferrers.map((item) => item.count))
    : 1;

  return (
    <div>
      <PageHeader
        eyebrow="Dashboard"
        title="Traffic & engagement"
        description="Pantau kunjungan situs dan unduhan CV dari halaman publik."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-full border border-white/10 bg-white/[0.04] p-1">
              {RANGES.map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setDays(range)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                    days === range
                      ? "bg-acid text-black"
                      : "text-secondary hover:text-white"
                  }`}
                >
                  {range} hari
                </button>
              ))}
            </div>
            <button
              type="button"
              className={buttonGhost}
              onClick={reload}
              disabled={loading}
              aria-label="Refresh statistik"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        }
      />

      {loading && <ListSkeleton rows={2} />}

      {!loading && error && <ListError message={error} onRetry={reload} />}

      {!loading && !error && summary && (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Kunjungan"
              value={formatNumber(summary.totals.pageViews)}
              icon={<Eye size={18} />}
              footer={<Delta current={summary.totals.pageViews} previous={summary.previous.pageViews} />}
            />
            <StatCard
              label="Pengunjung unik"
              value={formatNumber(summary.totals.uniqueVisitors)}
              icon={<Users size={18} />}
              footer={
                <Delta
                  current={summary.totals.uniqueVisitors}
                  previous={summary.previous.uniqueVisitors}
                />
              }
            />
            <StatCard
              label="Unduhan CV"
              value={formatNumber(summary.totals.cvDownloads)}
              icon={<FileDown size={18} />}
              footer={
                <Delta
                  current={summary.totals.cvDownloads}
                  previous={summary.previous.cvDownloads}
                />
              }
            />
            <StatCard
              label="Konversi CV"
              value={`${conversionRate}%`}
              icon={<Percent size={18} />}
              footer={
                <span className="text-white/40">
                  dari {formatNumber(summary.totals.uniqueVisitors)} pengunjung
                  unik
                </span>
              }
            />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
            <section className={`${panelClass} p-5 sm:p-6`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-bold text-white">
                    Traffic harian
                  </h2>
                  <p className="mt-1 text-xs text-secondary">
                    {summary.rangeDays} hari terakhir.
                  </p>
                </div>
                <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.15em] text-white/40">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-sm bg-acid" />
                    Views
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-sm bg-emerald-400" />
                    CV
                  </span>
                </div>
              </div>

              {!hasTraffic ? (
                <div className="mt-8 rounded-xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-secondary">
                  Belum ada kunjungan pada periode ini. Buka situs publik untuk
                  mulai mencatat data.
                </div>
              ) : (
                <div className="mt-6 flex h-48 items-end gap-1">
                  {summary.daily.map((day, index) => (
                    <div
                      key={day.date}
                      className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                    >
                      <div className="flex h-full w-full items-end justify-center gap-[3px]">
                        <div
                          className="w-[38%] rounded-t-sm bg-acid/80 transition-colors hover:bg-acid"
                          style={{
                            height: day.views
                              ? `${Math.max((day.views / maxBar) * 100, 3)}%`
                              : "0%",
                          }}
                          title={`${day.date}: ${day.views} kunjungan`}
                        />
                        <div
                          className="w-[38%] rounded-t-sm bg-emerald-400/70 transition-colors hover:bg-emerald-400"
                          style={{
                            height: day.cvDownloads
                              ? `${Math.max((day.cvDownloads / maxBar) * 100, 3)}%`
                              : "0%",
                          }}
                          title={`${day.date}: ${day.cvDownloads} unduhan CV`}
                        />
                      </div>
                      <span className="h-3 whitespace-nowrap font-mono text-[9px] text-white/30">
                        {index % labelStep === 0 ||
                        index === summary.daily.length - 1
                          ? formatDay(day.date)
                          : ""}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className={`${panelClass} p-5 sm:p-6`}>
              <div className="flex items-center gap-2">
                <Link2 size={16} className="text-acid" />
                <h2 className="font-display text-lg font-bold text-white">
                  Sumber kunjungan
                </h2>
              </div>

              {summary.topReferrers.length === 0 ? (
                <p className="mt-8 text-sm text-secondary">
                  Belum ada data sumber kunjungan.
                </p>
              ) : (
                <ul className="mt-5 space-y-4">
                  {summary.topReferrers.map((item) => (
                    <li key={item.source}>
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="truncate text-white/80">
                          {item.source === "Direct" ? "Langsung" : item.source}
                        </span>
                        <span className="shrink-0 font-mono text-xs text-white/40">
                          {formatNumber(item.count)}
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className="h-full rounded-full bg-acid/70"
                          style={{
                            width: `${Math.max((item.count / maxReferrer) * 100, 4)}%`,
                          }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.15em] text-white/25">
            Dihitung anonim via ID pengunjung di localStorage — tanpa IP atau
            data pribadi.
          </p>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
