import React from 'react';
import { Code } from 'lucide-react';

/**
 * SchemaCard Component
 * Displays an event schema in card view
 */
export const SchemaCard = ({ schema, onClick }) => {
    const structure = typeof schema.dimensions === 'string'
        ? JSON.parse(schema.dimensions)
        : schema.dimensions;

    const attributes = structure.attributes || [];
    const dimensions = structure.dimensions || [];
    const isLegacy = !Array.isArray(attributes) && !Array.isArray(dimensions);
    const legacyKeys = isLegacy ? Object.keys(structure) : [];

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'text-green-700 bg-green-50 border-green-200';
            case 'draft': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
            case 'archived': return 'text-gray-700 bg-gray-50 border-gray-200';
            default: return 'text-gray-700 bg-gray-50 border-gray-200';
        }
    };

    return (
        <div
            onClick={onClick}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:border-indigo-100 transition-colors cursor-pointer"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                    <Code className="w-5 h-5" />
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded border ${getStatusColor(schema.status)}`}>
                    • {schema.status ? schema.status.charAt(0).toUpperCase() + schema.status.slice(1) : 'Draft'}
                </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{schema.name}</h3>
            <p className="text-sm text-gray-500 mb-4">{schema.description || 'No description provided.'}</p>

            <div className="border-t border-gray-100 pt-4 space-y-3">
                {attributes.length > 0 && (
                    <div>
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Attributes</h4>
                        <div className="flex flex-wrap gap-2">
                            {attributes.map((attr, i) => (
                                <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100">
                                    {attr.name} <span className="opacity-50">({attr.unit})</span>
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {dimensions.length > 0 && (
                    <div>
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Dimensions</h4>
                        <div className="flex flex-wrap gap-2">
                            {dimensions.map((dim, i) => (
                                <span key={i} className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded border border-purple-100">
                                    {dim}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {isLegacy && legacyKeys.length > 0 && (
                    <div>
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Properties</h4>
                        <div className="flex flex-wrap gap-2">
                            {legacyKeys.map((key) => (
                                <span key={key} className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded border border-gray-100">
                                    {key}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
