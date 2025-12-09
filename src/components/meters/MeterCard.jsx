import React from 'react';
import { BarChart2, Edit2, Play, Archive, AlertCircle } from 'lucide-react';

/**
 * MeterCard Component
 * Displays a single meter in card format
 */
export const MeterCard = ({ meter, schemas, onEdit, onToggleStatus, onSelect }) => {
    const filters = typeof meter.filter === 'string' ? JSON.parse(meter.filter) : meter.filter;
    const filterList = Array.isArray(filters)
        ? filters
        : Object.entries(filters).map(([k, v]) => ({ key: k, operator: 'equals', value: v }));

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'text-green-700 bg-green-50 border-green-200';
            case 'draft': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
            case 'archived': return 'text-gray-700 bg-gray-50 border-gray-200';
            default: return 'text-gray-700 bg-gray-50 border-gray-200';
        }
    };

    const isEditable = meter.status === 'draft';
    const isActive = meter.status === 'active';
    const isArchived = meter.status === 'archived';

    return (
        <div
            onClick={() => onSelect && onSelect(meter)}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:border-indigo-100 transition-colors relative group cursor-pointer"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                        <BarChart2 className="w-5 h-5" />
                    </div>
                    <span className={`px-2.5 py-0.5 text-xs font-medium rounded border ${getStatusColor(meter.status || 'draft')}`}>
                        {(meter.status || 'draft').charAt(0).toUpperCase() + (meter.status || 'draft').slice(1)}
                    </span>
                </div>

                <div className="flex items-center gap-1 opacity-100 transition-opacity">
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(meter); }}
                        disabled={!isEditable}
                        title={isEditable ? "Edit Meter" : "Switch to Draft to edit"}
                        className={`p-1.5 hover:bg-gray-100 rounded transition-colors ${isEditable
                            ? ''
                            : 'cursor-not-allowed opacity-50'
                            }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-pen w-4 h-4 ${isEditable ? 'text-gray-600' : 'text-gray-300'}`} aria-hidden="true"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path></svg>
                    </button>
                    {!isArchived && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onToggleStatus(meter); }}
                            title={isActive ? "Archive Meter" : "Publish Meter"}
                            className={`p-1.5 rounded-md transition-colors ${isActive
                                ? 'text-red-400 hover:text-red-700 hover:bg-red-50'
                                : 'text-green-400 hover:text-green-700 hover:bg-green-50'
                                }`}
                        >
                            {isActive ? <Archive className="w-4 h-4" /> : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-play w-4 h-4" aria-hidden="true">
                                    <path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"></path>
                                </svg>
                            )}
                        </button>
                    )}
                </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{meter.name}</h3>
            <p className="text-sm text-gray-500 mb-4">{meter.description || 'No description provided.'}</p>

            <div className="space-y-3 text-sm text-gray-600 border-t border-gray-100 pt-4">
                <div className="flex justify-between">
                    <span className="text-gray-400">Schema:</span>
                    <span className="font-medium">
                        {schemas.find(s => s.id === meter.eventSchemaId)?.name || meter.eventSchemaId}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-400">Aggregation:</span>
                    <span className="font-medium capitalize">
                        {meter.aggregation} {meter.field ? `(${meter.field})` : ''}
                    </span>
                </div>

                {filterList.length > 0 && (
                    <div>
                        <span className="text-gray-400 block mb-1">Filters:</span>
                        <div className="flex flex-wrap gap-1">
                            {filterList.map((f, i) => (
                                <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                                    {f.key} {f.operator === 'equals' ? '==' : f.operator} {f.value}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
