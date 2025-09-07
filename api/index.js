const express = require("express");
const app = express();
// const port = 3000;

// /api prefix 라우터 생성
const apiRouter = express.Router();

// 하위 라우트들
apiRouter.get("/hello", (req, res) => {
  console.log("hello world");
  res.send("Hello World!");
});

apiRouter.get("/test", (req, res) => {
  console.log("test api called");
  res.json({ message: "Test API" });
});

// 기본 /api 경로
apiRouter.get("/", (req, res) => {
  console.log("api root called");
  res.json({ message: "API Root" });
});

// /api prefix로 라우터 연결
app.use("/api", apiRouter);

module.exports = app;

// app.listen(port, () => {
//   console.error(`서버가 http://localhost:${port} 에서 실행 중입니다`);
// });
