const mongoose = require("mongoose");

const InputLogSchema = new mongoose.Schema({
  input: String,
  lat: Number,
  lng: Number,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("InputLog", InputLogSchema);
