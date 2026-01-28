import { buildApiUrl } from './config.js';

/**
 * Customer API Service
 * Handles all customer-related API calls
 */

/**
 * Fetch all customers
 * @returns {Promise<Array>} Customers array
 */
export const fetchCustomers = async () => {
    const url = buildApiUrl('/customers');
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch customers');
    return response.json();
};

/**
 * Fetch a single customer by ID
 * @param {string} id - Customer ID
 * @returns {Promise<Object>} Customer data
 */
export const fetchCustomerById = async (id) => {
    const url = buildApiUrl(`/customers/${id}`);
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch customer');
    return response.json();
};

/**
 * Create a new customer
 * @param {Object} customerData - Customer data
 * @returns {Promise<Object>} Created customer
 */
export const createCustomer = async (customerData) => {
    const url = buildApiUrl('/customers');
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData),
    });
    if (!response.ok) throw new Error('Failed to create customer');
    return response.json();
};

/**
 * Update an existing customer
 * @param {string} id - Customer ID
 * @param {Object} customerData - Updated customer data
 * @returns {Promise<Object>} Updated customer
 */
export const updateCustomer = async (id, customerData) => {
    const url = buildApiUrl(`/customers/${id}`);
    const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData),
    });
    if (!response.ok) throw new Error('Failed to update customer');
    return response.json();
};

/**
 * Delete a customer
 * @param {string} id - Customer ID
 * @returns {Promise<void>}
 */
export const deleteCustomer = async (id) => {
    const url = buildApiUrl(`/customers/${id}`);
    const response = await fetch(url, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete customer');
};
