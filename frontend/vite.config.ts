import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [svgr(), react()],
  base: "/", // ✅ absolute root, not relative
  define: {
    global: "window",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@assets": path.resolve(__dirname, "./public/assets"),
    },
  },
});
