import { Router } from 'express';

import { Monster } from './monster.model.js';
import { Item } from '../items/item.model.js';
import { PUBLIC_FIELDS, firstString, nameFilter, optionalBool, optionalInt, paged, pagination, parseAnkamaId } from '../../utils/query.js';

const router = Router();

router.get('/', async (req, res) => {
  const race = firstString(req.query.race);
  const boss = optionalBool(req.query.boss);
  const minLevel = optionalInt(req.query.minLevel);
  const maxLevel = optionalInt(req.query.maxLevel);

  const filter: Record<string, unknown> = { ...nameFilter(req.query.q) };
  if (race) filter.race = race;
  if (boss !== undefined) filter.boss = boss;
  if (minLevel !== undefined || maxLevel !== undefined) {
    filter.grades = {
      $elemMatch: { level: { ...(minLevel !== undefined && { $gte: minLevel }), ...(maxLevel !== undefined && { $lte: maxLevel }) } },
    };
  }

  const page = pagination(req.query);
  const [monsters, total] = await Promise.all([
    Monster.find(filter, PUBLIC_FIELDS).sort({ 'grades.0.level': 1, name: 1 }).skip(page.skip).limit(page.limit).lean(),
    Monster.countDocuments(filter),
  ]);
  res.json(paged(monsters, total, page));
});

router.get('/:id', async (req, res) => {
  const id = parseAnkamaId(req.params.id);
  if (id === null) {
    res.status(400).json({ error: 'id must be a positive integer' });
    return;
  }
  const monster = await Monster.findOne({ ankamaId: id }, PUBLIC_FIELDS).lean();
  if (!monster) {
    res.status(404).json({ error: 'monster not found' });
    return;
  }
  const items = await Item.find(
    { ankamaId: { $in: monster.drops.map((d) => d.itemId) } },
    { _id: 0, ankamaId: 1, name: 1, type: 1, level: 1, image: 1 },
  ).lean();
  const byId = new Map(items.map((i) => [i.ankamaId, i]));
  res.json({ ...monster, drops: monster.drops.map((d) => ({ ...d, item: byId.get(d.itemId) ?? null })) });
});

export default router;
