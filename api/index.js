const express = require("express");
const app = express();
const port = 3000;

app.get("/hello", (req, res) => {
  console.log("hello world");
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다`);
});
