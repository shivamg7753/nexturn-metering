/**
 * Meter Service
 * Business logic for meter management operations
 */

import * as meterApi from '../../api/meterApi';

/**
 * Validates meter data
 * @param {Object} meterData - Meter data to validate
 * @returns {Object} - { isValid: boolean, errors: {} }
 */
export function validateMeter(meterData) {
    const errors = {};

    if (!meterData.eventName || !meterData.eventName.trim()) {
        errors.eventName = 'Event name is required';
    }

    if (!meterData.displayName || !meterData.displayName.trim()) {
        errors.displayName = 'Display name is required';
    }

    if (!meterData.aggregationType) {
        errors.aggregationType = 'Aggregation type is required';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

/**
 * Transforms meter data from API format to UI format
 * @param {Object} apiMeter - Meter from  API
 * @returns {Object} - Transformed meter for UI
 */
export function transformMeterFromApi(apiMeter) {
    return {
        ...apiMeter,
        id: apiMeter._id || apiMeter.id,
        createdAt: apiMeter.createdAt ? new Date(apiMeter.createdAt) : null,
        updatedAt: apiMeter.updatedAt ? new Date(apiMeter.updatedAt) : null,
    };
}

/**
 * Transforms meter data from UI format to API format
 * @param {Object} uiMeter - Meter from UI
 * @returns {Object} - Transformed meter for API
 */
export function transformMeterToApi(uiMeter) {
    const apiMeter = {
        eventName: uiMeter.eventName,
        displayName: uiMeter.displayName,
        aggregationType: uiMeter.aggregationType,
        valuePropertyName: uiMeter.valuePropertyName,
        status: uiMeter.status || 'active',
    };

    // Remove undefined fields
    Object.keys(apiMeter).forEach(key => {
        if (apiMeter[key] === undefined) {
            delete apiMeter[key];
        }
    });

    return apiMeter;
}

/**
 * Fetches all meters
 * @returns {Promise<Array>} - Array of meters
 */
export async function fetchAllMeters() {
    try {
        const response = await meterApi.fetchMeters();
        return response.meters.map(transformMeterFromApi);
    } catch (error) {
        console.error('Error fetching meters:', error);
        throw new Error('Failed to fetch meters. Please try again.');
    }
}

/**
 * Fetches a single meter by ID
 * @param {string} meterId - Meter ID
 * @returns {Promise<Object>} - Meter data
 */
export async function fetchMeterById(meterId) {
    try {
        const meter = await meterApi.fetchMeterById(meterId);
        return transformMeterFromApi(meter);
    } catch (error) {
        console.error(`Error fetching meter ${meterId}:`, error);
        throw new Error('Failed to fetch meter details. Please try again.');
    }
}

/**
 * Creates a new meter
 * @param {Object} meterData - Meter data
 * @returns {Promise<Object>} - Created meter
 */
export async function createMeter(meterData) {
    // Validate
    const validation = validateMeter(meterData);
    if (!validation.isValid) {
        throw new Error(Object.values(validation.errors).join(', '));
    }

    try {
        const apiData = transformMeterToApi(meterData);
        const createdMeter = await meterApi.createMeter(apiData);
        return transformMeterFromApi(createdMeter);
    } catch (error) {
        console.error('Error creating meter:', error);
        throw new Error('Failed to create meter. Please try again.');
    }
}

/**
 * Updates an existing meter
 * @param {string} meterId - Meter ID
 * @param {Object} meterData - Updated meter data
 * @returns {Promise<Object>} - Updated meter
 */
export async function updateMeter(meterId, meterData) {
    // Validate
    const validation = validateMeter(meterData);
    if (!validation.isValid) {
        throw new Error(Object.values(validation.errors).join(', '));
    }

    try {
        const apiData = transformMeterToApi(meterData);
        const updatedMeter = await meterApi.updateMeter(meterId, apiData);
        return transformMeterFromApi(updatedMeter);
    } catch (error) {
        console.error(`Error updating meter ${meterId}:`, error);
        throw new Error('Failed to update meter. Please try again.');
    }
}

/**
 * Deletes a meter
 * @param {string} meterId - Meter ID
 * @returns {Promise<void>}
 */
export async function deleteMeter(meterId) {
    try {
        await meterApi.deleteMeter(meterId);
    } catch (error) {
        console.error(`Error deleting meter ${meterId}:`, error);
        throw new Error('Failed to delete meter. Please try again.');
    }
}
