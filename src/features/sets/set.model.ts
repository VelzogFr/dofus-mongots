import { Schema, model, type InferSchemaType } from 'mongoose';
import { effectSchema } from '../items/effect.schema.js';

const setBonusSchema = new Schema(
  {
    pieces: { type: Number, required: true, min: 2 },
    effects: { type: [effectSchema], default: [] },
  },
  { _id: false },
);

const setSchema = new Schema(
  {
    ankamaId: { type: Number, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    level: { type: Number, required: true, min: 0 },
    // References vers items.ankamaId
    itemIds: { type: [Number], default: [] },
    bonuses: { type: [setBonusSchema], default: [] },
  },
  { collection: 'sets', timestamps: true },
);

setSchema.index({ itemIds: 1 });
setSchema.index({ name: 'text' }, { default_language: 'french' });

export type EquipmentSetData = InferSchemaType<typeof setSchema>;
// "Set" masquerait le Set natif de JavaScript
export const EquipmentSet = model('EquipmentSet', setSchema);
