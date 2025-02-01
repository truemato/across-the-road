// models/haikuplace.mjs
import mongoose from 'mongoose';

const HaikuPlaceSchema = new mongoose.Schema({
  lat: Number,
  lng: Number,
  placename: String,
  comment: String,
  timestamp: { type: Date, default: Date.now }
});

export const HaikuPlace = mongoose.model("HaikuPlace", HaikuPlaceSchema, "haikuplace");