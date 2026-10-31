import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const siteUrl = (env.VITE_SITE_URL || "https://raypurba.com").replace(
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
            if (
              id.includes("/three/") ||
              id.includes("@react-three") ||
              id.includes("/maath/")
            ) {
              return "three";
            }
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
