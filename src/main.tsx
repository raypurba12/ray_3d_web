import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { ErrorBoundary } from "./components/system/ErrorBoundary";
import "./fonts.css";
import "./globals.css";

const RouteFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-[#09090b] font-mono text-xs uppercase tracking-[0.2em] text-white/40">
    Loading…
  </div>
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<RouteFallback />}>
          <App />
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
