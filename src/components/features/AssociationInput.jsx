import React from 'react';
import { X } from 'lucide-react';

/**
 * AssociationInput Component
 * Handles a single event schema to attribute association
 */
export const AssociationInput = ({
    index,
    association,
    schemas,
    canRemove,
    onUpdate,
    onRemove,
}) => {
    const selectedSchema = schemas.find(s => s.id === association.eventSchemaId);

    const getSchemaAttributes = () => {
        if (!selectedSchema) return [];

        const dims = typeof selectedSchema.dimensions === 'string'
            ? JSON.parse(selectedSchema.dimensions)
            : selectedSchema.dimensions || {};

        let keys = [];
        if (dims.attributes || dims.dimensions) {
            if (Array.isArray(dims.attributes)) {
                keys = [...keys, ...dims.attributes.map((attr) => attr.name)];
            }
            if (Array.isArray(dims.dimensions)) {
                keys = [...keys, ...dims.dimensions];
            }
        } else {
            keys = Object.keys(dims);
        }
        return keys;
    };

    return (
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 relative group hover:border-indigo-200 transition-colors">
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                {canRemove && (
                    <button
                        type="button"
                        onClick={onRemove}
                        className="text-gray-400 hover:text-red-500 p-1"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                ASSOCIATE ATTRIBUTE {index + 1}
            </h4>

            <div className="space-y-4">
                <div>
                    <select
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2.5 px-3 border bg-white"
                        value={association.eventSchemaId}
                        onChange={(e) => onUpdate('eventSchemaId', e.target.value)}
                        required
                    >
                        <option value="">Choose Event Schema</option>
                        {schemas.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <select
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2.5 px-3 border bg-white"
                        value={association.attribute}
                        onChange={(e) => onUpdate('attribute', e.target.value)}
                        required
                        disabled={!association.eventSchemaId}
                    >
                        <option value="">Choose Attribute</option>
                        {getSchemaAttributes().map(key => (
                            <option key={key} value={key}>{key}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};
