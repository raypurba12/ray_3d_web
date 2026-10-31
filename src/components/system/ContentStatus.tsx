import { useState } from "react";
import { AlertTriangle, RefreshCw, WifiOff } from "lucide-react";

import { usePortfolioContent } from "../../features/portfolio/content-context";

const ContentStatus = () => {
  const { status, usingCache, refresh } = usePortfolioContent();
  const [retrying, setRetrying] = useState(false);

  if (status !== "error" && status !== "partial") return null;

  const offline = status === "error" && usingCache;

  const message = offline
    ? "You're offline — showing the last saved version of this page."
    : status === "partial"
      ? "Some sections couldn't be refreshed. Showing what we have."
      : "Live content is unavailable right now. Only site details are shown.";

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await refresh();
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-1/2 z-40 flex w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 items-center gap-3 rounded-2xl border border-white/10 bg-[#121216]/95 px-4 py-3 text-xs shadow-2xl backdrop-blur-md"
    >
      <span className="text-acid" aria-hidden>
        {offline ? <WifiOff size={16} /> : <AlertTriangle size={16} />}
      </span>
      <p className="flex-1 font-mono leading-relaxed text-white/70">
        {message}
      </p>
      <button
        type="button"
        onClick={handleRetry}
        disabled={retrying}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-white/90 transition hover:border-acid/50 hover:text-acid disabled:opacity-50"
      >
        <RefreshCw size={12} className={retrying ? "animate-spin" : undefined} />
        <span>{retrying ? "Retrying" : "Retry"}</span>
      </button>
    </div>
  );
};

export default ContentStatus;
