import React from 'react';
import { BarChart2, CheckCircle } from 'lucide-react';

/**
 * FeatureCard Component
 * Displays a single feature in card format
 */
export const FeatureCard = ({ feature }) => {
    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
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
                    {feature.type === 'boolean' ? 'Boolean' : 'Metered'}
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
