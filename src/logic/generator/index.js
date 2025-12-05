/**
 * Main entry point for data generation
 * Orchestrates all generator modules
 */

import { generateBillableMetrics } from './entities/metrics';
import { generatePlans } from './entities/plans';
import { generateCustomers } from './entities/customers';
import { generateSubscriptions } from './entities/subscriptions';
import { generateHistoricalEvents, generateEvents } from './entities/events';
import { generateHistoricalInvoices } from './entities/invoices';
import { generateAddress } from './helpers';

/**
 * Generate complete seed data for the application
 * @returns {Object} Object containing all generated data
 */
export const generateSeedData = () => {
    const metrics = generateBillableMetrics();
    const plans = generatePlans(metrics);
    const customers = generateCustomers(20);
    const subscriptions = generateSubscriptions(customers, plans);

    return {
        metrics,
        plans,
        customers,
        subscriptions,
        events: generateHistoricalEvents(customers, metrics),
        invoices: generateHistoricalInvoices(subscriptions, plans),
    };
};

// Export individual generators for flexibility
export {
    generateBillableMetrics,
    generatePlans,
    generateCustomers,
    generateSubscriptions,
    generateHistoricalEvents,
    generateHistoricalInvoices,
    generateEvents,
    generateAddress,
};
