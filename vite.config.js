import { defineConfig } from "vite";

export default defineConfig({
  root: __dirname,
  build: {
    outDir: "./dist",
    reportCompressedSize: true,
    emptyOutDir: true,
    publicDir: "./public/", //image, audio 파일 추가시 public 폴더 밑에 두고, 주석해제하기
  },
  server: {
    //로컬 pc에서 dev 명령어 사용할때의 프록시 설정
    proxy: {
      "/api": "http://localhost:8080",
    },
  },
  preview: {
    //로컬 pc에서 preview 명령어 사용할때의 프록시 설정
    proxy: {
      "/api": "http://localhost:8080",
    },
  },
});
