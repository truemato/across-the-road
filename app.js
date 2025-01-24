require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const SensorValue = require("./models/SensorValue");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// MongoDB 接続
// サーバー起動時に MongoDB から最新の座標を取得して設定
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log("Connected to MongoDB");

    // 最新のセンサーデータを取得
    const latestSensorValue = await SensorValue.findOne().sort({ timestamp: -1 });
    if (latestSensorValue) {
      currentLat = latestSensorValue.lat;
      currentLng = latestSensorValue.lng;
      console.log("Loaded latest location from DB:", { lat: currentLat, lng: currentLng });
    } else {
      console.log("No previous sensor data found. Using default location (Tokyo Station).");
    }
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// 入力データスキーマ
const InputSchema = new mongoose.Schema({
  input: String,
  timestamp: { type: Date, default: Date.now },
});
const InputModel = mongoose.model("Input", InputSchema);


const InputLog = require("./models/InputLog");

// クライアント接続
io.on("connection", (socket) => {
  console.log("Client connected");

  // センサー値の送信
  setInterval(() => {
    const sensorData = {
      value: Math.floor(Math.random() * 100), // センサー値のランダム生成（デモ用）
      total: Math.floor(Math.random() * 1000), // 合計値（デモ用）
      lat: 35.6895 + Math.random() * 0.001, // デモ用にランダムな緯度
      lng: 139.6917 + Math.random() * 0.001, // デモ用にランダムな経度
    };
    socket.emit("sensorData", sensorData);
  }, 1000);

  // 入力データを保存
  socket.on("inputData", async (data) => {
    const newInput = new InputModel({ input: data.input });
    await newInput.save();

    // 全クライアントに送信
    io.emit("inputLog", { input: data.input });
  });
});

// 静的ファイルの提供
app.use(express.static("public"));

// サーバー起動
server.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});
