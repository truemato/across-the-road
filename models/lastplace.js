const mongoose = require("mongoose");

const LastPlaceSchema = new mongoose.Schema({
  lat: Number,
  lng: Number,
  placename: String,
  comment: String,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("LastPlace", LastPlaceSchema, "lastplace");
