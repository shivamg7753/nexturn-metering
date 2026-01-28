/**
 * Customer Service
 * Business logic for customer operations
 */

import * as customerApi from '../../api/customerApi';

/**
 * Validates customer data
 * @param {Object} customerData - Customer data to validate
 * @returns {Object} - { isValid: boolean, errors: {} }
 */
export function validateCustomer(customerData) {
    const errors = {};

    if (!customerData.name || !customerData.name.trim()) {
        errors.name = 'Customer name is required';
    }

    if (!customerData.email || !customerData.email.trim()) {
        errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email)) {
        errors.email = 'Invalid email format';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

/**
 * Transforms customer data from API format to UI format
 * @param {Object} apiCustomer - Customer from API
 * @returns {Object} - Transformed customer for UI
 */
export function transformCustomerFromApi(apiCustomer) {
    return {
        ...apiCustomer,
        id: apiCustomer._id || apiCustomer.id,
        displayName: apiCustomer.name,
        createdAt: apiCustomer.createdAt ? new Date(apiCustomer.createdAt) : null,
        updatedAt: apiCustomer.updatedAt ? new Date(apiCustomer.updatedAt) : null,
    };
}

/**
 * Transforms customer data from UI format to API format
 * @param {Object} uiCustomer - Customer from UI
 * @returns {Object} - Transformed customer for API
 */
export function transformCustomerToApi(uiCustomer) {
    const apiCustomer = {
        name: uiCustomer.name,
        email: uiCustomer.email,
        phone: uiCustomer.phone,
        address: uiCustomer.address,
        metadata: uiCustomer.metadata,
    };

    // Remove undefined fields
    Object.keys(apiCustomer).forEach(key => {
        if (apiCustomer[key] === undefined) {
            delete apiCustomer[key];
        }
    });

    return apiCustomer;
}

/**
 * Fetches all customers
 * @returns {Promise<Array>} - Array of customers
 */
export async function fetchAllCustomers() {
    try {
        const response = await customerApi.fetchCustomers();
        // Handle both { customers: [] } and direct array response
        const customers = response.customers || response || [];
        return customers.map(transformCustomerFromApi);
    } catch (error) {
        console.error('Error fetching customers:', error);
        throw new Error('Failed to fetch customers. Please try again.');
    }
}

/**
 * Fetches a single customer by ID
 * @param {string} customerId - Customer ID
 * @returns {Promise<Object>} - Customer data
 */
export async function fetchCustomerById(customerId) {
    try {
        const customer = await customerApi.fetchCustomerById(customerId);
        return transformCustomerFromApi(customer);
    } catch (error) {
        console.error(`Error fetching customer ${customerId}:`, error);
        throw new Error('Failed to fetch customer details. Please try again.');
    }
}

/**
 * Creates a new customer
 * @param {Object} customerData - Customer data
 * @returns {Promise<Object>} - Created customer
 */
export async function createCustomer(customerData) {
    // Validate
    const validation = validateCustomer(customerData);
    if (!validation.isValid) {
        throw new Error(Object.values(validation.errors).join(', '));
    }

    try {
        const apiData = transformCustomerToApi(customerData);
        const createdCustomer = await customerApi.createCustomer(apiData);
        return transformCustomerFromApi(createdCustomer);
    } catch (error) {
        console.error('Error creating customer:', error);
        throw new Error('Failed to create customer. Please try again.');
    }
}

/**
 * Updates an existing customer
 * @param {string} customerId - Customer ID
 * @param {Object} customerData - Updated customer data
 * @returns {Promise<Object>} - Updated customer
 */
export async function updateCustomer(customerId, customerData) {
    // Validate
    const validation = validateCustomer(customerData);
    if (!validation.isValid) {
        throw new Error(Object.values(validation.errors).join(', '));
    }

    try {
        const apiData = transformCustomerToApi(customerData);
        const updatedCustomer = await customerApi.updateCustomer(customerId, apiData);
        return transformCustomerFromApi(updatedCustomer);
    } catch (error) {
        console.error(`Error updating customer ${customerId}:`, error);
        throw new Error('Failed to update customer. Please try again.');
    }
}

/**
 * Deletes a customer
 * @param {string} customerId - Customer ID
 * @returns {Promise<void>}
 */
export async function deleteCustomer(customerId) {
    try {
        await customerApi.deleteCustomer(customerId);
    } catch (error) {
        console.error(`Error deleting customer ${customerId}:`, error);
        throw new Error('Failed to delete customer. Please try again.');
    }
}
