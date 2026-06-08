import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const apiProxyTarget = env.VITE_API_PROXY_TARGET || "http://34.228.112.95";
  const proxyOptions = {
    target: apiProxyTarget,
    changeOrigin: true,
    secure: false,
  };

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        "/api": proxyOptions,
        "/media": proxyOptions,
        "/static": proxyOptions,
      },
    },
    build: { outDir: "dist" },
  };
});
