import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';

/**
 * UsageBreakdown Component
 * Displays usage breakdown by endpoint
 */
export const UsageBreakdown = ({ customerId }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/api/analytics/usage-by-endpoint/' + customerId)
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [customerId]);

    if (loading) return <div className="text-sm text-gray-500">Loading breakdown...</div>;
    if (data.length === 0) return <div className="text-sm text-gray-500">No data available</div>;

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="border-b border-gray-100 text-gray-500">
                        <th className="pb-2 font-medium">Endpoint</th>
                        <th className="pb-2 font-medium text-right">Requests</th>
                        <th className="pb-2 font-medium text-right">Bandwidth</th>
                        <th className="pb-2 font-medium text-right">Est. Cost</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {data.map((row, i) => (
                        <tr key={i}>
                            <td className="py-2 font-mono text-xs text-gray-700">{row.endpoint}</td>
                            <td className="py-2 text-right text-gray-900">{row.requestCount}</td>
                            <td className="py-2 text-right text-gray-900">{(row.bandwidthBytes / 1024).toFixed(1)} KB</td>
                            <td className="py-2 text-right font-medium text-indigo-600">
                                ${(row.costCents / 100).toFixed(2)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
