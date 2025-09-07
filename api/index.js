const express = require("express");
const app = express();
// const port = 3000;

app.get("/", (req, res) => {
  console.error("hello world");
  res.send("Hello World!");
});

// 추가 경로 처리
app.get("/hello", (req, res) => {
  console.error("hello world");
  res.send("Hello World!");
});

module.exports = app;

// app.listen(port, () => {
//   console.error(`서버가 http://localhost:${port} 에서 실행 중입니다`);
// });
