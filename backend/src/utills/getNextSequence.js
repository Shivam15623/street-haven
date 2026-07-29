// utils/getNextSequence.js

import Counter from "../model/Counter.js";


export async function getNextSequence(name) {
  const counter = await Counter.findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true } // creates it if it doesn't exist, starts at 1
  );
  return counter.seq;
}