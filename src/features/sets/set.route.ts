import { Router } from 'express';

import { EquipmentSet } from './set.model.js';
import { Item } from '../items/item.model.js';
import { PUBLIC_FIELDS, nameFilter, paged, pagination, parseAnkamaId } from '../../utils/query.js';

const router = Router();

router.get('/', async (req, res) => {
  const filter = nameFilter(req.query.q);
  const page = pagination(req.query);
  const [sets, total] = await Promise.all([
    EquipmentSet.find(filter, PUBLIC_FIELDS).sort({ level: 1, name: 1 }).skip(page.skip).limit(page.limit).lean(),
    EquipmentSet.countDocuments(filter),
  ]);
  res.json(paged(sets, total, page));
});

router.get('/:id', async (req, res) => {
  const id = parseAnkamaId(req.params.id);
  if (id === null) {
    res.status(400).json({ error: 'id must be a positive integer' });
    return;
  }
  const set = await EquipmentSet.findOne({ ankamaId: id }, PUBLIC_FIELDS).lean();
  if (!set) {
    res.status(404).json({ error: 'set not found' });
    return;
  }
  const items = await Item.find({ ankamaId: { $in: set.itemIds } }, PUBLIC_FIELDS).lean();
  const byId = new Map(items.map((i) => [i.ankamaId, i]));
  res.json({ ...set, items: set.itemIds.map((itemId) => byId.get(itemId)).filter(Boolean) });
});

export default router;
