import dotenv from "dotenv";
import express from "express";
import http from "http";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import { HaikuPlace } from './models/haikuplace.mjs';
import { SensorValue } from './models/sensorvalue.mjs';

dotenv.config();

const app = express();
const server = http.createServer(app);

// ESM 用の __dirname 定義
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.static("public"));

// EJS テンプレートエンジン設定
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  res.render("index", {
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
  });
});

// haikuplaceデータ取得用エンドポイント
app.get('/api/haikuplace', async (req, res) => {
  try {
    const haikus = await HaikuPlace.find()
      .sort({ timestamp: -1 })
      .limit(50);
    res.json(haikus);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// センサー値取得用エンドポイント
app.get('/api/sensorvalue', async (req, res) => {
  try {
    const sensorData = await SensorValue.find()
      .sort({ timestamp: -1 })
      .limit(1);
    res.json(sensorData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// MongoDB に接続
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// サーバー起動
server.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});