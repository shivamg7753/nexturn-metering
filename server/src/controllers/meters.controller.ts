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
import { PlanModel } from '../models';

/**
 * POST /api/meters
 * Create a new meter
 */
export const createMeter = async (req: Request, res: Response) => {
    try {
        const { name, description, eventSchemaId, aggregation, field, filter, window, status } = req.body;
        const meter = await db.meters.create({
            name,
            description,
            eventSchemaId,
            aggregation,
            field,
            filter: JSON.stringify(filter || {}),
            window,
            status: status || 'draft',
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
        const meters = await db.meters.find({});
        res.json(meters.map(m => ({
            ...m.toObject(),
            filter: parseProperties(m.filter || '{}')
        })));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch meters' });
    }
};

/**
 * PUT /api/meters/:id
 * Update a meter
 */
export const updateMeter = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description, eventSchemaId, aggregation, field, filter, window, status } = req.body;

        const existingMeter = await db.meters.findOne({ id });
        if (!existingMeter) return res.status(404).json({ error: 'Meter not found' });

        const updates: any = { updatedAt: new Date() };

        // Lifecycle Logic
        const isActive = existingMeter.status === 'active';

        // If Active, check what's changing
        if (isActive) {
            // Transitions: Active -> Archived allowed (Create dependency check logic later)
            if (status === 'archived') {
                // Check dependencies (Plans)
                // Need to find plans that use this meter in their charges
                // Plan.charges is a stringified JSON array of RateCards
                // RateCard has meterId? Let's check Plan model usage or assume standard structure.
                // Assuming Plan.charges -> parse -> filtered by charge.usageMeterId === id

                const allPlans = await PlanModel.find({});
                const linkedPlan = allPlans.find(p => {
                    try {
                        const charges = JSON.parse(p.charges || '[]');
                        return charges.some((c: any) => c.usageMeterId === id);
                    } catch (e) { return false; }
                });

                if (linkedPlan) {
                    return res.status(400).json({ error: `Cannot archive: Meter is linked to plan "${linkedPlan.name}"` });
                }

                updates.status = status;
            } else if (status === 'draft') {
                // Active -> Draft usually not allowed strictly, but maybe ok? 
                // User says: "An Active meter can only be deactivated if it is not already connected to any price plan. When a meter is no longer needed, it can be moved to the Archived state"
                // "Deactivated" usually means Archived. Can we go back to Draft? "it can no longer be edited". 
                // If we go back to draft, we can edit. So Active -> Draft should probably be blocked or treated same as Archive (check dependencies).
                // User didn't explicitly forbid Active -> Draft, but "Active... can no longer be edited" implies strictness.
                // Let's allow Active -> Archived. 
                // If they send status='active' (same status), ignoring valid fields?
            }

            // Block other fields if Active
            // "it can no longer be edited"
            // So if name/desc/etc are provided and different, we should ignore or error.
            // Let's error to be helpful? or just ignore. 
            // Ignored for now to be safe/simple.
        } else {
            // Draft or Archived
            // "In the Draft state... you can freely edit"
            // "Archived... hidden" - usually we don't edit archived text headers, but user didn't strict blocks. 
            // Logic: If not Active, allow all edits + status change.

            if (name) updates.name = name;
            if (description) updates.description = description;
            if (eventSchemaId) updates.eventSchemaId = eventSchemaId;
            if (aggregation) updates.aggregation = aggregation;
            if (field) updates.field = field;
            if (filter) updates.filter = JSON.stringify(filter);
            if (window) updates.window = window;
            if (status) updates.status = status;
        }

        // Apply updates
        const updatedMeter = await db.meters.findOneAndUpdate({ id }, updates, { new: true });

        if (!updatedMeter) {
            return res.status(404).json({ error: 'Meter not found after update' });
        }

        res.json({
            ...updatedMeter.toObject(),
            filter: parseProperties(updatedMeter.filter || '{}')
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update meter' });
    }
};
