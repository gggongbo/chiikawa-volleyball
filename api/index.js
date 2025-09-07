const express = require("express");
const app = express();

// 기본 /api 경로
app.get("/", (req, res) => {
  console.log("api root called");
  res.json({ message: "API Root" });
});

app.get("/hello", (req, res) => {
  console.log("hello world");
  res.send("Hello World!");
});

app.get("/test", (req, res) => {
  console.log("test api called");
  res.json({ message: "Test API" });
});

app.all("*", (req, res) => {
  console.log(`Request to: ${req.url}`);
  res.status(404).json({
    error: "Not Found",
    path: req.url,
    method: req.method,
  });
});

module.exports = app;

// app.listen(port, () => {
//   console.error(`서버가 http://localhost:${port} 에서 실행 중입니다`);
// });
