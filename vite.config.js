import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const siteUrl = (env.VITE_SITE_URL || "https://raypurba.my.id").replace(
    /\/+$/,
    ""
  );

  return {
    plugins: [
      react(),
      {
        name: "inject-site-url",
        enforce: "post",
        transformIndexHtml(html) {
          return html.replaceAll("__SITE_URL__", siteUrl);
        },
      },
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes("node_modules")) return undefined;
            // Keep prop-types out of the three chunk: the timeline library
            // needs it eagerly, which would otherwise pull three.js into the
            // initial bundle.
            if (id.includes("node_modules/prop-types")) return "vendor";
            if (
              id.includes("/react/") ||
              id.includes("react-dom") ||
              id.includes("react-router") ||
              id.includes("react-reconciler") ||
              id.includes("/scheduler/")
            ) {
              return "react";
            }
            return undefined;
          },
        },
      },
    },
  };
});
