/**
 * Main Router
 * Aggregates all route modules
 */

import { Router } from 'express';
import usageRoutes from './usage.routes';
import metersRoutes from './meters.routes';
import customersRoutes from './customers.routes';
import productsRoutes from './products.routes';

const router = Router();

// Mount route modules
router.use('/usage', usageRoutes);
router.use('/meters', metersRoutes);
router.use('/customers', customersRoutes);
router.use('/products', productsRoutes);

// NOTE: Other routes (addons, features, schemas, plans, subscriptions, events, analytics)
// are still in the main index.ts file. This demonstrates the pattern for modularization.
// You can extract those following the same pattern.

export default router;

