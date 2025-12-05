/**
 * Meters Controller
 * Handles HTTP requests for meter endpoints
 */

import { Request, Response } from 'express';
import { db } from '../db';
import { parseProperties } from '../utils/parser';

/**
 * POST /api/meters
 * Create a new meter
 */
export const createMeter = async (req: Request, res: Response) => {
    try {
        const { name, description, eventSchemaId, aggregation, field, filter, window } = req.body;
        const meter = db.meters.create({
            name,
            description,
            eventSchemaId,
            aggregation,
            field,
            filter: JSON.stringify(filter || {}),
            window,
        });
        res.json(meter);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create meter' });
    }
};

/**
 * GET /api/meters
 * Get all meters
 */
export const getAllMeters = async (req: Request, res: Response) => {
    try {
        const meters = db.meters.getAll();
        res.json(meters.map(m => ({
            ...m,
            filter: parseProperties(m.filter || '{}')
        })));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch meters' });
    }
};
