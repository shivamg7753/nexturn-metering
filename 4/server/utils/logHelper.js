import Log from '../models/Log.js';

/**
 * Log Helper Utilities
 */

/**
 * Create a log entry for API operations
 * @param {string} resourceId - ID of the resource being operated on
 * @param {string} resourceType - Type of resource (e.g., 'product', 'customer')
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {string} endpoint - API endpoint path
 * @param {number} statusCode - HTTP status code
 * @returns {Promise<Object>} Created log document
 */
export const createLog = async (resourceId, resourceType, method, endpoint, statusCode) => {
    try {
        const log = new Log({
            resourceId,
            resourceType,
            method,
            endpoint,
            statusCode,
            timestamp: new Date()
        });
        await log.save();
        return log;
    } catch (error) {
        console.error('Error creating log:', error);
        throw error;
    }
};
