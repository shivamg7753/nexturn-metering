/**
 * Usage Routes
 */

import { Router } from 'express';
import { getCustomerUsage } from '../controllers/usage.controller';

const router = Router();

router.get('/:customerId', getCustomerUsage);

export default router;
