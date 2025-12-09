import React from 'react';
import { BarChart2, CheckCircle } from 'lucide-react';

/**
 * FeatureCard Component
 * Displays a single feature in card format
 */
export const FeatureCard = ({ feature, onEdit, onSelect }) => {
    return (
        <div
            onClick={() => onSelect(feature)}
            className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative group"
        >
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={(e) => { e.stopPropagation(); onEdit(feature); }}
                    className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                    title="Edit Feature"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pen w-4 h-4 text-gray-600" aria-hidden="true"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path></svg>
                </button>
            </div>
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-medium text-gray-900">{feature.name}</h3>
                    {feature.description && (
                        <p className="text-sm text-gray-500 mt-1">{feature.description}</p>
                    )}
                    {feature.type === 'metered' && (
                        <div className="mt-2 space-y-1">
                            <div className="text-xs text-gray-500">
                                {feature.associations?.length || 0} associated attributes
                            </div>
                        </div>
                    )}
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${feature.type === 'boolean' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                    {feature.code}
                </span>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
                {feature.type === 'metered' ? (
                    <div className="flex items-center text-sm text-gray-600">
                        <BarChart2 className="h-4 w-4 mr-2 text-gray-400" />
                        Metered Feature
                    </div>
                ) : (
                    <div className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 mr-2 text-gray-400" />
                        Static Entitlement
                    </div>
                )}
            </div>
        </div>
    );
};
