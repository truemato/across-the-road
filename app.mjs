import dotenv from "dotenv";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";
import lastplace from "./models/lastplace.js";
import haikuplace from "./models/haikuplace.js";
import sensorvalue from "./models/sensorvalue.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// ミドルウェア
app.use(express.json());
app.use(express.static("public"));

// テンプレートエンジン設定
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index', {
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY
  });
});

let currentLat = 0;
let currentLng = 0;
let arduinoData = { run: 0, output_rpm: 0 };

// MongoDB接続
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ボーレート設定
const baudRate = 9600;

// ポートを動的に取得する関数
async function findArduinoPort() {
  const ports = await SerialPort.list();
  console.log("Available ports:", ports);

  // Arduino のポートを検索
  const arduinoPort = ports.find((port) =>
    port.manufacturer && port.manufacturer.includes("Arduino")
  );

  if (arduinoPort) {
    console.log(`Arduino found on ${arduinoPort.path}`);
    return arduinoPort.path;
  } else {
    console.error("No Arduino device found.");
    return null;
  }
}

// Arduino ポートを取得して接続
(async () => {
  const portName = await findArduinoPort();
  if (!portName) return;

  // シリアル通信設定
  const port = new SerialPort({ path: portName, baudRate });
  const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

  port.on("open", () => console.log(`Connected to ${portName}`));
  port.on("error", (err) => console.error("Serial Port Error:", err.message));

  // データ受信
  parser.on("data", (data) => {
    try {
      arduinoData = JSON.parse(data);
    } catch (err) {
      console.error("Invalid JSON:", data);
    }
  });
})();

// APIエンドポイント

// 最新のArduinoデータを取得
app.get("/data", (req, res) => {
  res.json(arduinoData);
});

// LastPlace 取得・登録
app.get("/api/lastplace", async (req, res) => {
  try {
    const places = await lastplace.find().sort({ timestamp: -1 });
    res.json(places);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/lastplace", async (req, res) => {
  try {
    const { lat, lng, placename, comment } = req.body;
    const newPlace = new lastplace({ lat, lng, placename, comment });
    await newPlace.save();
    res.status(201).json(newPlace);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// SensorValue 取得・登録
app.get("/api/sensorvalue", async (req, res) => {
  try {
    const sensorValues = await sensorvalue.find().sort({ timestamp: -1 });
    res.json(sensorValues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/sensorvalue", async (req, res) => {
  try {
    const { value, total, lat, lng, updateCount, totalDistance } = req.body;
    const newSensorValue = new sensorvalue({
      value,
      total,
      lat,
      lng,
      updateCount,
      totalDistance,
      timestamp: new Date(),
    });

    await newSensorValue.save();
    res.status(201).json(newSensorValue);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// HaikuPlace 取得・登録
app.get("/api/haikuplace", async (req, res) => {
  try {
    const haikus = await haikuplace.find().sort({ timestamp: -1 });
    res.json(haikus);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/haikuplace", async (req, res) => {
  try {
    let { lat, lng, placename, comment } = req.body;

    if (!placename || placename.trim() === "") {
      const apiKey = process.env.GOOGLE_MAP_API_KEY;
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
      const response = await fetch(geocodeUrl);
      const data = await response.json();

      if (data.results?.length > 0) {
        placename = data.results[0].formatted_address;
      } else {
        placename = "";
      }
    }

    const newHaiku = new haikuplace({ lat, lng, placename, comment, timestamp: new Date() });
    await newHaiku.save();
    res.status(201).json(newHaiku);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// WebSocket 接続処理
io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("locationUpdate", (data) => {
    console.log(`Received location: ${JSON.stringify(data)}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// サーバー起動
server.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});
