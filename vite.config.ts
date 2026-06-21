import { defineConfig } from "vite";

// Relative base so the build works under any static host, including a
// GitHub Pages project subpath (user.github.io/Tetra-Vex-Solver/).
export default defineConfig({
  base: "./",
});
