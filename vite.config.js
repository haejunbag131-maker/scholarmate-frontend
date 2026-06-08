import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const apiProxyTarget = env.VITE_API_PROXY_TARGET;
  const proxyOptions = apiProxyTarget
    ? {
        target: apiProxyTarget,
        changeOrigin: true,
        secure: false,
      }
    : null;

  return {
    plugins: [react()],
    server: {
      port: 5173,
      ...(proxyOptions
        ? {
            proxy: {
              "/api": proxyOptions,
              "/media": proxyOptions,
              "/static": proxyOptions,
            },
          }
        : {}),
    },
    build: { outDir: "dist" },
  };
});
