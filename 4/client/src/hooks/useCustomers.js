import { useState, useEffect, useCallback } from 'react';
import * as customerService from '../services/customer/customerService';

/**
 * useCustomers Hook
 * Manages customer state and provides customer-related operations
 * Delegates business logic to customerService layer
 */
export function useCustomers() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchCustomers = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await customerService.fetchAllCustomers();
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
