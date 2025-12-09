import { generateId } from '../../../lib/utils';
import { randomInt, randomItem, generateAddress } from '../helpers';
import { COMPANY_NAMES, STREET_NAMES, CITIES, COUNTRIES } from '../constants';

/**
 * Customer generation
 */

/**
 * Generate mock customers
 * @param {number} count - Number of customers to generate
 * @returns {Array<Object>} Array of customer objects
 */
export const generateCustomers = (count) => {
    return Array.from({ length: count }).map((_, i) => ({
        id: generateId('cus_'),
        externalId: `ext_${randomInt(1000, 9999)}`,
        name: randomItem(COMPANY_NAMES),
        email: `billing@${generateId()}.com`,
        customerType: randomItem(['company', 'individual']),
        currency: 'USD',
        billingAddress: generateAddress({
            streetNames: STREET_NAMES,
            cities: CITIES,
            countries: COUNTRIES
        }),
        metadata: {},
        subscriptions: [],
        appliedCoupons: [],
        createdAt: new Date(2024, randomInt(1, 12)).toISOString(),
    }));
};
