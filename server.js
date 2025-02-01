import dotenv from "dotenv";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";  // CORS 対策を追加

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",  // 全てのオリジンを許可 (必要なら制限可能)
    methods: ["GET", "POST"],
  },
});

// CORS ミドルウェアを使用
app.use(cors());
app.use(express.json());

// MongoDB接続
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

let arduinoData = { run: 0, output_rpm: 0 };

// WebSocket サーバーの処理
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // クライアントが "sensorData" を要求したら、最新のArduinoデータを送信
  socket.on("requestSensorData", () => {
    socket.emit("sensorData", arduinoData);
  });

  // 位置情報の更新
  socket.on("locationUpdate", (data) => {
    console.log(`Received location: ${JSON.stringify(data)}`);
    io.emit("locationUpdate", data); // 他のクライアントにも送信
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// サーバー起動
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
