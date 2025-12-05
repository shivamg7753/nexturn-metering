import React from 'react';
import { BarChart2 } from 'lucide-react';

/**
 * MeterCard Component
 * Displays a single meter in card format
 */
export const MeterCard = ({ meter, schemas }) => {
    const filters = typeof meter.filter === 'string' ? JSON.parse(meter.filter) : meter.filter;
    const filterList = Array.isArray(filters)
        ? filters
        : Object.entries(filters).map(([k, v]) => ({ key: k, operator: 'equals', value: v }));

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:border-indigo-100 transition-colors">
            <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                    <BarChart2 className="w-5 h-5" />
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
