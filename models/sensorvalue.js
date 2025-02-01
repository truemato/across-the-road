const mongoose = require("mongoose");

const SensorValueSchema = new mongoose.Schema({
  value: Number,          // 例: センサー生値や runValue
  total: Number,          // 例: 累計など
  lat: Number,            // 追記
  lng: Number,            // 追記
  updateCount: Number,    // 追記：更新回数
  totalDistance: Number,  // 追記：総移動距離 (cm or mなど)
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("SensorValue", SensorValueSchema, "sensorvalue");
