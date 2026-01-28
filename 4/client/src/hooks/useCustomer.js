import { useState, useEffect } from 'react';
import { fetchCustomerById } from '../api/customerApi';

/**
 * Custom hook for fetching and managing customer data
 * @param {string} customerId - The customer ID to fetch
 * @returns {object} Customer data and loading state
 */
export function useCustomer(customerId) {
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        if (!customerId) return;

        try {
            setLoading(true);
            setError(null);
            const data = await fetchCustomerById(customerId);
            setCustomer(data);
        } catch (err) {
            console.error('Failed to fetch customer data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const refreshCustomer = async () => {
        try {
            const data = await fetchCustomerById(customerId);
            setCustomer(data);
        } catch (err) {
            console.error('Failed to refresh customer:', err);
            setError(err.message);
        }
    };

    useEffect(() => {
        fetchData();
    }, [customerId]);

    return {
        customer,
        loading,
        error,
        refreshCustomer
    };
}
