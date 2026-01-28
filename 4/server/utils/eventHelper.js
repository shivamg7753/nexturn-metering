import Event from '../models/Event.js';

/**
 * Event Helper Utilities
 */

/**
 * Create an event entry for resource operations
 * @param {string} resourceId - ID of the resource
 * @param {string} resourceType - Type of resource (e.g., 'product', 'customer')
 * @param {string} description - Event description
 * @returns {Promise<Object>} Created event document
 */
export const createEvent = async (resourceId, resourceType, description) => {
    try {
        const event = new Event({
            resourceId,
            resourceType,
            description,
            timestamp: new Date()
        });
        await event.save();
        return event;
    } catch (error) {
        console.error('Error creating event:', error);
        throw error;
    }
};
