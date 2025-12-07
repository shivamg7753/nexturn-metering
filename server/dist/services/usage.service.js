"use strict";
/**
 * Usage Service
 * Handles usage calculation business logic
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
exports.calculateCustomerUsage = void 0;
const db_1 = require("../db");
const parser_1 = require("../utils/parser");
const filter_1 = require("../utils/filter");
const aggregation_service_1 = require("./aggregation.service");
const pricing_service_1 = require("./pricing.service");
/**
 * Calculate usage for a customer
 */
const calculateCustomerUsage = (customerId, startDate, endDate) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Get Customer's Active Subscriptions
    const subscriptions = yield db_1.db.subscriptions.find({
        customerId,
        status: 'active'
    });
    // 2. Get Plans for these subscriptions
    const planIds = subscriptions.map(s => s.planId);
    // Use $in operator to find plans with IDs in the list
    const plans = yield db_1.db.plans.find({ id: { $in: planIds } });
    // 3. Extract relevant Meter IDs from Plan Charges
    const relevantMeterIds = new Set();
    for (const plan of plans) {
        const charges = (0, parser_1.parseArray)(plan.charges);
        for (const charge of charges) {
            if (charge.billableMetricId) {
                relevantMeterIds.add(charge.billableMetricId);
            }
        }
    }
    // 4. Fetch only relevant meters
    let meters = [];
    if (relevantMeterIds.size > 0) {
        meters = yield db_1.db.meters.find({ id: { $in: Array.from(relevantMeterIds) } });
    }
    const usage = [];
    for (const meter of meters) {
        // Fetch events for this meter's schema and customer within range
        const events = yield db_1.db.events.find({
            eventSchemaId: meter.eventSchemaId,
            customerId,
            timestamp: {
                $gte: startDate,
                $lte: endDate
            }
        });
        // Parse properties
        const parsedEvents = events.map(e => (Object.assign(Object.assign({}, e.toObject()), { properties: (0, parser_1.parseProperties)(e.properties) })));
        // Apply Filter
        const rawFilter = (0, parser_1.parseProperties)(meter.filter);
        const filters = (0, filter_1.normalizeFilters)(rawFilter);
        const filteredEvents = parsedEvents.filter(e => (0, filter_1.evaluateFilters)(e.properties, filters));
        // Aggregate
        const value = (0, aggregation_service_1.aggregateEvents)(filteredEvents, {
            aggregation: meter.aggregation,
            field: meter.field || undefined,
        });
        // Calculate Cost
        let costCents = 0;
        let currency = 'USD';
        // Find the charge for this meter in the active plans
        for (const plan of plans) {
            const charges = (0, parser_1.parseArray)(plan.charges);
            const charge = charges.find((c) => c.billableMetricId === meter.id);
            if (charge) {
                currency = plan.currency;
                costCents = (0, pricing_service_1.calculateCost)(value, charge);
                break; // Assume one active charge per meter for now
            }
        }
        usage.push({
            meterId: meter.id,
            meterName: meter.name,
            meterCode: meter.code,
            value,
            costCents,
            currency,
            window: { from: startDate, to: endDate },
        });
    }
    return usage;
});
exports.calculateCustomerUsage = calculateCustomerUsage;
