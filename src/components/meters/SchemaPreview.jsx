import React from 'react';

/**
 * SchemaPreview Component
 * Displays attributes and dimensions of selected schema
 */
export const SchemaPreview = ({ schemaStructure }) => {
    return (
        <div className="bg-gray-50 rounded-lg p-4 flex gap-8">
            <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Attributes ({schemaStructure.attributes?.length || 0})
                </span>
                <div className="flex flex-wrap gap-2 mt-2">
                    {(schemaStructure.attributes || []).map((a, i) => (
                        <span key={i} className="text-xs bg-white px-2 py-1 rounded border border-gray-200 text-gray-600">
                            {a.name}
                        </span>
                    ))}
                </div>
            </div>
            <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Dimensions ({schemaStructure.dimensions?.length || 0})
                </span>
                <div className="flex flex-wrap gap-2 mt-2">
                    {(schemaStructure.dimensions || []).map((d, i) => (
                        <span key={i} className="text-xs bg-white px-2 py-1 rounded border border-gray-200 text-gray-600">
                            {d}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};
