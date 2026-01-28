import Customer from '../models/Customer.js';

/**
 * Customer Controller
 * Handles all customer-related business logic
 */

/**
 * Get all customers
 */
export const getAllCustomers = async (req, res) => {
    try {
        const customers = await Customer.find().sort({ createdAt: -1 });
        const formattedCustomers = customers.map(c => ({
            id: c._id,
            name: c.name,
            email: c.email,
            language: c.language,
            paymentMethod: c.paymentMethod,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt
        }));
        res.json(formattedCustomers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * Get single customer by ID
 */
export const getCustomerById = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) return res.status(404).json({ error: 'Customer not found' });

        res.json({
            id: customer._id,
            customerId: customer.customerId,
            name: customer.name,
            email: customer.email,
            language: customer.language,
            paymentMethod: customer.paymentMethod,
            businessName: customer.businessName,
            individualName: customer.individualName,
            billingDetails: customer.billingDetails,
            nextInvoiceNumber: customer.nextInvoiceNumber,
            taxLocationStatus: customer.taxLocationStatus,
            taxStatus: customer.taxStatus,
            createdAt: customer.createdAt,
            updatedAt: customer.updatedAt
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * Create a new customer
 */
export const createCustomer = async (req, res) => {
    try {
        const customerData = {
            name: req.body.name,
            email: req.body.email,
            language: req.body.language || 'English (United States)',
            paymentMethod: req.body.paymentMethod || null
        };

        const customer = new Customer(customerData);
        await customer.save();

        res.status(201).json({
            id: customer._id,
            name: customer.name,
            email: customer.email,
            language: customer.language,
            paymentMethod: customer.paymentMethod,
            createdAt: customer.createdAt,
            updatedAt: customer.updatedAt
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * Update an existing customer
 */
export const updateCustomer = async (req, res) => {
    try {
        const updateData = {
            name: req.body.name,
            email: req.body.email,
            language: req.body.language,
            paymentMethod: req.body.paymentMethod
        };

        // Remove undefined fields
        Object.keys(updateData).forEach(key => {
            if (updateData[key] === undefined) {
                delete updateData[key];
            }
        });

        const customer = await Customer.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!customer) return res.status(404).json({ error: 'Customer not found' });

        res.json({
            id: customer._id,
            name: customer.name,
            email: customer.email,
            language: customer.language,
            paymentMethod: customer.paymentMethod,
            createdAt: customer.createdAt,
            updatedAt: customer.updatedAt
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * Delete a customer
 */
export const deleteCustomer = async (req, res) => {
    try {
        const customer = await Customer.findByIdAndDelete(req.params.id);
        if (!customer) return res.status(404).json({ error: 'Customer not found' });
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
