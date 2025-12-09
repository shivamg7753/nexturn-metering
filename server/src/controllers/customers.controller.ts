/**
 * Customers Controller
 * Handles HTTP requests for customer endpoints
 */

import { Request, Response } from 'express';
import { db } from '../db';
import { parseProperties } from '../utils/parser';

/**
 * GET /api/customers
 * Get all customers
 */
export const getAllCustomers = async (req: Request, res: Response) => {
    try {
        const customers = await db.customers.find({});
        res.json(customers.map(c => ({
            ...c.toObject(),
            billingAddress: parseProperties(c.billingAddress),
            metadata: parseProperties(c.metadata),
            subscriptions: [],
            appliedCoupons: []
        })));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch customers' });
    }
};

/**
 * POST /api/customers
 * Create a new customer
 */
export const createCustomer = async (req: Request, res: Response) => {
    try {
        const { id, name, email, externalId, billingAddress, currency, customerId, accountId, aliases, metadata } = req.body;

        // Merge extra UI fields into metadata
        const meta = {
            ...(metadata || {}),
            accountId,
            aliases,
            // If the UI sends 'customerId' but backend expects 'externalId', 
            // we can fallback or explicitly map. The UI sends 'customerId' as the user-facing ID.
            // We'll map UI 'customerId' to backend 'externalId' if 'externalId' is missing.
        };

        const customerData: any = {
            name,
            email,
            externalId: externalId || customerId, // Map UI customerId to externalId
            billingAddress: JSON.stringify(billingAddress || {}),
            metadata: JSON.stringify(meta),
            currency: currency || 'USD',
            customerType: 'individual'
        };
        if (id) customerData.id = id;

        const customer = await db.customers.create(customerData);
        res.json(customer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create customer' });
    }
};
