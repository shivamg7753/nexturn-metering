"use strict";
/**
 * Customers Controller
 * Handles HTTP requests for customer endpoints
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCustomer = exports.getAllCustomers = void 0;
const db_1 = require("../db");
const parser_1 = require("../utils/parser");
/**
 * GET /api/customers
 * Get all customers
 */
const getAllCustomers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const customers = yield db_1.db.customers.find({});
        res.json(customers.map(c => (Object.assign(Object.assign({}, c.toObject()), { billingAddress: (0, parser_1.parseProperties)(c.billingAddress), metadata: (0, parser_1.parseProperties)(c.metadata), subscriptions: [], appliedCoupons: [] }))));
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch customers' });
    }
});
exports.getAllCustomers = getAllCustomers;
/**
 * POST /api/customers
 * Create a new customer
 */
const createCustomer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, name, email, externalId, billingAddress, metadata } = req.body;
        // Use default ID from schema if not provided, but allow override
        const customerData = {
            name,
            email,
            externalId,
            billingAddress: JSON.stringify(billingAddress || {}),
            metadata: JSON.stringify(metadata || {}),
            currency: 'USD',
            customerType: 'individual'
        };
        if (id)
            customerData.id = id;
        const customer = yield db_1.db.customers.create(customerData);
        res.json(customer);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create customer' });
    }
});
exports.createCustomer = createCustomer;
