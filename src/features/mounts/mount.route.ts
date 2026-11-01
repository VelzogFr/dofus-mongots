import { Router } from 'express';

import { Mount } from './mount.model.js';
import { PUBLIC_FIELDS, firstString, nameFilter, paged, pagination } from '../../utils/query.js';

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

export default router;
