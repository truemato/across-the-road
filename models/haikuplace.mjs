import mongoose from "mongoose";

const HaikuPlaceSchema = new mongoose.Schema({
  lat: Number,
  lng: Number,
  placename : String,
  comment : String,
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("HaikuPlace", HaikuPlaceSchema,"haikuplace");