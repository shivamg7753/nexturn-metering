import React from 'react';
import { Plus } from 'lucide-react';

/**
 * MetersHeader Component
 * Header for meters page with title and create button
 */
export const MetersHeader = ({ onCreate }) => {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Usage Meters</h1>
                <p className="text-gray-500 mt-1">Configure how events are aggregated into billable usage.</p>
            </div>
            <button
                onClick={onCreate}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
                <Plus className="w-4 h-4 mr-2" />
                Create Meter
            </button>
        </div>
    );
};
