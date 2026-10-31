import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled UI error", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b] px-6 text-center text-white">
        <div className="max-w-md">
          <AlertTriangle className="mx-auto text-acid" size={32} />
          <h1 className="mt-5 font-display text-2xl font-bold">
            Something went wrong
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-white/60">
            The interface hit an unexpected error. Reload the page to try
            again, or head back to the home page.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-full bg-acid px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-white"
            >
              Reload page
            </button>
            <a
              href="/"
              className="rounded-full border border-white/10 bg-white/[0.05] px-5 py-2.5 text-sm text-white/80 transition hover:border-white/30 hover:text-white"
            >
              Back to home
            </a>
          </div>
        </div>
      </div>
    );
  }
}
