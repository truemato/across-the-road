import mongoose from "mongoose";

const LastPlaceSchema = new mongoose.Schema({
  lat: Number,
  lng: Number,
  placename: String,
  comment: String,
  timestamp: { type: Date, default: Date.now },
});

export const LastPlace = mongoose.model("LastPlace", LastPlaceSchema, "lastplace");