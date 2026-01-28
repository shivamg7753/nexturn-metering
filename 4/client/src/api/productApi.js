import { buildApiUrl } from './config.js';

/**
 * Product API Service
 * Handles all product-related API calls
 */

/**
 * Fetch all products with optional status filter
 * @param {string} status - Filter by status ('all', 'active', 'archived')
 * @returns {Promise<Object>} Products data with counts
 */
export const fetchProducts = async (status = 'all') => {
    const url = buildApiUrl(`/products${status !== 'all' ? `?status=${status}` : ''}`);
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
};

/**
 * Fetch a single product by ID
 * @param {string} id - Product ID
 * @returns {Promise<Object>} Product data
 */
export const fetchProductById = async (id) => {
    const url = buildApiUrl(`/products/${id}`);
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch product');
    return response.json();
};

/**
 * Create a new product
 * @param {Object} productData - Product data
 * @returns {Promise<Object>} Created product
 */
export const createProduct = async (productData) => {
    const url = buildApiUrl('/products');
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
    });
    if (!response.ok) throw new Error('Failed to create product');
    return response.json();
};

/**
 * Update an existing product
 * @param {string} id - Product ID
 * @param {Object} productData - Updated product data
 * @returns {Promise<Object>} Updated product
 */
export const updateProduct = async (id, productData) => {
    const url = buildApiUrl(`/products/${id}`);
    const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
    });
    if (!response.ok) throw new Error('Failed to update product');
    return response.json();
};

/**
 * Delete a product
 * @param {string} id - Product ID
 * @returns {Promise<void>}
 */
export const deleteProduct = async (id) => {
    const url = buildApiUrl(`/products/${id}`);
    const response = await fetch(url, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete product');
};

/**
 * Fetch product logs
 * @param {string} id - Product ID
 * @returns {Promise<Array>} Product logs
 */
export const fetchProductLogs = async (id) => {
    const url = buildApiUrl(`/products/${id}/logs`);
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch product logs');
    return response.json();
};

/**
 * Fetch product events
 * @param {string} id - Product ID
 * @returns {Promise<Array>} Product events
 */
export const fetchProductEvents = async (id) => {
    const url = buildApiUrl(`/products/${id}/events`);
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch product events');
    return response.json();
};

/**
 * Clear all products (development only)
 * @returns {Promise<Object>} Success message
 */
export const clearAllProducts = async () => {
    const url = buildApiUrl('/products/all/clear');
    const response = await fetch(url, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to clear products');
    return response.json();
};
