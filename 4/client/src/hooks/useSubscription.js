import { useState, useEffect } from 'react';
import { fetchSubscriptionById } from '../api/subscriptionApi';

/**
 * Custom hook for fetching and managing subscription data
 * @param {string} subscriptionId - The subscription ID to fetch
 * @returns {object} Subscription data and loading state
 */
export function useSubscription(subscriptionId) {
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        if (!subscriptionId) return;

        try {
            setLoading(true);
            setError(null);
            const data = await fetchSubscriptionById(subscriptionId);
            setSubscription(data);
        } catch (err) {
            console.error('Failed to fetch subscription data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const refreshSubscription = async () => {
        try {
            const data = await fetchSubscriptionById(subscriptionId);
            setSubscription(data);
        } catch (err) {
            console.error('Failed to refresh subscription:', err);
            setError(err.message);
        }
    };

    useEffect(() => {
        fetchData();
    }, [subscriptionId]);

    return {
        subscription,
        loading,
        error,
        refreshSubscription
    };
}
