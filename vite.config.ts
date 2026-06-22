/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Relative base so the build works under any static host, including a
// GitHub Pages project subpath (user.github.io/Tetra-Vex-Solver/).
export default defineConfig({
  base: "./",
  // host: true → listen on 0.0.0.0 so the dev/preview server is reachable on
  // the local network (phone, other machines).
  server: { host: true },
  preview: { host: true },
  plugins: [react(), tailwindcss()],
  test: {
    environment: "node",
  },
});
