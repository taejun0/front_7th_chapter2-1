import { defineConfig } from "vite";

// GitHub Pages 배포를 위한 base 경로 설정
// 저장소 이름: front_7th_chapter2-1
export default defineConfig({
  base: process.env.NODE_ENV === "production" ? "/front_7th_chapter2-1/" : "/",
  build: {
    outDir: "dist",
  },
});
