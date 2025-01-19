require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const mongoose = require("mongoose");
const SensorValue = require("./models/SensorValue"); // MongoDBモデルを使用

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const { graphqlHTTP } = require("express-graphql");
const schema = require("./schema"); // GraphQL スキーマをインポート

// GraphQL エンドポイント設定
app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    graphiql: true, // GraphiQL を有効化
  })
);
// MongoDB 接続設定
const dbURI = process.env.MONGO_URI; // 環境変数から読み込む
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
});

// シリアルポート設定
const portName = "COM5"; // 使用しているポートに変更してください
const baudRate = 9600;

const port = new SerialPort({ path: portName, baudRate });
const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

// リアルタイムデータと合計値を管理
let totalValue = 0;
let currentValue = 0;

parser.on("data", (line) => {
  const sensorValue = parseInt(line.trim(), 10);
  console.log("Received data from SerialPort:", sensorValue);

  if (!isNaN(sensorValue)) {
    // 合計値と現在の値を更新
    currentValue = sensorValue;
    totalValue += sensorValue;

    // クライアントに送信
    io.emit("sensorData", { value: currentValue, total: totalValue });
  }
});

parser.on("error", (err) => {
  console.error("Serial Port Error:", err.message);
});

// 毎秒 MongoDB にデータを保存
setInterval(async () => {
  try {
    const newValue = new SensorValue({
      value: currentValue,
      total: totalValue,
    });
    await newValue.save();
    console.log("Saved to MongoDB:", newValue);
  } catch (err) {
    console.error("Error saving to MongoDB:", err);
  }
}, 1000);

// 静的ファイルの提供
app.use(express.static("public"));

// サーバー起動
const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
