import { useState } from 'react';

/**
 * Custom hook for managing snackbar notifications
 * @returns {object} Snackbar state and control functions
 */
export function useSnackbar() {
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' // 'success' | 'error' | 'warning' | 'info'
    });

    const showSuccess = (message) => {
        setSnackbar({
            open: true,
            message,
            severity: 'success'
        });
    };

    const showError = (message) => {
        setSnackbar({
            open: true,
            message,
            severity: 'error'
        });
    };

    const showWarning = (message) => {
        setSnackbar({
            open: true,
            message,
            severity: 'warning'
        });
    };

    const showInfo = (message) => {
        setSnackbar({
            open: true,
            message,
            severity: 'info'
        });
    };

    const hideSnackbar = () => {
        setSnackbar(prev => ({
            ...prev,
            open: false
        }));
    };

    return {
        snackbar,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        hideSnackbar
    };
}
