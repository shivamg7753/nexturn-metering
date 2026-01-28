import { buildApiUrl } from './config.js';

/**
 * Subscription API Service
 * Handles all subscription-related API calls
 */

/**
 * Fetch all subscriptions with optional customer filter
 * @param {string} customerId - Optional customer ID to filter by
 * @returns {Promise<Array>} Subscriptions array
 */
export const fetchSubscriptions = async (customerId = null) => {
    const url = buildApiUrl(`/subscriptions${customerId ? `?customerId=${customerId}` : ''}`);
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch subscriptions');
    return response.json();
};

/**
 * Fetch a single subscription by ID
 * @param {string} id - Subscription ID
 * @returns {Promise<Object>} Subscription data
 */
export const fetchSubscriptionById = async (id) => {
    const url = buildApiUrl(`/subscriptions/${id}`);
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch subscription');
    return response.json();
};

/**
 * Create a new subscription
 * @param {Object} subscriptionData - Subscription data
 * @returns {Promise<Object>} Created subscription
 */
export const createSubscription = async (subscriptionData) => {
    const url = buildApiUrl('/subscriptions');
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscriptionData),
    });
    if (!response.ok) throw new Error('Failed to create subscription');
    return response.json();
};

/**
 * Update an existing subscription
 * @param {string} id - Subscription ID
 * @param {Object} subscriptionData - Updated subscription data
 * @returns {Promise<Object>} Updated subscription
 */
export const updateSubscription = async (id, subscriptionData) => {
    const url = buildApiUrl(`/subscriptions/${id}`);
    const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscriptionData),
    });
    if (!response.ok) throw new Error('Failed to update subscription');
    return response.json();
};

/**
 * Cancel/delete a subscription
 * @param {string} id - Subscription ID
 * @returns {Promise<void>}
 */
export const cancelSubscription = async (id) => {
    const url = buildApiUrl(`/subscriptions/${id}`);
    const response = await fetch(url, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to cancel subscription');
};
