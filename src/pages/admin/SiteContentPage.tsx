import { useEffect, useState } from "react";

import {
  getSiteContent,
  saveSiteContent,
} from "../../features/admin/site/api";
import SiteContentForm from "../../features/admin/site/SiteContentForm";
import { PageHeader } from "../../features/admin/ui/PageHeader";
import { describeError } from "../../features/admin/ui/serverErrors";
import { buttonGhost, panelClass } from "../../features/admin/ui/styles";
import { ApiError } from "../../lib/api";
import type { SiteContent } from "../../types";
import type { ServerIssue } from "../../types/admin";
import { resolveSiteContent } from "../../features/portfolio/site-content";

const toPathErrors = (issues: ServerIssue[] | undefined) => {
  const result: Record<string, string> = {};

  for (const issue of issues ?? []) {
    const key = (issue.path ?? []).map(String).join(".");
    if (!key || result[key]) continue;
    result[key] = issue.message ?? "Nilai tidak valid.";
  }

  return result;
};

const SiteContentPage = () => {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    getSiteContent()
      .then((data) => {
        if (!cancelled) setContent(resolveSiteContent(data));
      })
      .catch((error) => {
        if (!cancelled) {
          setLoadError(describeError(error, "Gagal memuat site content."));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const handleSubmit = async (payload: SiteContent) => {
    setSubmitting(true);
    setBanner(null);
    setSuccess(null);
    setFieldErrors({});

    try {
      const saved = await saveSiteContent(payload);
      setContent(resolveSiteContent(saved));
      setSuccess("Site content berhasil disimpan.");
    } catch (error) {
      if (error instanceof ApiError && error.issues?.length) {
        setFieldErrors(toPathErrors(error.issues));
        setBanner("Periksa kembali field yang ditandai.");
      } else {
        setBanner(describeError(error, "Gagal menyimpan site content."));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Site Content"
        description="Kelola copy hero, heading section, kontak, dan footer yang tampil di halaman publik."
      />

      {loading && <div className={`${panelClass} mt-6 h-72 animate-pulse`} />}

      {!loading && loadError && (
        <div className={`${panelClass} mt-6 p-6 text-center`}>
          <p className="text-sm text-red-300">{loadError}</p>
          <button
            type="button"
            className={`${buttonGhost} mt-4`}
            onClick={() => setReloadKey((key) => key + 1)}
          >
            Coba lagi
          </button>
        </div>
      )}

      {!loading && !loadError && content && (
        <>
          {success && (
            <p
              role="status"
              className="mt-6 rounded-lg border border-acid/30 bg-acid/10 px-3 py-2 text-sm text-acid"
            >
              {success}
            </p>
          )}

          <SiteContentForm
            initialContent={content}
            submitting={submitting}
            serverErrors={fieldErrors}
            banner={banner}
            onSubmit={(payload) => void handleSubmit(payload)}
          />
        </>
      )}
    </div>
  );
};

export default SiteContentPage;
