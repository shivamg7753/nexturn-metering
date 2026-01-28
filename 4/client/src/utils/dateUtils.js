/**
 * Utility functions for date formatting
 */

/**
 * Formats a date string into a short format (e.g., "Jan 28")
 * @param {string} dateString - The date string to format
 * @returns {string} Formatted date string
 */
export const formatDateShort = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/**
 * Formats a date string into a long format with time (e.g., "Jan 28, 2026, 3:36 PM")
 * @param {string} dateString - The date string to format
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${dateStr}, ${timeStr}`;
};

/**
 * Formats a date string into ISO date part only (e.g., "2026-01-28")
 * @param {string} dateString - The date string to format
 * @returns {string} ISO date string
 */
export const formatDateISO = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
};
