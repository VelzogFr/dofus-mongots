import { Router } from 'express';

import { Item, ITEM_CATEGORIES } from './item.model.js';
import { EquipmentSet } from '../sets/set.model.js';
import { Monster } from '../monsters/monster.model.js';
import { PUBLIC_FIELDS, firstString, nameFilter, optionalInt, paged, pagination, parseAnkamaId } from '../../utils/query.js';

const router = Router();

const SUMMARY_FIELDS = { _id: 0, ankamaId: 1, name: 1, type: 1, level: 1, image: 1 } as const;

const MAX_IDS = 100;

router.get('/', async (req, res) => {
  const ids = firstString(req.query.ids)?.split(',').map((s) => parseAnkamaId(s.trim()));
  if (ids && (ids.length > MAX_IDS || ids.some((id) => id === null))) {
    res.status(400).json({ error: `ids must be up to ${MAX_IDS} comma-separated positive integers` });
    return;
  }
  const category = firstString(req.query.category);
  if (category && !(ITEM_CATEGORIES as readonly string[]).includes(category)) {
    res.status(400).json({ error: `category must be one of: ${ITEM_CATEGORIES.join(', ')}` });
    return;
  }
  const type = firstString(req.query.type);
  const setId = optionalInt(req.query.setId);
  const minLevel = optionalInt(req.query.minLevel);
  const maxLevel = optionalInt(req.query.maxLevel);

  const filter: Record<string, unknown> = { ...nameFilter(req.query.q) };
  if (ids) filter.ankamaId = { $in: ids };
  if (category) filter.category = category;
  if (type) filter.type = type;
  if (setId !== undefined) filter.setId = setId;
  if (minLevel !== undefined || maxLevel !== undefined) {
    filter.level = { ...(minLevel !== undefined && { $gte: minLevel }), ...(maxLevel !== undefined && { $lte: maxLevel }) };
  }

  const page = pagination(req.query);
  const [items, total] = await Promise.all([
    Item.find(filter, PUBLIC_FIELDS).sort({ level: 1, name: 1 }).skip(page.skip).limit(page.limit).lean(),
    Item.countDocuments(filter),
  ]);
  res.json(paged(items, total, page));
});

router.get('/types', async (_req, res) => {
  const types = await Item.aggregate([
    { $match: { category: 'equipment', type: { $ne: null } } },
    { $sort: { level: 1 } },
    { $group: { _id: '$type', count: { $sum: 1 }, image: { $first: '$image' } } },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, type: '$_id', count: 1, image: 1 } },
  ]);
  res.json(types);
});

router.get('/:id', async (req, res) => {
  const id = parseAnkamaId(req.params.id);
  if (id === null) {
    res.status(400).json({ error: 'id must be a positive integer' });
    return;
  }
  const item = await Item.findOne({ ankamaId: id }, PUBLIC_FIELDS).lean();
  if (!item) {
    res.status(404).json({ error: 'item not found' });
    return;
  }

  const [set, ingredients, droppers] = await Promise.all([
    typeof item.setId === 'number' ? EquipmentSet.findOne({ ankamaId: item.setId }, PUBLIC_FIELDS).lean() : null,
    Item.find({ ankamaId: { $in: item.recipe.map((r) => r.itemId) } }, SUMMARY_FIELDS).lean(),
    Monster.find({ 'drops.itemId': id }, { _id: 0, ankamaId: 1, name: 1, race: 1, image: 1, grades: 1, 'drops.$': 1 }).lean(),
  ]);
  const setItemIds: number[] = set?.itemIds ?? [];
  const setItems = setItemIds.length ? await Item.find({ ankamaId: { $in: setItemIds } }, SUMMARY_FIELDS).lean() : [];
  const byId = new Map([...ingredients, ...setItems].map((i) => [i.ankamaId, i]));

  res.json({
    ...item,
    set: set && { ...set, items: set.itemIds.map((sid) => byId.get(sid)).filter(Boolean) },
    recipe: item.recipe.map((r) => ({ ...r, item: byId.get(r.itemId) ?? null })),
    droppedBy: droppers.map(({ drops, grades, ...monster }) => ({
      ...monster,
      levels: [Math.min(...grades.map((g) => g.level)), Math.max(...grades.map((g) => g.level))],
      rates: drops[0]?.rates ?? [],
    })),
  });
});

export default router;
