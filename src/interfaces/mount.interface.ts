import type { EffectInput, RawEffect } from './effect.interface.js';
import type { RawImages } from './image.interface.js';

export interface RawMount {
  ankama_id: number;
  name: string;
  family?: { name?: string };
  image_urls?: RawImages;
  effects?: RawEffect[] | null;
}

export interface MountInput {
  ankamaId: number;
  name: string;
  family: string | null;
  image: string | null;
  effects: EffectInput[];
}
