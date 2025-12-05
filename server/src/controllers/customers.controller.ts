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
        const customers = db.customers.getAll();
        res.json(customers.map(c => ({
            ...c,
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
        const { id, name, email, externalId, billingAddress, metadata } = req.body;
        const customer = db.customers.create({
            id,
            name,
            email,
            externalId,
            billingAddress: JSON.stringify(billingAddress || {}),
            metadata: JSON.stringify(metadata || {}),
            currency: 'USD',
            customerType: 'individual'
        });
        res.json(customer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create customer' });
    }
};
