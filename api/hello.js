import app from "./index.js";

// 기본 /api 경로
app.get("/hello", (req, res) => {
  console.log("hello root called");
  res.json({ message: "Hello Root" });
});
