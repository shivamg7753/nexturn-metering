/**
 * Date Formatter Utilities
 */

/**
 * Format date to a readable string (e.g., "Jan 15, 2026")
 * @param {Date} date - Date object to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

/**
 * Format datetime to a readable string with time (e.g., "Jan 15, 2026 at 10:30 AM")
 * @param {Date} date - Date object to format
 * @returns {string} Formatted datetime string
 */
export const formatDateTime = (date) => {
    const options = {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    };
    return new Date(date).toLocaleDateString('en-US', options).replace(',', ' at');
};
