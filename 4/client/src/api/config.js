/**
 * API Configuration
 * Centralized configuration for API calls
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

/**
 * Default headers for API requests
 */
const defaultHeaders = {
    'Content-Type': 'application/json',
};

/**
 * API configuration object
 */
export const apiConfig = {
    baseURL: API_BASE_URL,
    headers: defaultHeaders,
};

/**
 * Helper function to build full API URL
 * @param {string} endpoint - API endpoint path
 * @returns {string} Full API URL
 */
export const buildApiUrl = (endpoint) => {
    return `${API_BASE_URL}${endpoint}`;
};

// Export API_BASE_URL for direct use
export { API_BASE_URL };

export default apiConfig;
