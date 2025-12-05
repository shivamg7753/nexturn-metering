import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Calendar, Search, Filter } from 'lucide-react';

export const EventsStreamTab = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterSchema, setFilterSchema] = useState('all');
    const [schemas, setSchemas] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // Load schemas for filter dropdown
            const schemasData = await api.getSchemas();
            setSchemas(schemasData);

            // Load all events from all customers
            const customers = await api.getCustomers();
            const allEvents = [];

            for (const customer of customers) {
                try {
                    const customerEvents = await api.get(`/api/events/${customer.id}`);
                    allEvents.push(...customerEvents.map(e => ({ ...e, customerId: customer.id, customerName: customer.name })));
                } catch (err) {
                    console.error(`Failed to load events for customer ${customer.id}`, err);
                }
            }

            // Sort by timestamp descending
            allEvents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            setEvents(allEvents);
        } catch (err) {
            console.error('Failed to load events', err);
        } finally {
            setLoading(false);
        }
    };

    // Filter events
    const filteredEvents = events.filter(event => {
        const matchesSearch = event.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (event.customerName && event.customerName.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesSchema = filterSchema === 'all' || event.code === filterSchema;

        return matchesSearch && matchesSchema;
    });

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <p className="text-gray-500 mt-3">Loading events...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Search and Filter Bar */}
            <div className="flex items-center gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search events..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                </div>

                {/* Schema Filter */}
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                        value={filterSchema}
                        onChange={e => setFilterSchema(e.target.value)}
                        className="pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white appearance-none"
                    >
                        <option value="all">All Schemas</option>
                        {schemas.map(schema => (
                            <option key={schema.id} value={schema.name}>{schema.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Events List */}
            {filteredEvents.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No events found</p>
                    <p className="text-sm text-gray-400 mt-1">Events will appear here as they are generated</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Timestamp</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Event Code</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Properties</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredEvents.map((event, idx) => (
                                    <tr key={`${event.id}-${idx}`} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                                            {new Date(event.timestamp).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                {event.code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {event.customerName || event.customerId}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs text-gray-600 font-mono space-y-1 max-w-md">
                                                {Object.entries(event.properties || {}).slice(0, 3).map(([k, v]) => (
                                                    <div key={k} className="flex gap-2">
                                                        <span className="text-gray-400">{k}:</span>
                                                        <span className="truncate">{String(v)}</span>
                                                    </div>
                                                ))}
                                                {Object.keys(event.properties || {}).length > 3 && (
                                                    <div className="text-gray-400 italic">
                                                        +{Object.keys(event.properties).length - 3} more
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination info */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                        <p className="text-sm text-gray-500">
                            Showing {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
