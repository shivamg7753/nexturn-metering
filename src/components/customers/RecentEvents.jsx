import React, { useState, useEffect } from 'react';
import { api } from '../../../api/client';

/**
 * RecentEvents Component
 * Displays recent customer activity events
 */
export const RecentEvents = ({ customerId }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/api/events/' + customerId)
            .then(setEvents)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [customerId]);

    if (loading) return <div className="text-sm text-gray-500">Loading events...</div>;
    if (events.length === 0) return <div className="text-sm text-gray-500">No recent events</div>;

    return (
        <div className="space-y-3 max-h-96 overflow-y-auto">
            {events.map(event => (
                <div key={event.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">{event.code}</span>
                            <span className="text-xs text-gray-500">{new Date(event.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="text-xs text-gray-600 font-mono space-y-1">
                            {Object.entries(event.properties).map(([k, v]) => (
                                <div key={k} className="flex gap-1">
                                    <span className="text-gray-400">{k}:</span>
                                    <span>{String(v)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
