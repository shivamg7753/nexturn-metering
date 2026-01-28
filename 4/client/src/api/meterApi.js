import { buildApiUrl } from './config.js';

/**
 * Meter API Service
 * Handles all meter-related API calls
 */

/**
 * Fetch all meters
 * @returns {Promise<Object>} Meters data
 */
export const fetchMeters = async () => {
    const url = buildApiUrl('/meters');
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch meters');
    return response.json();
};

/**
 * Fetch a single meter by ID
 * @param {string} id - Meter ID
 * @returns {Promise<Object>} Meter data
 */
export const fetchMeterById = async (id) => {
    const url = buildApiUrl(`/meters/${id}`);
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch meter');
    return response.json();
};

/**
 * Create a new meter
 * @param {Object} meterData - Meter data
 * @returns {Promise<Object>} Created meter
 */
export const createMeter = async (meterData) => {
    const url = buildApiUrl('/meters');
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meterData),
    });
    if (!response.ok) throw new Error('Failed to create meter');
    return response.json();
};

/**
 * Update an existing meter
 * @param {string} id - Meter ID
 * @param {Object} meterData - Updated meter data
 * @returns {Promise<Object>} Updated meter
 */
export const updateMeter = async (id, meterData) => {
    const url = buildApiUrl(`/meters/${id}`);
    const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meterData),
    });
    if (!response.ok) throw new Error('Failed to update meter');
    return response.json();
};

/**
 * Delete a meter
 * @param {string} id - Meter ID
 * @returns {Promise<void>}
 */
export const deleteMeter = async (id) => {
    const url = buildApiUrl(`/meters/${id}`);
    const response = await fetch(url, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete meter');
};

/**
 * Clear all meters (development only)
 * @returns {Promise<Object>} Success message
 */
export const clearAllMeters = async () => {
    const url = buildApiUrl('/meters/all/clear');
    const response = await fetch(url, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to clear meters');
    return response.json();
};
