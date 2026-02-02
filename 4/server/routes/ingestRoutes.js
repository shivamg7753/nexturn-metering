import express from 'express';
import { ingestEvent, getIngestSummary, getRawEvents } from '../controllers/ingestController.js';

const router = express.Router();

/**
 * Ingest Routes
 */

router.post('/', ingestEvent);
router.get('/summary', getIngestSummary);
router.get('/raw', getRawEvents);

export default router;
