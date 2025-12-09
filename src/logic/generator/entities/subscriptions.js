import { generateId } from '../../../lib/utils';
import { randomInt, randomItem } from '../helpers';

/**
 * Subscription generation
 */

/**
 * Generate subscriptions for customers
 * @param {Array<Object>} customers - Customer objects
 * @param {Array<Object>} plans - Plan objects
 * @returns {Array<Object>} Array of subscription objects
 */
export const generateSubscriptions = (customers, plans) => {
    const subscriptions = [];

    customers.forEach(customer => {
        if (Math.random() > 0.3) { // 70% have a subscription
            const plan = randomItem(plans);
            const startDate = new Date(customer.createdAt);

            subscriptions.push({
                id: generateId('sub_'),
                externalId: `sub_${randomInt(10000, 99999)}`,
                customerId: customer.id,
                planId: plan.id,
                status: 'active',
                startDate: startDate.toISOString(),
                billingTime: 'calendar',
                createdAt: startDate.toISOString(),
            });
        }
    });

    return subscriptions;
};
