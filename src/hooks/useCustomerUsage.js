import { useState, useEffect } from 'react';
import { api } from '../api/client';

/**
 * Custom hook for fetching customer usage data
 * @param {string} customerId - Customer ID
 * @param {number} refreshInterval - Auto-refresh interval in ms (default: 30000)
 * @returns {Object} { usage, loading, refresh }
 */
export const useCustomerUsage = (customerId, refreshInterval = 30000) => {
    const [usage, setUsage] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUsage = async () => {
        if (!customerId) return;

        try {
            setLoading(true);
            const usageData = await api.getUsage(customerId);
            setUsage(usageData);
        } catch (error) {
            console.error('Failed to fetch usage:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsage();

        // Auto-refresh
        if (refreshInterval > 0) {
            const interval = setInterval(fetchUsage, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [customerId, refreshInterval]);

    return {
        usage,
        loading,
        refresh: fetchUsage,
    };
};
