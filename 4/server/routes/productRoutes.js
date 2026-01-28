import express from 'express';
import {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductLogs,
    getProductEvents,
    clearAllProducts,
    addPrice,
    updatePrice,
    deletePrice
} from '../controllers/productController.js';

const router = express.Router();

/**
 * Product Routes
 */

// Clear all products (development only)
router.delete('/all/clear', clearAllProducts);

// CRUD operations
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

// Price management
router.post('/:id/prices', addPrice);
router.put('/:id/prices/:priceIndex', updatePrice);
router.delete('/:id/prices/:priceIndex', deletePrice);

// Logs and Events
router.get('/:id/logs', getProductLogs);
router.get('/:id/events', getProductEvents);

export default router;
