import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// PWA manifest와 service worker는 public/ 에 정적 파일로 두고 main.tsx에서 등록한다.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
});
