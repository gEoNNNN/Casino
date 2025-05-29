import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  base: "/", // 👈 Important for correct routing on Netlify
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  build: {
    outDir: "build/client", // 👈 Ensure Vite outputs to the correct folder
    emptyOutDir: true,
  },
});
