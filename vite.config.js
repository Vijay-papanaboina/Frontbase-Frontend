import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: ["dassie-worthy-ox.ngrok-free.app"],
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
