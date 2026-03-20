import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

import { cloudflare } from "@cloudflare/vite-plugin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte(), tailwindcss(), cloudflare()],
  resolve: {
    alias: {
      $lib: path.resolve("./src/lib"),
    },
  },
});