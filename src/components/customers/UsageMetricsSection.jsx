import React from 'react';
import { TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../../lib/utils';

/**
 * UsageMetricsSection Component
 * Displays current usage metrics for the customer
 */
export const UsageMetricsSection = ({ usage, loading, onRefresh }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Current Usage</h2>
                <button
                    onClick={onRefresh}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                    Refresh
                </button>
            </div>

            {loading ? (
                <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <p className="text-sm text-gray-500 mt-2">Loading usage data...</p>
                </div>
            ) : usage && usage.usage && usage.usage.length > 0 ? (
                <div className="space-y-4">
                    {usage.usage.map((metric) => (
                        <div key={metric.meterId} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                            <div className="flex items-center">
                                <div className="p-2 bg-indigo-50 rounded-lg mr-3">
                                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900">{metric.meterName}</h3>
                                    <p className="text-sm text-gray-500">{metric.meterCode}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-gray-900">{metric.value.toLocaleString()}</p>
                                <p className="text-xs text-gray-500">units</p>
                                {metric.costCents !== undefined && (
                                    <p className="text-sm font-medium text-indigo-600 mt-1">
                                        {formatCurrency(metric.costCents, metric.currency || 'USD')}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500 text-center py-4">No usage data available</p>
            )}
        </div>
    );
};
