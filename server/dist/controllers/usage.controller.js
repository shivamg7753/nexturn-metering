"use strict";
/**
 * Usage Controller
 * Handles HTTP requests for usage endpoints
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
exports.getCustomerUsage = void 0;
const usage_service_1 = require("../services/usage.service");
/**
 * GET /api/usage/:customerId
 * Get usage data for a customer
 */
const getCustomerUsage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { customerId } = req.params;
        const { from, to } = req.query;
        const startDate = from ? new Date(from) : new Date(0);
        const endDate = to ? new Date(to) : new Date();
        const usage = yield (0, usage_service_1.calculateCustomerUsage)(customerId, startDate, endDate);
        res.json({ customerId, usage });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to calculate usage' });
    }
});
exports.getCustomerUsage = getCustomerUsage;
