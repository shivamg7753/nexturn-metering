"use strict";
/**
 * Customers Routes
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customers_controller_1 = require("../controllers/customers.controller");
const router = (0, express_1.Router)();
router.get('/', customers_controller_1.getAllCustomers);
router.post('/', customers_controller_1.createCustomer);
exports.default = router;
