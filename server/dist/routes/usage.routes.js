"use strict";
/**
 * Usage Routes
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const usage_controller_1 = require("../controllers/usage.controller");
const router = (0, express_1.Router)();
router.get('/:customerId', usage_controller_1.getCustomerUsage);
exports.default = router;
