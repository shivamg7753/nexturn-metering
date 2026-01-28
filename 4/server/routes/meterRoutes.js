import express from 'express';
import {
    getAllMeters,
    getMeterById,
    createMeter,
    updateMeter,
    deleteMeter,
    clearAllMeters
} from '../controllers/meterController.js';

const router = express.Router();

/**
 * Meter Routes
 */

// Clear all meters (development only)
router.delete('/all/clear', clearAllMeters);

// CRUD operations
router.get('/', getAllMeters);
router.get('/:id', getMeterById);
router.post('/', createMeter);
router.put('/:id', updateMeter);
router.delete('/:id', deleteMeter);

export default router;
