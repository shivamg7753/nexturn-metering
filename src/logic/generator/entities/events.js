import { generateId } from '../../../lib/utils';
import { subMonths } from 'date-fns';
import { randomInt, randomItem, randomDate } from '../helpers';
import { HTTP_METHODS } from '../constants';

/**
 * Events generation
 */

/**
 * Generate historical events for customers
 * @param {Array<Object>} customers - Customer objects
 * @param {Array<Object>} metrics - Billable metrics
 * @returns {Array<Object>} Array of event objects sorted by timestamp
 */
export const generateHistoricalEvents = (customers, metrics) => {
    const events = [];
    const now = new Date();
    const threeMonthsAgo = subMonths(now, 3);

    customers.forEach(customer => {
        // Generate 50-100 events per customer
        const eventCount = randomInt(50, 100);
        for (let i = 0; i < eventCount; i++) {
            const metric = randomItem(metrics);
            const date = randomDate(threeMonthsAgo, now);

            let properties = {};
            if (metric.code === 'api_calls') {
                properties = {
                    method: randomItem(HTTP_METHODS),
                    path: '/v1/users'
                };
            } else if (metric.code === 'storage_gb') {
                properties = { storage_gb: randomInt(1, 100) };
            } else if (metric.code === 'compute_hours') {
                properties = { duration_hours: Math.random() * 10 };
            } else if (metric.code === 'active_users') {
                properties = { user_id: `user_${randomInt(1, 20)}` };
            } else if (metric.code === 'bandwidth_gb') {
                properties = { bytes: randomInt(1000, 1000000) };
            }

            events.push({
                transactionId: generateId('evt_'),
                externalSubscriptionId: `sub_${customer.externalId}`,
                code: metric.code,
                timestamp: date.getTime(),
                properties,
                customerId: customer.id,
                matchedMetric: metric,
            });
        }
    });

    return events.sort((a, b) => b.timestamp - a.timestamp);
};

// Alias for backward compatibility
export const generateEvents = generateHistoricalEvents;
