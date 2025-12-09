/**
 * Usage Controller
 * Handles HTTP requests for usage endpoints
 */

import { Request, Response } from 'express';
import { calculateCustomerUsage } from '../services/usage.service';

/**
 * GET /api/usage/:customerId
 * Get usage data for a customer
 */
export const getCustomerUsage = async (req: Request, res: Response) => {
    try {
        const { customerId } = req.params;
        const { from, to } = req.query;

        const startDate = from ? new Date(from as string) : new Date(0);
        const endDate = to ? new Date(to as string) : new Date();

        const usage = await calculateCustomerUsage(customerId, startDate, endDate);

        res.json({ customerId, usage });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to calculate usage' });
    }
};
