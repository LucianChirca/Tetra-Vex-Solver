import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Relative base so the build works under any static host, including a
// GitHub Pages project subpath (user.github.io/Tetra-Vex-Solver/).
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
});
