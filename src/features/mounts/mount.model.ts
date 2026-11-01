import { Schema, model, type InferSchemaType } from 'mongoose';
import { effectSchema } from '../items/effect.schema.js';

const mountSchema = new Schema(
  {
    ankamaId: { type: Number, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    family: { type: String, default: null },
    image: { type: String, default: null },
    effects: { type: [effectSchema], default: [] },
  },
  { collection: 'mounts', timestamps: true },
);

mountSchema.index({ family: 1 });

export type MountData = InferSchemaType<typeof mountSchema>;
export const Mount = model('Mount', mountSchema);
