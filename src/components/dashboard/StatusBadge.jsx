import React from 'react';

/**
 * StatusBadge Component
 * Displays a colored badge for invoice/subscription status
 */
export const StatusBadge = ({ status }) => {
    const styles = {
        paid: 'bg-green-100 text-green-800',
        draft: 'bg-gray-100 text-gray-800',
        overdue: 'bg-red-100 text-red-800',
        voided: 'bg-gray-100 text-gray-500',
        finalized: 'bg-blue-100 text-blue-800',
        active: 'bg-green-100 text-green-800',
        pending: 'bg-yellow-100 text-yellow-800',
        canceled: 'bg-red-100 text-red-800',
    };

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
            {status}
        </span>
    );
};
