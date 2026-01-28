/**
 * Product Service
 * Business logic layer for product operations
 * Handles validation, transformation, and complex business rules
 */

import * as productApi from '../../api/productApi';

/**
 * Validates product form data
 * @param {Object} productData - Product data to validate
 * @returns {Object} - { isValid: boolean, errors: {} }
 */
export function validateProduct(productData) {
    const errors = {};

    if (!productData.name || !productData.name.trim()) {
        errors.name = 'Product name is required';
    }

    if (productData.name && productData.name.length > 100) {
        errors.name = 'Product name must be less than 100 characters';
    }

    if (productData.prices && productData.prices.length === 0) {
        errors.prices = 'At least one price is required';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

/**
 * Transforms product data from API format to UI format
 * @param {Object} apiProduct - Product data from API
 * @returns {Object} - Transformed product for UI
 */
export function transformProductFromApi(apiProduct) {
    return {
        ...apiProduct,
        id: apiProduct._id || apiProduct.id,
        // Ensure prices is always an array
        prices: apiProduct.prices || [],
        // Add any UI-specific fields
        displayName: apiProduct.name,
        // Format dates if needed
        createdAt: apiProduct.createdAt ? new Date(apiProduct.createdAt) : null,
        updatedAt: apiProduct.updatedAt ? new Date(apiProduct.updatedAt) : null,
    };
}

/**
 * Transforms product data from UI format to API format
 * @param {Object} uiProduct - Product data from UI
 * @returns {Object} - Transformed product for API
 */
export function transformProductToApi(uiProduct) {
    const apiProduct = {
        name: uiProduct.name,
        description: uiProduct.description,
        imageUrl: uiProduct.imageUrl,
        statementDescriptor: uiProduct.statementDescriptor,
        unitLabel: uiProduct.unitLabel,
        taxCategory: uiProduct.taxCode,
        prices: uiProduct.prices,
        status: uiProduct.status || 'active',
    };

    // Remove undefined fields
    Object.keys(apiProduct).forEach(key => {
        if (apiProduct[key] === undefined) {
            delete apiProduct[key];
        }
    });

    return apiProduct;
}

/**
 * Fetches all products with optional transformations
 * @returns {Promise<Array>} - Array of products
 */
export async function fetchAllProducts() {
    try {
        const response = await productApi.fetchProducts();
        return response.products.map(transformProductFromApi);
    } catch (error) {
        console.error('Error fetching products:', error);
        throw new Error('Failed to fetch products. Please try again.');
    }
}

/**
 * Fetches a single product by ID
 * @param {string} productId - Product ID
 * @returns {Promise<Object>} - Product data
 */
export async function fetchProductById(productId) {
    try {
        const product = await productApi.fetchProductById(productId);
        return transformProductFromApi(product);
    } catch (error) {
        console.error(`Error fetching product ${productId}:`, error);
        throw new Error('Failed to fetch product details. Please try again.');
    }
}

/**
 * Creates a new product
 * @param {Object} productData - Product data
 * @returns {Promise<Object>} - Created product
 */
export async function createProduct(productData) {
    // Validate
    const validation = validateProduct(productData);
    if (!validation.isValid) {
        throw new Error(Object.values(validation.errors).join(', '));
    }

    try {
        const apiData = transformProductToApi(productData);
        const createdProduct = await productApi.createProduct(apiData);
        return transformProductFromApi(createdProduct);
    } catch (error) {
        console.error('Error creating product:', error);
        throw new Error('Failed to create product. Please try again.');
    }
}

/**
 * Updates an existing product
 * @param {string} productId - Product ID
 * @param {Object} productData - Updated product data
 * @returns {Promise<Object>} - Updated product
 */
export async function updateProduct(productId, productData) {
    // Validate
    const validation = validateProduct(productData);
    if (!validation.isValid) {
        throw new Error(Object.values(validation.errors).join(', '));
    }

    try {
        const apiData = transformProductToApi(productData);
        const updatedProduct = await productApi.updateProduct(productId, apiData);
        return transformProductFromApi(updatedProduct);
    } catch (error) {
        console.error(`Error updating product ${productId}:`, error);
        throw new Error('Failed to update product. Please try again.');
    }
}

/**
 * Deletes a product
 * @param {string} productId - Product ID
 * @returns {Promise<void>}
 */
export async function deleteProduct(productId) {
    try {
        await productApi.deleteProduct(productId);
    } catch (error) {
        console.error(`Error deleting product ${productId}:`, error);
        throw new Error('Failed to delete product. Please try again.');
    }
}
