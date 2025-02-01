// models/sensorvalue.mjs
import mongoose from 'mongoose';

const SensorValueSchema = new mongoose.Schema({
  value: Number,
  lat: Number,
  lng: Number,
  updateCount: Number,
  totalDistance: Number,
  timestamp: { type: Date, default: Date.now }
});

export const SensorValue = mongoose.model('SensorValue', SensorValueSchema, 'sensorvalue');