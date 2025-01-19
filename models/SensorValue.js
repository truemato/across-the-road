const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sensorValueSchema = new Schema({
  value: Number, // センサーの現在の値
  total: Number, // 合計値
  lat: Number, // 緯度
  lng: Number, // 経度
  timestamp: { type: Date, default: Date.now }, // 保存時刻
});

module.exports = mongoose.model("SensorValue", sensorValueSchema);
