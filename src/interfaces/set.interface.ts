import type { EffectInput, RawEffect } from './effect.interface.js';

export interface RawSet {
  ankama_id: number;
  name: string;
  equipment_ids: number[];
  highest_equipment_level: number;
  effects?: Record<string, RawEffect[] | null> | null;
}

export interface SetInput {
  ankamaId: number;
  name: string;
  level: number;
  itemIds: number[];
  bonuses: { pieces: number; effects: EffectInput[] }[];
}
