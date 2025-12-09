"use strict";
/**
 * Main Router
 * Aggregates all route modules
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const usage_routes_1 = __importDefault(require("./usage.routes"));
const meters_routes_1 = __importDefault(require("./meters.routes"));
const customers_routes_1 = __importDefault(require("./customers.routes"));
const router = (0, express_1.Router)();
// Mount route modules
router.use('/usage', usage_routes_1.default);
router.use('/meters', meters_routes_1.default);
router.use('/customers', customers_routes_1.default);
// NOTE: Other routes (addons, features, schemas, plans, subscriptions, events, analytics)
// are still in the main index.ts file. This demonstrates the pattern for modularization.
// You can extract those following the same pattern.
exports.default = router;
