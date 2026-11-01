const BASE_URL = 'https://api.dofusdu.de/dofus3/v1';
const LANG = 'fr';

interface RawEffect {
  int_minimum: number;
  int_maximum: number;
  type?: { name?: string };
  formatted: string;
}

interface RawRecipeEntry {
  item_ankama_id: number;
  item_subtype: string;
  quantity: number;
}

interface RawImages {
  icon?: string;
  sd?: string;
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

export interface RawSet {
  ankama_id: number;
  name: string;
  equipment_ids: number[];
  highest_equipment_level: number;
  effects?: Record<string, RawEffect[] | null> | null;
}

interface RawMount {
  ankama_id: number;
  name: string;
  family?: { name?: string };
  image_urls?: RawImages;
}

export interface EffectInput {
  label: string;
  min: number;
  max: number | null;
  text: string;
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

export interface SetInput {
  ankamaId: number;
  name: string;
  level: number;
  itemIds: number[];
  bonuses: { pieces: number; effects: EffectInput[] }[];
}

export interface MountInput {
  ankamaId: number;
  name: string;
  family: string | null;
  image: string | null;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`dofusdude ${res.status} on ${path}`);
  return (await res.json()) as T;
}

const HIDDEN_EFFECT = /échangeable|special spell|attitude/i;

function toEffects(raw: RawEffect[] | null | undefined): EffectInput[] {
  return (raw ?? [])
    .map((e) => ({ label: e.type?.name ?? '', min: e.int_minimum, max: e.int_maximum || null, text: e.formatted }))
    .filter((e) => e.label && !HIDDEN_EFFECT.test(e.label) && !HIDDEN_EFFECT.test(e.text));
}

const imageOf = (images: RawImages | undefined) => images?.sd ?? images?.icon ?? null;

export function toItem(raw: RawItem, category: ItemInput['category']): ItemInput {
  return {
    ankamaId: raw.ankama_id,
    category,
    name: raw.name,
    type: raw.type?.name ?? null,
    level: raw.level,
    description: raw.description || null,
    image: imageOf(raw.image_urls),
    effects: toEffects(raw.effects),
    setId: raw.parent_set?.id ?? null,
    recipe: (raw.recipe ?? []).map((r) => ({ itemId: r.item_ankama_id, quantity: r.quantity })),
  };
}

export function toSet(raw: RawSet): SetInput {
  return {
    ankamaId: raw.ankama_id,
    name: raw.name,
    level: raw.highest_equipment_level,
    itemIds: raw.equipment_ids,
    bonuses: Object.entries(raw.effects ?? {})
      .map(([pieces, effects]) => ({ pieces: Number(pieces), effects: toEffects(effects) }))
      .filter((b) => b.effects.length > 0),
  };
}

export const fetchVersion = () => get<{ version: string }>('/meta/version').then((v) => v.version);

export const fetchSet = (id: number) => get<RawSet>(`/${LANG}/sets/${id}`);

export const fetchEquipment = (id: number) => get<RawItem>(`/${LANG}/items/equipment/${id}`);

export async function searchEquipment(query: string): Promise<RawItem | undefined> {
  const hits = await get<RawItem[]>(`/${LANG}/items/equipment/search?query=${encodeURIComponent(query)}&limit=1`);
  return hits[0];
}

const SUBTYPE = /^[a-z-]+$/;

export function fetchRecipeItem(subtype: string, id: number): Promise<RawItem> {
  if (!SUBTYPE.test(subtype)) throw new Error(`unexpected item subtype "${subtype}"`);
  return get<RawItem>(`/${LANG}/items/${subtype}/${id}`);
}

export async function fetchMounts(count: number): Promise<MountInput[]> {
  const page = await get<{ mounts: RawMount[] }>(`/${LANG}/mounts?page[size]=${count}`);
  return page.mounts.map((m) => ({ ankamaId: m.ankama_id, name: m.name, family: m.family?.name ?? null, image: imageOf(m.image_urls) }));
}
