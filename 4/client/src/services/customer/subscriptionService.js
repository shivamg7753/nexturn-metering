/**
 * Subscription Service
 * Business logic for subscription lifecycle management
 */

import * as subscriptionApi from '../../api/subscriptionApi';

/**
 * Validates subscription data
 * @param {Object} subscriptionData - Subscription data to validate
 * @returns {Object} - { isValid: boolean, errors: {} }
 */
export function validateSubscription(subscriptionData) {
    const errors = {};

    if (!subscriptionData.customerId) {
        errors.customerId = 'Customer is required';
    }

    if (!subscriptionData.products || subscriptionData.products.length === 0) {
        errors.products = 'At least one product is required';
    }

    if (!subscriptionData.startDate) {
        errors.startDate = 'Start date is required';
    }

    if (!subscriptionData.isForever && !subscriptionData.endDate) {
        errors.endDate = 'End date is required for non-perpetual subscriptions';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

/**
 * Calculates subscription status based on dates
 * @param {Object} subscription - Subscription object
 * @returns {string} - Status (active, pending, expired, cancelled)
 */
export function calculateSubscriptionStatus(subscription) {
    const now = new Date();
    const startDate = new Date(subscription.startDate);
    const endDate = subscription.endDate ? new Date(subscription.endDate) : null;

    if (subscription.status === 'cancelled') {
        return 'cancelled';
    }

    if (startDate > now) {
        return 'pending';
    }

    if (endDate && endDate < now) {
        return 'expired';
    }

    return 'active';
}

/**
 * Transforms subscription data from API format to UI format
 * @param {Object} apiSubscription - Subscription from API
 * @returns {Object} - Transformed subscription for UI
 */
export function transformSubscriptionFromApi(apiSubscription) {
    return {
        ...apiSubscription,
        id: apiSubscription._id || apiSubscription.id,
        status: apiSubscription.status || calculateSubscriptionStatus(apiSubscription),
        startDate: apiSubscription.startDate ? new Date(apiSubscription.startDate) : null,
        endDate: apiSubscription.endDate ? new Date(apiSubscription.endDate) : null,
        createdAt: apiSubscription.createdAt ? new Date(apiSubscription.createdAt) : null,
        updatedAt: apiSubscription.updatedAt ? new Date(apiSubscription.updatedAt) : null,
    };
}

/**
 * Transforms subscription data from UI format to API format
 * @param {Object} uiSubscription - Subscription from UI
 * @returns {Object} - Transformed subscription for API
 */
export function transformSubscriptionToApi(uiSubscription) {
    const apiSubscription = {
        customerId: uiSubscription.customerId,
        products: uiSubscription.products,
        startDate: uiSubscription.startDate,
        endDate: uiSubscription.isForever ? null : uiSubscription.endDate,
        billingStartDate: uiSubscription.billingStartDate,
        trialDays: uiSubscription.trialDays || 0,
        collectTaxAutomatically: uiSubscription.collectTaxAutomatically || false,
        metadata: uiSubscription.metadata,
    };

    // Remove undefined fields
    Object.keys(apiSubscription).forEach(key => {
        if (apiSubscription[key] === undefined) {
            delete apiSubscription[key];
        }
    });

    return apiSubscription;
}

/**
 * Fetches all subscriptions for a customer
 * @param {string} customerId - Customer ID
 * @returns {Promise<Array>} - Array of subscriptions
 */
export async function fetchSubscriptionsByCustomer(customerId) {
    try {
        const subscriptions = await subscriptionApi.fetchSubscriptionsByCustomer(customerId);
        return subscriptions.map(transformSubscriptionFromApi);
    } catch (error) {
        console.error(`Error fetching subscriptions for customer ${customerId}:`, error);
        throw new Error('Failed to fetch subscriptions. Please try again.');
    }
}

/**
 * Fetches a single subscription by ID
 * @param {string} subscriptionId - Subscription ID
 * @returns {Promise<Object>} - Subscription data
 */
export async function fetchSubscriptionById(subscriptionId) {
    try {
        const subscription = await subscriptionApi.fetchSubscriptionById(subscriptionId);
        return transformSubscriptionFromApi(subscription);
    } catch (error) {
        console.error(`Error fetching subscription ${subscriptionId}:`, error);
        throw new Error('Failed to fetch subscription details. Please try again.');
    }
}

/**
 * Creates a new subscription
 * @param {Object} subscriptionData - Subscription data
 * @returns {Promise<Object>} - Created subscription
 */
export async function createSubscription(subscriptionData) {
    // Validate
    const validation = validateSubscription(subscriptionData);
    if (!validation.isValid) {
        throw new Error(Object.values(validation.errors).join(', '));
    }

    try {
        const apiData = transformSubscriptionToApi(subscriptionData);
        const createdSubscription = await subscriptionApi.createSubscription(apiData);
        return transformSubscriptionFromApi(createdSubscription);
    } catch (error) {
        console.error('Error creating subscription:', error);
        throw new Error('Failed to create subscription. Please try again.');
    }
}

/**
 * Updates an existing subscription
 * @param {string} subscriptionId - Subscription ID
 * @param {Object} subscriptionData - Updated subscription data
 * @returns {Promise<Object>} - Updated subscription
 */
export async function updateSubscription(subscriptionId, subscriptionData) {
    try {
        const apiData = transformSubscriptionToApi(subscriptionData);
        const updatedSubscription = await subscriptionApi.updateSubscription(subscriptionId, apiData);
        return transformSubscriptionFromApi(updatedSubscription);
    } catch (error) {
        console.error(`Error updating subscription ${subscriptionId}:`, error);
        throw new Error('Failed to update subscription. Please try again.');
    }
}

/**
 * Cancels a subscription
 * @param {string} subscriptionId - Subscription ID
 * @returns {Promise<Object>} - Cancelled subscription
 */
export async function cancelSubscription(subscriptionId) {
    try {
        const cancelledSubscription = await subscriptionApi.cancelSubscription(subscriptionId);
        return transformSubscriptionFromApi(cancelledSubscription);
    } catch (error) {
        console.error(`Error cancelling subscription ${subscriptionId}:`, error);
        throw new Error('Failed to cancel subscription. Please try again.');
    }
}
