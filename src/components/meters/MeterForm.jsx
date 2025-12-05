import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { FilterInput } from './FilterInput';
import { SchemaPreview } from './SchemaPreview';

/**
 * MeterForm Component
 * Complete form for creating a new meter
 */
export const MeterForm = ({
    name,
    description,
    eventSchemaId,
    aggregation,
    field,
    window,
    filters,
    schemas,
    onClose,
    onSubmit,
    onNameChange,
    onDescriptionChange,
    onSchemaChange,
    onAggregationChange,
    onFieldChange,
    onWindowChange,
    onAddFilter,
    onUpdateFilter,
    onRemoveFilter,
}) => {
    const currentSchema = schemas.find(s => s.id === eventSchemaId);
    const schemaStructure = currentSchema
        ? (typeof currentSchema.dimensions === 'string' ? JSON.parse(currentSchema.dimensions) : currentSchema.dimensions)
        : {};
    const availableAttributes = [
        ...(schemaStructure.attributes || []).map((a) => a.name),
        ...(schemaStructure.dimensions || [])
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ChevronLeft className="w-5 h-5 text-gray-500" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Create a new Usage Meter</h1>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
                    <h2 className="text-lg font-semibold text-gray-900">Define Usage Meter</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Usage Meter Name</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={e => onNameChange(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                placeholder="e.g. Count of transactions"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Usage Meter Description</label>
                            <textarea
                                value={description}
                                onChange={e => onDescriptionChange(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                rows={2}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Associate Event Schema</label>
                            <select
                                value={eventSchemaId}
                                onChange={e => onSchemaChange(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            >
                                {schemas.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <SchemaPreview schemaStructure={schemaStructure} />
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Set Filter Condition</h2>
                            <p className="text-sm text-gray-500">Aggregate events only matching the filter conditions.</p>
                        </div>
                        <button
                            type="button"
                            onClick={onAddFilter}
                            className="text-sm text-indigo-600 font-medium hover:text-indigo-700"
                        >
                            + Add Filter
                        </button>
                    </div>

                    <div className="space-y-4">
                        {filters.map((filter, idx) => (
                            <FilterInput
                                key={idx}
                                filter={filter}
                                index={idx}
                                availableAttributes={availableAttributes}
                                onUpdate={(field, value) => onUpdateFilter(idx, field, value)}
                                onRemove={() => onRemoveFilter(idx)}
                            />
                        ))}
                        {filters.length === 0 && (
                            <p className="text-sm text-gray-500 italic text-center py-4">
                                No filters applied. All events matching the schema will be aggregated.
                            </p>
                        )}
                    </div>
                </div>

                {/* Aggregation */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
                    <h2 className="text-lg font-semibold text-gray-900">Set Aggregation Type</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Aggregation Type</label>
                            <select
                                value={aggregation}
                                onChange={e => onAggregationChange(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            >
                                <option value="count">Count</option>
                                <option value="sum">Sum</option>
                                <option value="max">Max</option>
                                <option value="unique_count">Unique Count</option>
                            </select>
                        </div>

                        {aggregation !== 'count' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Target Field</label>
                                <select
                                    value={field}
                                    onChange={e => onFieldChange(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    required
                                >
                                    <option value="">Select Field</option>
                                    {availableAttributes.map(attr => (
                                        <option key={attr} value={attr}>{attr}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                    >
                        Create Meter
                    </button>
                </div>
            </form>
        </div>
    );
};
