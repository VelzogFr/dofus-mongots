import mongoose, { type Model } from 'mongoose';
import dotenv from 'dotenv';

import { Item } from '../items/item.model.js';
import { EquipmentSet } from '../sets/set.model.js';
import { Monster } from '../monsters/monster.model.js';
import { Mount } from '../mounts/mount.model.js';
import * as dofusdude from './dofusdude.js';
import * as dofusdb from './dofusdb.js';
import type { ItemInput } from './dofusdude.js';
import type { MonsterInput } from './dofusdb.js';

dotenv.config();

const SET_IDS = [1, 4];
const EXTRA_EQUIPMENT = ['Gelano', 'Dofus Émeraude', 'Dofus Pourpre', 'Dofus Turquoise', 'Épée de Boisaille', 'Bottes de Klime'];
const MONSTER_NAMES = ['Bouftou', 'Boufton Blanc', 'Chef de Guerre Bouftou', 'Bouftou Royal', 'Tofu', 'Craqueleur', 'Dragon Cochon', 'Larve Bleue'];
const MOUNT_COUNT = 8;

async function collectItemsAndSets() {
  const equipment = new Map<number, dofusdude.RawItem>();
  const sets = await Promise.all(SET_IDS.map(dofusdude.fetchSet));
  for (const set of sets) {
    for (const piece of await Promise.all(set.equipment_ids.map(dofusdude.fetchEquipment))) equipment.set(piece.ankama_id, piece);
  }
  for (const name of EXTRA_EQUIPMENT) {
    const hit = await dofusdude.searchEquipment(name);
    if (!hit) console.warn(`equipment not found: ${name}`);
    else if (!equipment.has(hit.ankama_id)) equipment.set(hit.ankama_id, await dofusdude.fetchEquipment(hit.ankama_id));
  }

  const resources = new Map<number, string>();
  for (const raw of equipment.values()) {
    for (const r of raw.recipe ?? []) if (!equipment.has(r.item_ankama_id)) resources.set(r.item_ankama_id, r.item_subtype);
  }
  const rawResources = await Promise.all([...resources].map(([id, subtype]) => dofusdude.fetchRecipeItem(subtype, id)));

  const items: ItemInput[] = [
    ...[...equipment.values()].map((raw) => dofusdude.toItem(raw, 'equipment')),
    ...rawResources.map((raw) => dofusdude.toItem(raw, 'resource')),
  ];
  return { items, sets: sets.map(dofusdude.toSet) };
}

async function collectMonsters(items: ItemInput[]): Promise<MonsterInput[]> {
  const known = new Set(items.map((i) => i.ankamaId));
  const raw = new Map<number, dofusdb.RawMonster>();
  for (const name of MONSTER_NAMES) {
    const hit = await dofusdb.findMonster(name);
    if (hit) raw.set(hit.id, hit);
    else console.warn(`monster not found: ${name}`);
  }
  for (const item of items.filter((i) => i.category === 'equipment')) {
    for (const m of await dofusdb.findMonstersDropping(item.ankamaId)) if (!raw.has(m.id)) raw.set(m.id, m);
  }
  return Promise.all([...raw.values()].map((m) => dofusdb.toMonster(m, known)));
}

async function upsert<T extends { ankamaId: number }>(model: Model<any>, docs: T[]): Promise<string> {
  await Promise.all(docs.map((doc) => new model(doc).validate()));
  await model.createIndexes();
  const res = await model.bulkWrite(
    docs.map((doc) => ({ updateOne: { filter: { ankamaId: doc.ankamaId }, update: { $set: doc }, upsert: true } })),
  );
  return `${model.collection.collectionName}: ${docs.length} docs (${res.upsertedCount} new, ${res.modifiedCount} updated)`;
}

async function main() {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) throw new Error('DATABASE_URL is missing from .env');

  console.log(`Fetching Dofus ${await dofusdude.fetchVersion()} data...`);
  const { items, sets } = await collectItemsAndSets();
  const monsters = await collectMonsters(items);
  const mounts = await dofusdude.fetchMounts(MOUNT_COUNT);

  await mongoose.connect(DATABASE_URL);
  try {
    for (const line of [
      await upsert(Item, items),
      await upsert(EquipmentSet, sets),
      await upsert(Monster, monsters),
      await upsert(Mount, mounts),
    ]) console.log(line);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exitCode = 1;
});
