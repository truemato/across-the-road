const mongoose = require("mongoose");

const HaikuPlaceSchema = new mongoose.Schema({
  lat: Number,
  lng: Number,
  placename : String,
  comment : String,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("HaikuPlace", HaikuPlaceSchema,"haikuplace");
