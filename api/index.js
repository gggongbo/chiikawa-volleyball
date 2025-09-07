const express = require("express");
const app = express();
const port = 3000;

app.get("/api/hello", (req, res) => {
  console.error("hello world");
  res.send("Hello World!");
});

app.listen(port, () => {
  console.error(`서버가 http://localhost:${port} 에서 실행 중입니다`);
});
