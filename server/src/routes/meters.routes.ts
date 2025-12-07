/**
 * Meters Routes
 */

import { Router } from 'express';
import { createMeter, getAllMeters, updateMeter } from '../controllers/meters.controller';

const router = Router();

router.post('/', createMeter);
router.get('/', getAllMeters);
router.put('/:id', updateMeter);

export default router;
