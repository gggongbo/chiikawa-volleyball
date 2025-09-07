import express from "express";
const app = express();

// 기본 /api 경로
app.get("/api", (req, res) => {
  console.log("api root called");
  res.json({ message: "API Root" });
});

app.get("/api/hello", (req, res) => {
  console.log("hello world");
  res.send("Hello World!");
});

app.get("/test", (req, res) => {
  console.log("test api called");
  res.json({ message: "Test API" });
});

app.use("*", (req, res, next) => {
  console.log(`Request: ${req.method} ${req.originalUrl}`);
  next();
});

// 404 처리
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Not Found",
    path: req.originalUrl,
    availableRoutes: ["/api", "/api/hello", "/api/test"],
  });
});

export default app;

// app.listen(port, () => {
//   console.error(`서버가 http://localhost:${port} 에서 실행 중입니다`);
// });
