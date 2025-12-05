import React from 'react';
import { Plus, Search } from 'lucide-react';

/**
 * FeaturesHeader Component
 * Search and create button for features list
 */
export const FeaturesHeader = ({ searchTerm, onSearchChange, onCreate }) => {
    return (
        <div className="flex justify-between items-center">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                    type="text"
                    placeholder="Search features..."
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>
            <button
                onClick={onCreate}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
                <Plus className="h-5 w-5 mr-2" />
                New Feature
            </button>
        </div>
    );
};
