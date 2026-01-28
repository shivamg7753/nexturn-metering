import { useState, useEffect, useCallback } from 'react';
import {
    fetchMeters as fetchMetersApi,
    fetchMeterById,
    createMeter as createMeterApi,
    updateMeter as updateMeterApi,
    deleteMeter as deleteMeterApi
} from '../api/meterApi.js';

/**
 * useMeters Hook
 * Manages meter state and provides meter-related operations
 */
export function useMeters() {
    const [meters, setMeters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchMeters = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchMetersApi();
            setMeters(data.meters || []);
        } catch (err) {
            console.error('Error fetching meters:', err);
            setError(err.message);
            setMeters([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const getMeter = useCallback(async (id) => {
        try {
            return await fetchMeterById(id);
        } catch (err) {
            console.error('Error getting meter:', err);
            return null;
        }
    }, []);

    const createMeter = useCallback(async (meterData) => {
        try {
            const newMeter = await createMeterApi(meterData);
            await fetchMeters();
            return { success: true, meter: newMeter };
        } catch (err) {
            console.error('Error creating meter:', err);
            return { success: false, error: err.message };
        }
    }, [fetchMeters]);

    const updateMeter = useCallback(async (id, meterData) => {
        try {
            const updatedMeter = await updateMeterApi(id, meterData);
            await fetchMeters();
            return { success: true, meter: updatedMeter };
        } catch (err) {
            console.error('Error updating meter:', err);
            return { success: false, error: err.message };
        }
    }, [fetchMeters]);

    const deleteMeter = useCallback(async (id) => {
        try {
            await deleteMeterApi(id);
            await fetchMeters();
            return { success: true };
        } catch (err) {
            console.error('Error deleting meter:', err);
            return { success: false, error: err.message };
        }
    }, [fetchMeters]);

    const toggleMeterStatus = useCallback(async (id, currentStatus) => {
        const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
        return updateMeter(id, { status: newStatus });
    }, [updateMeter]);

    useEffect(() => {
        fetchMeters();
    }, [fetchMeters]);

    return {
        meters,
        loading,
        error,
        fetchMeters,
        getMeter,
        createMeter,
        updateMeter,
        deleteMeter,
        toggleMeterStatus
    };
}

export default useMeters;
