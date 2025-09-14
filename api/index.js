const express = require("express");

// 환경변수 세팅
const BE_ENV = process.env.BE_ENV || "local";
const IS_BE_LOCAL = BE_ENV === "local";

// Express 앱 초기화
const app = express();

// Set maximum content length to 1MB (to account for multiple images)
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ limit: "1mb", extended: true }));

// 로깅 미들웨어
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const level = IS_BE_LOCAL ? "DEBUG" : "INFO";
  console.log(`${timestamp} - ${level} - ${req.method} ${req.url}`);
  next();
});

// API 라우터 설정
const apiRouter = express.Router();

// API 라우트들
apiRouter.get("/", (req, res) => {
  console.log("api test called");
  res.json({ message: "api test" });
});

apiRouter.get("/hello", (req, res) => {
  console.log("hello world");
  res.json({ message: "hello test" });
});

// API prefix 등록
app.use("/api", apiRouter);

if (IS_BE_LOCAL) {
  // 로컬 실행용
  const port = parseInt(process.env.PORT || "8080");
  app.listen(port, "0.0.0.0", () => {
    console.log(`서버가 http://0.0.0.0:${port} 에서 실행 중입니다`);
  });
} else {
  // Vercel에서 실행될 때
  module.exports = app;
}
