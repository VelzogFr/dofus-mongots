import { Schema } from 'mongoose';

// Effet d'un objet ou d'un bonus de panoplie, ex. "16 à 20 Force"
export const effectSchema = new Schema(
  {
    label: { type: String, required: true },
    min: { type: Number, required: true },
    max: { type: Number, default: null },
    text: { type: String, required: true },
  },
  { _id: false },
);
