import React from 'react';
import { ChevronLeft, Info, Plus } from 'lucide-react';
import { AssociationInput } from './AssociationInput';

/**
 * FeatureForm Component
 * Form for creating a new feature with associations
 */
export const FeatureForm = ({
    name,
    description,
    associations,
    schemas,
    onClose,
    onSubmit,
    onNameChange,
    onDescriptionChange,
    onAddAssociation,
    onRemoveAssociation,
    onUpdateAssociation,
}) => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center">
                    <button
                        onClick={onClose}
                        className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-xl font-bold text-gray-900">Create a new Feature</h1>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8 max-w-6xl mx-auto w-full">
                <form onSubmit={onSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                        {/* Left Panel - Info */}
                        <div className="w-full md:w-1/3 p-8 border-b md:border-b-0 md:border-r border-gray-100 bg-gray-50/50">
                            <h3 className="text-base font-bold text-gray-900 mb-2">Define Feature</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                A feature can be linked to multiple attributes/event schemas. You can associate a new attribute later.
                            </p>

                            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                <div className="flex items-start">
                                    <Info className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                                    <p className="text-xs text-blue-700">
                                        Features define what your customers are entitled to. Link them to event attributes to track usage automatically.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right Panel - Form */}
                        <div className="w-full md:w-2/3 p-8 space-y-8">
                            {/* Basic Info */}
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                        Feature Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2.5 px-3 border"
                                        value={name}
                                        onChange={(e) => onNameChange(e.target.value)}
                                        placeholder="e.g. API Requests"
                                    />
                                </div>
                            </div>

                            {/* Associations */}
                            <div className="space-y-4">
                                {associations.map((assoc, index) => (
                                    <AssociationInput
                                        key={index}
                                        index={index}
                                        association={assoc}
                                        schemas={schemas}
                                        canRemove={associations.length > 1}
                                        onUpdate={(field, value) => onUpdateAssociation(index, field, value)}
                                        onRemove={() => onRemoveAssociation(index)}
                                    />
                                ))}

                                <button
                                    type="button"
                                    onClick={onAddAssociation}
                                    className="flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors px-2"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Associate Another Attribute
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex justify-end items-center gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 shadow-sm transition-colors"
                        >
                            Publish Feature
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
