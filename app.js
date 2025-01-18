const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { SerialPort } = require('serialport'); // 修正ポイント
const { ReadlineParser } = require('@serialport/parser-readline'); // 修正ポイント

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// シリアルポート設定
const portName = 'COM5'; // Arduinoのポートを指定 (環境に応じて変更)
const baudRate = 9600;

const port = new SerialPort({ path: portName, baudRate }); // 修正ポイント
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' })); // 修正ポイント

// 静的ファイルを配信
app.use(express.static('public'));

// 合計値を保持
let totalValue = 0;

parser.on('data', (line) => {
  const sensorValue = parseInt(line.trim(), 10);
  if (!isNaN(sensorValue)) {
    totalValue += sensorValue;

    // クライアントにデータを送信
    io.emit('sensorData', { value: sensorValue, total: totalValue });
  }
});

parser.on('error', (err) => {
  console.error('Serial Port Error:', err.message);
});

// クライアント接続時の処理
io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('A client disconnected:', socket.id);
  });
});

// サーバー起動
const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
