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
    eventLevelCalculation,
    onEventLevelCalculationChange,
    onAddFilter,
    onUpdateFilter,
    onRemoveFilter,
    isEditing = false,
}) => {
    const [showPublishConfirmation, setShowPublishConfirmation] = React.useState(false);

    const currentSchema = schemas.find(s => s.id === eventSchemaId);
    const schemaStructure = currentSchema
        ? (typeof currentSchema.dimensions === 'string' ? JSON.parse(currentSchema.dimensions) : currentSchema.dimensions)
        : {};
    const availableAttributes = [
        ...(schemaStructure.attributes || []).map((a) => a.name),
        ...(schemaStructure.dimensions || [])
    ];

    const handlePublishClick = () => {
        setShowPublishConfirmation(true);
    };

    const confirmPublish = (e) => {
        setShowPublishConfirmation(false);
        onSubmit(e, 'active');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 relative">
            {showPublishConfirmation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="p-3 bg-red-50 rounded-full">
                                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Activate Usage Meter?</h3>
                            <p className="text-gray-500">
                                Once the Usage Meter is activated, it cannot be edited again. Do you want to proceed?
                            </p>
                            <div className="flex gap-3 w-full pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowPublishConfirmation(false)}
                                    className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={confirmPublish}
                                    className="flex-1 px-4 py-2 text-white bg-slate-900 rounded-lg hover:bg-slate-800 font-medium"
                                >
                                    Activate
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ChevronLeft className="w-5 h-5 text-gray-500" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">{isEditing ? 'Edit Usage Meter' : 'Create a new Usage Meter'}</h1>
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

                        {/* {aggregation !== 'count' && (
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
                        )} */}
                    </div>
                </div>

                {/* Per Unit Calculation Function */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Per Unit Calculation Function</h2>
                        <p className="text-sm text-gray-500">Add an event level additional calculation for aggregated events</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="border border-dashed border-gray-300 rounded-lg p-6">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                                PER UNIT CALCULATION FUNCTIONS
                            </label>
                            <select
                                value={eventLevelCalculation}
                                onChange={e => onEventLevelCalculationChange(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                            >
                                <option value="">Choose Attribute</option>
                                {availableAttributes.map(attr => (
                                    <option key={attr} value={attr}>{attr}</option>
                                ))}
                            </select>
                            <div className="mt-4">
                                <button type="button" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-2">
                                    <span className="text-lg leading-none">+</span> Add condition
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                                CODE PREVIEW
                            </label>
                            <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono text-gray-600 h-[120px] flex items-center">
                                {eventLevelCalculation ? `attributes['${eventLevelCalculation}']` : ''}
                            </div>
                        </div>
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
                    {!isEditing ? (
                        <>
                            <button
                                type="button"
                                onClick={(e) => onSubmit(e, 'draft')}
                                className="px-6 py-2 text-sm font-medium text-gray-700 bg-yellow-50 border border-yellow-200 text-yellow-700 hover:bg-yellow-100 rounded-lg"
                            >
                                Save as Draft
                            </button>
                            <button
                                type="button"
                                onClick={handlePublishClick}
                                className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                            >
                                Publish Meter
                            </button>
                        </>
                    ) : (
                        <button
                            type="submit"
                            onClick={(e) => onSubmit(e)}
                            className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                        >
                            Update Meter
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};
