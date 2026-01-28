import { useState } from 'react';
import * as priceApi from '../api/priceApi';

/**
 * Custom hook for managing price operations (add, edit, delete)
 * @param {string} productId - The product ID
 * @param {function} onSuccess - Callback function to execute on successful operations
 * @param {function} showSuccess - Function to show success message
 * @param {function} showError - Function to show error message
 * @returns {object} Price management state and handlers
 */
export function usePriceManagement(productId, onSuccess, showSuccess, showError) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingPriceIndex, setEditingPriceIndex] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletingPriceIndex, setDeletingPriceIndex] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const handleAddPrice = () => {
        setEditingPriceIndex(null);
        setDrawerOpen(true);
    };

    const handleEditPrice = (index) => {
        setEditingPriceIndex(index);
        setDrawerOpen(true);
    };

    const handleDeletePrice = (index) => {
        setDeletingPriceIndex(index);
        setDeleteDialogOpen(true);
    };

    const handleSubmitPrice = async (formData) => {
        try {
            // Extract price data from formData
            const priceData = formData.prices && formData.prices.length > 0
                ? formData.prices[0]
                : formData;

            if (editingPriceIndex !== null) {
                // Update existing price
                await priceApi.updatePrice(productId, editingPriceIndex, priceData);
                showSuccess('Price updated successfully');
            } else {
                // Add new price
                await priceApi.addPrice(productId, priceData);
                showSuccess('Price added successfully');
            }

            await onSuccess();
            closeDrawer();
        } catch (error) {
            showError(error.message || 'Failed to save price');
        }
    };

    const handleConfirmDelete = async () => {
        if (deletingPriceIndex === null) return;

        setDeleteLoading(true);
        try {
            await priceApi.deletePrice(productId, deletingPriceIndex);
            await onSuccess();
            showSuccess('Price deleted successfully');
            closeDeleteDialog();
        } catch (error) {
            showError(error.message || 'Failed to delete price');
        } finally {
            setDeleteLoading(false);
        }
    };

    const closeDrawer = () => {
        setDrawerOpen(false);
        setEditingPriceIndex(null);
    };

    const closeDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setDeletingPriceIndex(null);
    };

    return {
        // State
        drawerOpen,
        editingPriceIndex,
        deleteDialogOpen,
        deletingPriceIndex,
        deleteLoading,

        // Actions
        handleAddPrice,
        handleEditPrice,
        handleDeletePrice,
        handleSubmitPrice,
        handleConfirmDelete,

        // UI Controls
        closeDrawer,
        closeDeleteDialog
    };
}
