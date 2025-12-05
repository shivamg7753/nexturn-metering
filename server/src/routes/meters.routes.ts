/**
 * Meters Routes
 */

import { Router } from 'express';
import { createMeter, getAllMeters } from '../controllers/meters.controller';

const router = Router();

router.post('/', createMeter);
router.get('/', getAllMeters);

export default router;
