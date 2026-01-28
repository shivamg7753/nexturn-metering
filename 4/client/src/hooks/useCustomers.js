import { useState, useEffect, useCallback } from 'react';
import { fetchCustomers as fetchCustomersApi } from '../api/customerApi.js';

/**
 * useCustomers Hook
 * Manages customer state and provides customer-related operations
 */
export function useCustomers() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchCustomers = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchCustomersApi();
            setCustomers(data);
        } catch (err) {
            console.error('Error fetching customers:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    return {
        customers,
        loading,
        error,
        fetchCustomers
    };
}

export default useCustomers;
