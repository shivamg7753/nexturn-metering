import React from 'react';
import { Trash2 } from 'lucide-react';

/**
 * FilterInput Component
 * Single filter condition input for meters
 */
export const FilterInput = ({ filter, index, availableAttributes, onUpdate, onRemove }) => {
    return (
        <div className="p-4 bg-gray-50 rounded-lg border border-dashed border-gray-200 relative">
            <button
                type="button"
                onClick={onRemove}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
            >
                <Trash2 className="w-4 h-4" />
            </button>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Filter Condition {index + 1}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Attribute/Dimension</label>
                    <select
                        value={filter.key}
                        onChange={e => onUpdate('key', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                    >
                        <option value="">Select Field</option>
                        {availableAttributes.map(attr => (
                            <option key={attr} value={attr}>{attr}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Operator</label>
                    <select
                        value={filter.operator}
                        onChange={e => onUpdate('operator', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                    >
                        <option value="equals">equals (==)</option>
                        <option value="not_equals">not equals (!=)</option>
                        <option value="contains">contains</option>
                        <option value="gt">greater than (&gt;)</option>
                        <option value="lt">less than (&lt;)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Value</label>
                    <input
                        type="text"
                        value={filter.value}
                        onChange={e => onUpdate('value', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        placeholder="Value to match"
                    />
                </div>
            </div>
        </div>
    );
};
