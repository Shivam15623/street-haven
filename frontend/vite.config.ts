import { defineConfig, loadEnv } from "vite";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import react from "@vitejs/plugin-react";
import path from "path";
import svgr from "vite-plugin-svgr";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const sentryAuthToken = env.SENTRY_AUTH_TOKEN;

  return {
    plugins: [
      svgr(),
      react(),
      // Only upload source maps when a token is available (CI / release builds)
      ...(sentryAuthToken
        ? [
            sentryVitePlugin({
              org: "ifox-solutions",
              project: "street-vercel",
              authToken: sentryAuthToken,
              sourcemaps: { filesToDeleteAfterUpload: ["./dist/**/*.map"] },
              telemetry: false,
            }),
          ]
        : []),
    ],
    build: {
      sourcemap: "hidden",
    },
    base: "/",
    define: {
      global: "window",
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@assets": path.resolve(__dirname, "./public/assets"),
      },
    },
  };
});
