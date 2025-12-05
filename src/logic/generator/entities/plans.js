import { generateId } from '../../../lib/utils';

/**
 * Plans generation
 */

/**
 * Generate subscription plans with different tiers
 * @param {Array<Object>} metrics - Billable metrics to attach to plans
 * @returns {Array<Object>} Array of plan objects
 */
export const generatePlans = (metrics) => {
    const plans = [
        {
            id: 'plan_free',
            name: 'Free Tier',
            code: 'free',
            description: 'For hobbyists and side projects',
            interval: 'monthly',
            amountCents: 0,
            currency: 'USD',
            payInAdvance: true,
            trialPeriod: 0,
            charges: [],
            createdAt: new Date().toISOString(),
        },
        {
            id: 'plan_starter',
            name: 'Starter',
            code: 'starter',
            description: 'Essential features for small teams',
            interval: 'monthly',
            amountCents: 2900,
            currency: 'USD',
            payInAdvance: true,
            trialPeriod: 14,
            charges: [
                {
                    id: generateId('ch_'),
                    billableMetricId: 'bm_api_calls',
                    chargeModel: 'standard',
                    properties: { amountCents: 1 },
                    payInAdvance: false,
                    prorated: false,
                    invoiceable: true,
                }
            ],
            createdAt: new Date().toISOString(),
        },
        {
            id: 'plan_pro',
            name: 'Professional',
            code: 'pro',
            description: 'Advanced features for scaling businesses',
            interval: 'monthly',
            amountCents: 9900,
            currency: 'USD',
            payInAdvance: true,
            trialPeriod: 14,
            charges: [
                {
                    id: generateId('ch_'),
                    billableMetricId: 'bm_users',
                    chargeModel: 'graduated',
                    properties: {
                        graduatedRanges: [
                            { to: 10, perUnitAmountCents: 0, flatAmountCents: 0 },
                            { to: 50, perUnitAmountCents: 500, flatAmountCents: 0 },
                            { to: null, perUnitAmountCents: 300, flatAmountCents: 0 },
                        ]
                    },
                    payInAdvance: true,
                    prorated: true,
                    invoiceable: true,
                }
            ],
            createdAt: new Date().toISOString(),
        }
    ];
    return plans;
};
