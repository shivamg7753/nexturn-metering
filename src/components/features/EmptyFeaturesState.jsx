import React from 'react';
import { CheckCircle, Plus } from 'lucide-react';

/**
 * EmptyFeaturesState Component
 * Displays when no features are found
 */
export const EmptyFeaturesState = ({ onCreate }) => {
    return (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No features found</h3>
            <p className="mt-1 text-sm text-gray-500">Define what your customers can do.</p>
            <div className="mt-6">
                <button
                    onClick={onCreate}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    New Feature
                </button>
            </div>
        </div>
    );
};
