import { useState, useEffect } from 'react';
import { api } from '../api/client';

/**
 * Custom hook for managing features data and schemas
 * @returns {Object} { schemas, loadData, loading }
 */
export const useFeatures = () => {
    const [schemas, setSchemas] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            setLoading(true);
            const fetchedSchemas = await api.getSchemas();
            setSchemas(fetchedSchemas);

            await api.getFeatures();
        } catch (err) {
            console.error('Failed to load data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    return {
        schemas,
        loading,
        loadData,
    };
};
