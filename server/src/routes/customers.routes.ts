/**
 * Customers Routes
 */

import { Router } from 'express';
import { getAllCustomers, createCustomer } from '../controllers/customers.controller';

const router = Router();

router.get('/', getAllCustomers);
router.post('/', createCustomer);

export default router;
