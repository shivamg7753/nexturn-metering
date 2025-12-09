import { useState, useEffect } from 'react';
import { api } from '../api/client';

/**
 * Custom hook for managing meters and schemas data
 * @returns {Object} { meters, schemas, loadData, loading }
 */
export const useMetersData = () => {
    const [meters, setMeters] = useState([]);
    const [schemas, setSchemas] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            setLoading(true);
            const [metersData, schemasData] = await Promise.all([
                api.getMeters(),
                api.getSchemas(),
            ]);
            setMeters(metersData);
            setSchemas(schemasData);
            return { metersData, schemasData };
        } catch (err) {
            console.error('Failed to load data', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    return {
        meters,
        schemas,
        loading,
        loadData,
    };
};
