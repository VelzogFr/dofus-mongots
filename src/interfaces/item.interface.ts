import type { EffectInput, RawEffect } from './effect.interface.js';
import type { RawImages } from './image.interface.js';

export interface RawRecipeEntry {
  item_ankama_id: number;
  item_subtype: string;
  quantity: number;
}

export interface RawItem {
  ankama_id: number;
  name: string;
  type?: { name?: string };
  level: number;
  description?: string;
  image_urls?: RawImages;
  effects?: RawEffect[] | null;
  parent_set?: { id: number } | null;
  recipe?: RawRecipeEntry[] | null;
}

export interface ItemInput {
  ankamaId: number;
  category: 'equipment' | 'resource';
  name: string;
  type: string | null;
  level: number;
  description: string | null;
  image: string | null;
  effects: EffectInput[];
  setId: number | null;
  recipe: { itemId: number; quantity: number }[];
}
