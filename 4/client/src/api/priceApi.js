import { API_BASE_URL } from './config';

/**
 * Price API - Handles all price-related API calls
 */

/**
 * Add a new price to a product
 * @param {string} productId - The product ID
 * @param {object} priceData - The price data to add
 * @returns {Promise<object>} Updated product data
 */
export async function addPrice(productId, priceData) {
    const response = await fetch(`${API_BASE_URL}/products/${productId}/prices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(priceData)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add price');
    }

    return response.json();
}

/**
 * Update an existing price
 * @param {string} productId - The product ID
 * @param {number} priceIndex - Index of the price to update
 * @param {object} priceData - The updated price data
 * @returns {Promise<object>} Updated product data
 */
export async function updatePrice(productId, priceIndex, priceData) {
    const response = await fetch(`${API_BASE_URL}/products/${productId}/prices/${priceIndex}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(priceData)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update price');
    }

    return response.json();
}

/**
 * Delete a price from a product
 * @param {string} productId - The product ID
 * @param {number} priceIndex - Index of the price to delete
 * @returns {Promise<object>} Updated product data
 */
export async function deletePrice(productId, priceIndex) {
    const response = await fetch(`${API_BASE_URL}/products/${productId}/prices/${priceIndex}`, {
        method: 'DELETE'
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete price');
    }

    return response.json();
}
