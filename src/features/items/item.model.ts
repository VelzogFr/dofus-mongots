import { Schema, model, type InferSchemaType } from 'mongoose';
import { effectSchema } from './effect.schema.js';

export const ITEM_CATEGORIES = ['equipment', 'resource'] as const;

const recipeEntrySchema = new Schema(
  {
    itemId: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const itemSchema = new Schema(
  {
    ankamaId: { type: Number, required: true, unique: true },
    category: { type: String, enum: ITEM_CATEGORIES, required: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, default: null },
    level: { type: Number, required: true, min: 0 },
    description: { type: String, default: null },
    image: { type: String, default: null },
    effects: { type: [effectSchema], default: [] },
    // Reference vers sets.ankamaId
    setId: { type: Number, default: null },
    // itemId : reference vers items.ankamaId
    recipe: { type: [recipeEntrySchema], default: [] },
  },
  { collection: 'items', timestamps: true },
);

itemSchema.index({ category: 1, type: 1, level: 1 });
itemSchema.index({ setId: 1 });
itemSchema.index({ name: 'text' }, { default_language: 'french' });

export type ItemData = InferSchemaType<typeof itemSchema>;
export const Item = model('Item', itemSchema);
