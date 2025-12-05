/**
 * Usage Service
 * Handles usage calculation business logic
 */

import { db } from '../db';
import { parseProperties, parseArray } from '../utils/parser';
import { normalizeFilters, evaluateFilters } from '../utils/filter';
import { aggregateEvents } from './aggregation.service';
import { calculateCost } from './pricing.service';

export interface UsageWindow {
    from: Date;
    to: Date;
}

export interface UsageResult {
    meterId: string;
    meterName: string;
    meterCode?: string;
    value: number;
    costCents: number;
    currency: string;
    window: UsageWindow;
}

/**
 * Calculate usage for a customer
 */
export const calculateCustomerUsage = async (
    customerId: string,
    startDate: Date,
    endDate: Date
): Promise<UsageResult[]> => {
    // 1. Get Customer's Active Subscriptions
    const subscriptions = db.subscriptions.filter(s =>
        s.customerId === customerId && s.status === 'active'
    );

    // 2. Get Plans for these subscriptions
    const planIds = subscriptions.map(s => s.planId);
    const plans = db.plans.filter(p => planIds.includes(p.id));

    // 3. Extract relevant Meter IDs from Plan Charges
    const relevantMeterIds = new Set<string>();
    for (const plan of plans) {
        const charges = parseArray(plan.charges);
        for (const charge of charges) {
            if (charge.billableMetricId) {
                relevantMeterIds.add(charge.billableMetricId);
            }
        }
    }

    // 4. Fetch only relevant meters
    let meters: any[] = [];
    if (relevantMeterIds.size > 0) {
        meters = db.meters.filter(m => relevantMeterIds.has(m.id));
    }

    const usage: UsageResult[] = [];

    for (const meter of meters) {
        // Fetch events for this meter's schema and customer within range
        const events = db.events.filter(e =>
            e.eventSchemaId === meter.eventSchemaId &&
            e.customerId === customerId &&
            new Date(e.timestamp) >= startDate &&
            new Date(e.timestamp) <= endDate
        );

        // Parse properties
        const parsedEvents = events.map(e => ({
            ...e,
            properties: parseProperties(e.properties),
        }));

        // Apply Filter
        const rawFilter = parseProperties(meter.filter);
        const filters = normalizeFilters(rawFilter);
        const filteredEvents = parsedEvents.filter(e => evaluateFilters(e.properties, filters));

        // Aggregate
        const value = aggregateEvents(filteredEvents, {
            aggregation: meter.aggregation,
            field: meter.field || undefined,
        });

        // Calculate Cost
        let costCents = 0;
        let currency = 'USD';

        // Find the charge for this meter in the active plans
        for (const plan of plans) {
            const charges = parseArray(plan.charges);
            const charge = charges.find((c: any) => c.billableMetricId === meter.id);

            if (charge) {
                currency = plan.currency;
                costCents = calculateCost(value, charge);
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
};
