import React from 'react';

/**
 * SchemaListTable Component
 * Displays event schemas in a table view matching Togai layout
 */
export const SchemaListTable = ({ schemas, onSchemaClick }) => {
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

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'text-green-700 bg-green-50 border-green-200';
            case 'draft': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
            case 'archived': return 'text-gray-700 bg-gray-50 border-gray-200';
            default: return 'text-gray-700 bg-gray-50 border-gray-200';
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 tracking-wide">Event Schema Name</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 tracking-wide">Status</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 tracking-wide">Usage Meters</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 tracking-wide">Attributes</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 tracking-wide">Dimensions</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 tracking-wide">Last Updated</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {schemas.map((schema) => {
                        const structure = typeof schema.dimensions === 'string'
                            ? JSON.parse(schema.dimensions)
                            : schema.dimensions;

                        const attributes = structure.attributes || [];
                        const dimensions = structure.dimensions || [];

                        return (
                            <tr
                                key={schema.id}
                                onClick={() => onSchemaClick(schema)}
                                className="hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                <td className="px-6 py-4">
                                    <span className="font-medium text-gray-900">{schema.name}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded border ${getStatusColor(schema.status)}`}>
                                        • {schema.status ? schema.status.charAt(0).toUpperCase() + schema.status.slice(1) : 'Draft'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-gray-900">0</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-gray-900">{attributes.length}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-gray-900">{dimensions.length}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-gray-500">
                                        {formatTimeAgo(schema.updatedAt || schema.createdAt)}
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
