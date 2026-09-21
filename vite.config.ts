import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "localhost",
    port: 5173
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-framework": ["react", "react-dom", "react-router-dom", "zustand"],
          "vendor-charts": ["recharts"],
          "vendor-icons": ["lucide-react"]
        }
      }
    },
    chunkSizeWarningLimit: 600
  }
});
