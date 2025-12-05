import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { ChevronLeft, Edit2, AlertCircle } from 'lucide-react';

/**
 * SchemaDetailView Component
 * Displays detailed information about an event schema with tabs matching Togai layout
 */
export const SchemaDetailView = ({ schema, onBack }) => {
    const [activeTab, setActiveTab] = useState('definition');

    const handleToggleStatus = () => {
        toast.success('Status toggled successfully!');
    };

    const structure = typeof schema.dimensions === 'string'
        ? JSON.parse(schema.dimensions)
        : schema.dimensions;

    const schemaAttributes = structure.attributes || [];
    const schemaDimensions = structure.dimensions || [];

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short'
        });
    };

    const formatTimeAgo = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
        const days = Math.floor(hours / 24);
        return `${days} day${days !== 1 ? 's' : ''} ago`;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-4">
                <div className="flex items-center justify-between">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        <span className="font-medium">Back to All Event Schemas</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                        <span className="font-medium">Edit Event Schema</span>
                    </button>
                </div>
            </div>

            {/* Schema Header */}
            <div className="bg-white px-8 py-6 border-b border-gray-200">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-100 rounded-full">
                        <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                            <circle cx="10" cy="10" r="8" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-semibold text-gray-900">{schema.name}</h1>
                    <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium text-green-700 bg-green-50 rounded border border-green-200">
                        • Active
                    </span>
                    <button
                        onClick={handleToggleStatus}
                        className="ml-auto relative inline-flex h-6 w-11 items-center rounded-full bg-indigo-600 transition-colors hover:bg-indigo-700"
                    >
                        <span className="inline-block h-4 w-4 transform translate-x-6 rounded-full bg-white transition-transform" />
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 py-6">
                <div className="flex gap-6">
                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Tabs */}
                        <div className="border-b border-gray-200 mb-6">
                            <nav className="-mb-px flex gap-8">
                                <button
                                    onClick={() => setActiveTab('definition')}
                                    className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'definition'
                                            ? 'border-gray-900 text-gray-900'
                                            : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                                        }`}
                                >
                                    Schema Definition ({schemaAttributes.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('enriched')}
                                    className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'enriched'
                                            ? 'border-gray-900 text-gray-900'
                                            : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                                        }`}
                                >
                                    Enriched Values (0)
                                </button>
                                <button
                                    onClick={() => setActiveTab('ingest')}
                                    className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'ingest'
                                            ? 'border-gray-900 text-gray-900'
                                            : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                                        }`}
                                >
                                    Ingest data
                                </button>
                            </nav>
                        </div>

                        {/* Tab Content */}
                        {activeTab === 'definition' && (
                            <div className="space-y-8">
                                {/* Attributes */}
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                        Attributes ({schemaAttributes.length})
                                    </h2>
                                    {schemaAttributes.length > 0 ? (
                                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                            <table className="w-full">
                                                <thead className="bg-gray-50 border-b border-gray-200">
                                                    <tr>
                                                        <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Attribute Name</th>
                                                        <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Unit</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {schemaAttributes.map((attr, idx) => (
                                                        <tr key={idx} className="hover:bg-gray-50">
                                                            <td className="px-6 py-4 text-sm text-gray-900">{attr.name}</td>
                                                            <td className="px-6 py-4 text-sm text-gray-600">{attr.unit || 'N/A'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                                            <p className="text-gray-500">No attributes defined</p>
                                        </div>
                                    )}
                                </div>

                                {/* Dimensions */}
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                        Dimensions ({schemaDimensions.length})
                                    </h2>
                                    {schemaDimensions.length > 0 ? (
                                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                                            <div className="space-y-3">
                                                {schemaDimensions.map((dim, idx) => (
                                                    <div key={idx} className="p-3 bg-gray-50 rounded-md">
                                                        <p className="font-medium text-gray-900">{dim}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-white rounded-lg border border-gray-200 p-12 flex flex-col items-center justify-center">
                                            <AlertCircle className="w-12 h-12 text-gray-300 mb-3" />
                                            <p className="text-gray-600 font-medium">No Dimensions added</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'enriched' && (
                            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                                <p className="text-gray-500">No enriched values configured</p>
                            </div>
                        )}

                        {activeTab === 'ingest' && (
                            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                                <p className="text-gray-500">Ingest data information will be displayed here</p>
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar */}
                    <div className="w-80">
                        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
                            <div>
                                <h3 className="text-sm text-gray-500 mb-2">{schema.name}</h3>
                            </div>

                            <div className="border-t border-gray-200 pt-4">
                                <p className="text-sm text-gray-600 mb-1">Associated Usage Meters</p>
                                <p className="text-3xl font-bold text-gray-900">0</p>
                            </div>

                            <div className="border-t border-gray-200 pt-4">
                                <p className="text-sm text-gray-600 mb-1">Attributes</p>
                                <p className="text-3xl font-bold text-gray-900">{schemaAttributes.length}</p>
                            </div>

                            <div className="border-t border-gray-200 pt-4">
                                <p className="text-sm text-gray-600 mb-1">Dimensions</p>
                                <p className="text-3xl font-bold text-gray-900">{schemaDimensions.length}</p>
                            </div>

                            <div className="border-t border-gray-200 pt-4">
                                <p className="text-sm text-gray-600 mb-1">Enriched values</p>
                                <p className="text-3xl font-bold text-gray-900">0</p>
                            </div>

                            <div className="border-t border-gray-200 pt-4">
                                <p className="text-sm text-gray-600 mb-1">Current Version</p>
                                <p className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    1
                                    <ChevronLeft className="w-4 h-4 rotate-180" />
                                </p>
                            </div>

                            <div className="border-t border-gray-200 pt-4 space-y-2">
                                <div>
                                    <p className="text-xs text-gray-500">Created</p>
                                    <p className="text-sm text-gray-900">{formatDate(schema.created_at)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Last Updated</p>
                                    <p className="text-sm text-gray-900">{formatTimeAgo(schema.updated_at || schema.created_at)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
