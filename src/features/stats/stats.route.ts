import { Router } from 'express';

import { Item } from '../items/item.model.js';
import { EquipmentSet } from '../sets/set.model.js';
import { Monster } from '../monsters/monster.model.js';
import { Mount } from '../mounts/mount.model.js';

const router = Router();

router.get('/', async (_req, res) => {
  const [equipment, resources, sets, monsters, mounts] = await Promise.all([
    Item.countDocuments({ category: 'equipment' }),
    Item.countDocuments({ category: 'resource' }),
    EquipmentSet.estimatedDocumentCount(),
    Monster.estimatedDocumentCount(),
    Mount.estimatedDocumentCount(),
  ]);
  res.json({ equipment, resources, sets, monsters, mounts });
});

export default router;
