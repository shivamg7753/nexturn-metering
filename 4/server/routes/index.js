import express from 'express';
import productRoutes from './productRoutes.js';
import customerRoutes from './customerRoutes.js';
import subscriptionRoutes from './subscriptionRoutes.js';
import meterRoutes from './meterRoutes.js';

const router = express.Router();

/**
 * Main Routes Index
 * Aggregates all route modules
 */

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount route modules
router.use('/products', productRoutes);
router.use('/customers', customerRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/meters', meterRoutes);

export default router;
