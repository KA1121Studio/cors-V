// server.js
import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 静的ファイルを public 配下に置く
app.use(express.static(path.join(__dirname, "public")));

// CORS 許可
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

// /proxy?url=外部URL
app.get("/proxy", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send({ error: "urlが必要です" });

  try {
    const response = await fetch(url);
    const contentType = response.headers.get("content-type");

    // JSONならそのまま返す
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      res.json(data);
    } else {
      // 動画や音声はバイナリで返す
      const buffer = await response.arrayBuffer();
      res.setHeader("Content-Type", contentType || "application/octet-stream");
      res.send(Buffer.from(buffer));
    }
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// ポート
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
