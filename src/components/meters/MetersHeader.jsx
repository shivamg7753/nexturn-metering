import React from 'react';
import { Plus } from 'lucide-react';

/**
 * MetersHeader Component
 * Header for meters page with title, view toggle, and create button
 */
export const MetersHeader = ({ onCreate, viewMode, onViewChange }) => {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Usage Meters</h1>
                <p className="text-gray-500 mt-1">Configure how events are aggregated into billable usage.</p>
            </div>
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-lg p-1">
                    <button
                        onClick={() => onViewChange('grid')}
                        className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        title="Card View"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-layout-grid w-4 h-4" aria-hidden="true"><rect width="7" height="7" x="3" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="14" rx="1"></rect><rect width="7" height="7" x="3" y="14" rx="1"></rect></svg>
                    </button>
                    <button
                        onClick={() => onViewChange('list')}
                        className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        title="List View"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-list w-4 h-4" aria-hidden="true"><path d="M3 5h.01"></path><path d="M3 12h.01"></path><path d="M3 19h.01"></path><path d="M8 5h13"></path><path d="M8 12h13"></path><path d="M8 19h13"></path></svg>
                    </button>
                </div>
                <button
                    onClick={onCreate}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Meter
                </button>
            </div>
        </div>
    );
};
