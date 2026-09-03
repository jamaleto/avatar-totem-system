import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // permite acessar o totem por outro dispositivo na mesma rede (ex: tablet)
    host: true,
  },
});
