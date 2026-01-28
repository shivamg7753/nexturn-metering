import { useState, useEffect } from 'react';
import { fetchProductLogs, fetchProductEvents } from '../api/productApi';
import * as productService from '../services/product/productService';

/**
 * Custom hook for fetching and managing product data
 * Delegates business logic to productService layer
 * @param {string} productId - The product ID to fetch
 * @returns {object} Product data and loading state
 */
export function useProduct(productId) {
    const [product, setProduct] = useState(null);
    const [logs, setLogs] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        if (!productId) return;

        try {
            setLoading(true);
            setError(null);

            const [productData, logsData, eventsData] = await Promise.all([
                productService.fetchProductById(productId),
                fetchProductLogs(productId),
                fetchProductEvents(productId)
            ]);

            setProduct(productData);
            setLogs(logsData);
            setEvents(eventsData);
        } catch (err) {
            console.error('Failed to fetch product data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const refreshProduct = async () => {
        try {
            const productData = await productService.fetchProductById(productId);
            setProduct(productData);
        } catch (err) {
            console.error('Failed to refresh product:', err);
            setError(err.message);
        }
    };

    useEffect(() => {
        fetchData();
    }, [productId]);

    return {
        product,
        logs,
        events,
        loading,
        error,
        refreshProduct
    };
}
