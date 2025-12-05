import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { api } from '../api/client';

/**
 * Custom hook for managing event schemas
 * Handles loading, filtering, sorting, and creating schemas
 */
export const useSchemas = () => {
    const [schemas, setSchemas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('updated_desc');

    useEffect(() => {
        loadSchemas();
    }, []);

    const loadSchemas = async () => {
        try {
            setLoading(true);
            const data = await api.getSchemas();
            setSchemas(data);
        } catch (err) {
            console.error('Failed to load schemas', err);
            toast.error('Failed to load event schemas');
        } finally {
            setLoading(false);
        }
    };

    const createSchema = async (schemaData) => {
        const loadingToast = toast.loading('Creating event schema...');
        try {
            await api.createSchema(schemaData);
            await loadSchemas(); // Reload schemas after creation
            toast.success('Event schema created successfully!', { id: loadingToast });
            return { success: true };
        } catch (err) {
            console.error('Failed to create schema', err);
            toast.error('Failed to create event schema. Please try again.', { id: loadingToast });
            return { success: false, error: err };
        }
    };

    // Filter and sort schemas
    const filteredSchemas = schemas
        .filter(schema =>
            schema.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (schema.description && schema.description.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .sort((a, b) => {
            if (sortBy === 'updated_desc') {
                return new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at);
            }
            if (sortBy === 'name_asc') {
                return a.name.localeCompare(b.name);
            }
            return 0;
        });

    return {
        schemas,
        loading,
        searchQuery,
        setSearchQuery,
        sortBy,
        setSortBy,
        filteredSchemas,
        createSchema,
        refreshSchemas: loadSchemas,
    };
};
