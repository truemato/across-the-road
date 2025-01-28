//app.js

import dotenv from "dotenv";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";
import lastplace from "./models/lastplace.js";
import haikuplace from "./models/haikuplace.js";
let arduinoData = { run : 0, output_rpm: 0 };

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// ミドルウェア
app.use(express.json());
app.use(express.static('public'));

let currentLat = 0;
let currentLng = 0;
let totalValue = 0; // センサーの合計値を管理する変数

const portName = "COM5"; // Arduino が接続されているポートに変更
const baudRate = 9600;   // Arduino の通信速度に合わせる

const port = new SerialPort({ path: portName, baudRate });
const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));
// MongoDB接続
mongoose.connect(process.env.MONGO_URI)
 .then(async () => {
   console.log("Connected to MongoDB");
   const data = await lastplace.find().sort({ timestamp: -1 });
   if (data.length > 0) {
     currentLat = data[0].lat;
     currentLng = data[0].lng;
     console.log("Location:", { lat: currentLat, lng: currentLng });
   }
 })
 .catch(err => console.error("MongoDB connection error:", err));

// LastPlaceの取得関数
async function fetchLastPlace() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const lastPlace = await lastplace.findOne().sort({ timestamp: -1 });
    console.log("Last Place:", lastPlace);

    return lastPlace;
  } catch (error) {
    console.error("Error fetching last place:", error);
  } finally {
    mongoose.connection.close();
  }
}

process.stdin.setEncoding("utf-8");
process.stdin.on("data", async (line) => {
  try {
    const location = JSON.parse(line.trim());
    const { lat, lng, placename } = location;

    // クライアントに送信
    io.emit("locationUpdate", { lat, lng, placename, comment });

    // DBに保存
    const newPlace = new HaikuPlace({ lat, lng, placename,comment ,  timestamp: new Date() });
    await newPlace.save();
    console.log("Location saved:", newPlace);
  } catch (error) {
    console.error("Error processing input:", error.message);
  }
});

// APIエンドポイント
app.post("/api/update-location", async (req, res) => {
  const { lat, lng, placename } = req.body;
  try {
    const newPlace = new HaikuPlace({ lat, lng, placename, comment , timestamp: new Date() });
    await newPlace.save();
    res.json(newPlace);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

parser.on('data', (data) => {
  try {
      // Arduinoから送られてきたJSONをパースして保持
      arduinoData = JSON.parse(data);

  } catch (err) {
      console.error('Invalid JSON:', data);
  }
});
app.get('/data', (req, res) => {
  res.json(arduinoData); // 最新のArduinoデータを返す
});

app.get("/api/sensor", (req, res) => {
  res.json(currentValue);
});
app.get('/api/haikuplace', async (req, res) => {
  try {
    const haikus = await haikuplace.find().sort({ timestamp: -1 });
    res.json(haikus);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/haikuplace', async (req, res) => {
  try {
    const { lat, lng, placename, comment } = req.body; 
    const newHaiku = new haikuplace({ lat, lng, placename, comment }); // commentを保存
    await newHaiku.save();
    res.status(201).json(newHaiku);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/lastplace', async (req, res) => {
  try {
    const haikus = await lastplace.find().sort({ timestamp: -1 });
    res.json(haikus);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/lastplace', async (req, res) => {
  try {
    const { lat, lng, placename, comment  } = req.body;
    const newHaiku = new lastplace({ lat, lng, placename, comment });
    await newHaiku.save();
    res.status(201).json(newHaiku);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

io.on("connection", (socket) => {
  console.log("Client connected");

  // クライアントからのデータを受信
  socket.on("locationUpdate", (data) => {
    console.log(`Received location: ${JSON.stringify(data)}`); // ターミナルに出力
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

server.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});
