import { Router } from 'express';

import { Mount } from './mount.model.js';
import { PUBLIC_FIELDS, firstString, nameFilter, paged, pagination, parseAnkamaId } from '../../utils/query.js';

const router = Router();

router.get('/', async (req, res) => {
  const family = firstString(req.query.family);
  const filter: Record<string, unknown> = { ...nameFilter(req.query.q) };
  if (family) filter.family = family;

  const page = pagination(req.query);
  const [mounts, total] = await Promise.all([
    Mount.find(filter, PUBLIC_FIELDS).sort({ name: 1 }).skip(page.skip).limit(page.limit).lean(),
    Mount.countDocuments(filter),
  ]);
  res.json(paged(mounts, total, page));
});

router.get('/:id', async (req, res) => {
  const id = parseAnkamaId(req.params.id);
  if (id === null) {
    res.status(400).json({ error: 'id must be a positive integer' });
    return;
  }
  const mount = await Mount.findOne({ ankamaId: id }, PUBLIC_FIELDS).lean();
  if (!mount) {
    res.status(404).json({ error: 'mount not found' });
    return;
  }
  res.json(mount);
});

export default router;
