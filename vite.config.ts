import { defineConfig } from "vite";

export default defineConfig({
  // Keep font subsets cacheable files and compatible with font-src 'self'.
  build: { assetsInlineLimit: 0 },
});
