import { Schema } from 'mongoose';

export const effectSchema = new Schema(
  {
    label: { type: String, required: true },
    min: { type: Number, required: true },
    max: { type: Number, default: null },
    text: { type: String, required: true },
  },
  { _id: false },
);
