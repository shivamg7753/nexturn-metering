import React, { useState } from 'react';
import { ChevronLeft, Plus, Trash2 } from 'lucide-react';

/**
 * SchemaCreationForm Component
 * Form for creating new event schemas
 */
export const SchemaCreationForm = ({ onSubmit, onCancel }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [attributes, setAttributes] = useState([]);
    const [dimensions, setDimensions] = useState([]);
    const [dependencies, setDependencies] = useState([]);
    const [enrichments, setEnrichments] = useState([]);

    const handleAddAttribute = () => {
        setAttributes([...attributes, { name: '', unit: '' }]);
    };

    const handleUpdateAttribute = (index, field, value) => {
        const newAttributes = [...attributes];
        newAttributes[index][field] = value;
        setAttributes(newAttributes);
    };

    const handleRemoveAttribute = (index) => {
        setAttributes(attributes.filter((_, i) => i !== index));
    };

    const handleAddDimension = () => {
        setDimensions([...dimensions, '']);
    };

    const handleUpdateDimension = (index, value) => {
        const newDimensions = [...dimensions];
        newDimensions[index] = value;
        setDimensions(newDimensions);
    };

    const handleRemoveDimension = (index) => {
        setDimensions(dimensions.filter((_, i) => i !== index));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const schemaData = {
            name,
            description,
            dimensions: JSON.stringify({
                attributes,
                dimensions,
            }),
        };
        onSubmit(schemaData);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header with back button */}
            <div className="bg-white border-b border-gray-200 px-8 py-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onCancel}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <h1 className="text-xl font-semibold text-gray-900">Create Event Schema</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-6xl mx-auto px-8 py-8 space-y-6">
                {/* Define Event Schema Section */}
                <div className="bg-white rounded-lg border border-gray-200 p-8">
                    <div className="grid grid-cols-12 gap-8">
                        {/* Left side description */}
                        <div className="col-span-4">
                            <h2 className="text-base font-semibold text-gray-900 mb-2">Define Event Schema</h2>
                            <p className="text-sm text-gray-500">
                                Name your event schema to identify events processed via this schema
                            </p>
                        </div>

                        {/* Right side form fields */}
                        <div className="col-span-8 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Event Schema Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                    placeholder="Event Schema Name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                    rows={3}
                                    placeholder="Description"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Build your Schema Section */}
                <div className="bg-white rounded-lg border border-gray-200 p-8">
                    <div className="grid grid-cols-12 gap-8">
                        {/* Left side description */}
                        <div className="col-span-4">
                            <h2 className="text-base font-semibold text-gray-900 mb-2">Build your Schema</h2>
                            <p className="text-sm text-gray-500">
                                Events ingested to Togai will be processed based on the events schemas you setup here
                            </p>
                        </div>

                        {/* Right side - Attributes and Dimensions */}
                        <div className="col-span-8 space-y-6">
                            {/* Attributes Section */}
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Attributes
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={handleAddAttribute}
                                        className="text-sm text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Attribute
                                    </button>
                                </div>

                                {attributes.length > 0 ? (
                                    <div className="space-y-3">
                                        {attributes.map((attr, idx) => (
                                            <div key={idx} className="flex gap-3 items-start bg-gray-50 p-3 rounded-md">
                                                <div className="flex-1">
                                                    <input
                                                        type="text"
                                                        value={attr.name}
                                                        onChange={e => handleUpdateAttribute(idx, 'name', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                                        placeholder="Attribute Name (e.g. transaction_amount)"
                                                    />
                                                </div>
                                                <div className="w-32">
                                                    <input
                                                        type="text"
                                                        value={attr.unit}
                                                        onChange={e => handleUpdateAttribute(idx, 'unit', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                                        placeholder="Unit"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveAttribute(idx)}
                                                    className="mt-2 p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 text-center py-8">
                                        No attributes added yet
                                    </p>
                                )}
                            </div>

                            {/* Dimensions Section */}
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Dimensions
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={handleAddDimension}
                                        className="text-sm text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Dimension
                                    </button>
                                </div>

                                {dimensions.length > 0 ? (
                                    <div className="space-y-3">
                                        {dimensions.map((dim, idx) => (
                                            <div key={idx} className="flex gap-3 items-start bg-gray-50 p-3 rounded-md">
                                                <div className="flex-1">
                                                    <input
                                                        type="text"
                                                        value={dim}
                                                        onChange={e => handleUpdateDimension(idx, e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                                        placeholder="Dimension Name (e.g. payment_mode)"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveDimension(idx)}
                                                    className="mt-2 p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 text-center py-8">
                                        No dimensions added yet
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enriched Values Section */}
                <div className="bg-white rounded-lg border border-gray-200 p-8">
                    <div className="grid grid-cols-12 gap-8">
                        {/* Left side description */}
                        <div className="col-span-4">
                            <h2 className="text-base font-semibold text-gray-900 mb-2">Enriched Values</h2>
                            <p className="text-sm text-gray-500">
                                End result of an enrichment which gets added to an event.
                            </p>
                        </div>

                        {/* Right side - Dependencies and Enrichments */}
                        <div className="col-span-8 space-y-6">
                            {/* Dependencies Section */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-3">
                                    Dependencies ({dependencies.length})
                                </h3>

                                {dependencies.length === 0 && (
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                        <span>No Dependency Added</span>
                                    </div>
                                )}

                                {dependencies.map((dep, idx) => (
                                    <div key={idx} className="flex gap-3 items-start bg-gray-50 p-3 rounded-md mb-3">
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                value={dep}
                                                onChange={e => {
                                                    const newDeps = [...dependencies];
                                                    newDeps[idx] = e.target.value;
                                                    setDependencies(newDeps);
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                                placeholder="Dependency name"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setDependencies(dependencies.filter((_, i) => i !== idx))}
                                            className="mt-2 p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={() => setDependencies([...dependencies, ''])}
                                    className="text-sm text-gray-600 font-medium hover:text-gray-800 flex items-center gap-1 px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Dependency
                                </button>
                            </div>

                            {/* Enrichments Section */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-3">
                                    Enrichments ({enrichments.length})
                                </h3>

                                {enrichments.length === 0 && (
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                        <span>No Enrichment Added</span>
                                    </div>
                                )}

                                {enrichments.map((enr, idx) => (
                                    <div key={idx} className="flex gap-3 items-start bg-gray-50 p-3 rounded-md mb-3">
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                value={enr}
                                                onChange={e => {
                                                    const newEnrs = [...enrichments];
                                                    newEnrs[idx] = e.target.value;
                                                    setEnrichments(newEnrs);
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                                placeholder="Enrichment name"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setEnrichments(enrichments.filter((_, i) => i !== idx))}
                                            className="mt-2 p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={() => setEnrichments([...enrichments, ''])}
                                    className="text-sm text-gray-600 font-medium hover:text-gray-800 flex items-center gap-1 px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Enrichments
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                        Save As Draft
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
                    >
                        Publish
                    </button>
                </div>
            </form>
        </div>
    );
};
