// models/Counter.js
import mongoose from "mongoose";

const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // e.g. "ticketNumber"
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model("Counter", CounterSchema);
export default Counter;