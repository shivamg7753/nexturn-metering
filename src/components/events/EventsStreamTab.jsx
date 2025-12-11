import React, { useState, useEffect } from 'react';
import { Search, Calendar, X, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../../api/client';

export const EventsStreamTab = () => {
    const [events, setEvents] = useState([]);
    const [schemas, setSchemas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterSchema, setFilterSchema] = useState('all');
    const [selectedEvent, setSelectedEvent] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const schemasData = await api.getSchemas();
            setSchemas(schemasData);

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

            allEvents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            setEvents(allEvents);
        } catch (err) {
            console.error('Failed to load events', err);
        } finally {
            setLoading(false);
        }
    };

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filterSchema]);

    // Filter events
    const filteredEvents = (events || []).filter(event => {
        const eventSchemaName = (schemas || []).find(s => s.id === event.eventSchemaId)?.name || event.eventSchemaId || '';
        const matchesSearch = eventSchemaName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (event.customerName && event.customerName.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesSchema = filterSchema === 'all' || event.eventSchemaId === filterSchema;

        return matchesSearch && matchesSchema;
    });

    // Pagination calculations
    const totalPages = Math.ceil(filteredEvents.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

    // Pagination handlers
    const goToPage = (page) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    const handlePageSizeChange = (newSize) => {
        setPageSize(newSize);
        setCurrentPage(1); // Reset to first page when changing page size
    };

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
                            <option key={schema.id} value={schema.id}>{schema.name}</option>
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
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Event ID</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Event Schema</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Transaction ID</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedEvents.map((event, idx) => (
                                    <tr
                                        key={`${event.id}-${idx}`}
                                        onClick={() => setSelectedEvent(event)}
                                        className="hover:bg-indigo-50 transition-colors cursor-pointer"
                                    >
                                        <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                                            {new Date(event.timestamp).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-mono bg-gray-100 text-gray-700">
                                                {event.id?.substring(0, 8)}...
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                {schemas.find(s => s.id === event.eventSchemaId)?.name || 'Unknown'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {event.customerName || event.customerId}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-mono text-gray-600">
                                                {event.transactionId || '-'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                            {/* Pagination Info */}
                            <div className="flex items-center gap-4">
                                <p className="text-sm text-gray-500">
                                    Showing {startIndex + 1} to {Math.min(endIndex, filteredEvents.length)} of {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
                                </p>

                                {/* Page Size Selector */}
                                <div className="flex items-center gap-2">
                                    <label className="text-sm text-gray-500">Show:</label>
                                    <select
                                        value={pageSize}
                                        onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                                        className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    >
                                        <option value={10}>10</option>
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                    </select>
                                </div>
                            </div>

                            {/* Pagination Buttons */}
                            {totalPages > 1 && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => goToPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                                    </button>

                                    {/* Page Numbers */}
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum;
                                            if (totalPages <= 5) {
                                                pageNum = i + 1;
                                            } else if (currentPage <= 3) {
                                                pageNum = i + 1;
                                            } else if (currentPage >= totalPages - 2) {
                                                pageNum = totalPages - 4 + i;
                                            } else {
                                                pageNum = currentPage - 2 + i;
                                            }

                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => goToPage(pageNum)}
                                                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${currentPage === pageNum
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'text-gray-700 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <button
                                        onClick={() => goToPage(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="p-2 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronRight className="w-5 h-5 text-gray-600" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}


            {/* Enhanced Event Detail Modal */}
            {selectedEvent && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-start pt-10">
                    <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl mx-auto max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">Event Details</h3>
                                <p className="text-sm text-gray-500 mt-1">Complete information about this event</p>
                            </div>
                            <button
                                onClick={() => setSelectedEvent(null)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Content - Scrollable */}
                        <div className="overflow-y-auto p-6 space-y-6">
                            {/* Event Information */}
                            <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                                <h4 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                                    Event Information
                                </h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">Event ID:</span>
                                        <div className="font-mono bg-white px-2 py-1 rounded text-xs mt-1">
                                            {selectedEvent.id}
                                        </div>
                                    </div>
                                    {selectedEvent.productId && (
                                        <div>
                                            <span className="text-gray-600">Product ID:</span>
                                            <div className="font-mono bg-white px-2 py-1 rounded text-xs mt-1">
                                                {selectedEvent.productId}
                                            </div>
                                        </div>
                                    )}
                                    <div>
                                        <span className="text-gray-600">Timestamp:</span>
                                        <div className="font-medium mt-1">
                                            {new Date(selectedEvent.timestamp).toLocaleString()}
                                        </div>
                                    </div>
                                    {selectedEvent.startDate && (
                                        <div>
                                            <span className="text-gray-600">Plan Start Date:</span>
                                            <div className="font-medium mt-1">
                                                {new Date(selectedEvent.startDate).toLocaleString()}
                                            </div>
                                        </div>
                                    )}
                                    {selectedEvent.endDate && (
                                        <div>
                                            <span className="text-gray-600">Plan End Date:</span>
                                            <div className="font-medium mt-1">
                                                {new Date(selectedEvent.endDate).toLocaleString()}
                                            </div>
                                        </div>
                                    )}
                                    <div>
                                        <span className="text-gray-600">Event Schema:</span>
                                        <div className="font-medium mt-1">
                                            {(schemas || []).find(s => s.id === selectedEvent.eventSchemaId)?.name || 'Unknown'}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Transaction ID:</span>
                                        <div className="font-mono text-xs mt-1">
                                            {selectedEvent.transactionId || '-'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Customer Information */}
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                    Customer Information
                                </h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">Customer Name:</span>
                                        <div className="font-medium mt-1">
                                            {selectedEvent.customerName || '-'}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Customer ID:</span>
                                        <div className="font-mono text-xs mt-1">
                                            {selectedEvent.customerId}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Event Properties */}
                            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                                    Event Properties
                                </h4>
                                {(() => {
                                    try {
                                        const props = typeof selectedEvent.properties === 'string'
                                            ? JSON.parse(selectedEvent.properties)
                                            : selectedEvent.properties;

                                        if (!props || Object.keys(props).length === 0) {
                                            return <p className="text-gray-500 italic text-sm">No properties</p>;
                                        }

                                        return (
                                            <div className="space-y-2">
                                                {Object.entries(props).map(([key, value]) => (
                                                    <div key={key} className="bg-white rounded p-3 flex justify-between items-center">
                                                        <span className="font-medium text-gray-700">{key}:</span>
                                                        <span className="text-gray-900 font-mono text-sm">
                                                            {JSON.stringify(value)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    } catch (e) {
                                        return (
                                            <pre className="bg-white p-3 rounded-md text-xs overflow-x-auto border border-green-200">
                                                {JSON.stringify(selectedEvent.properties, null, 2)}
                                            </pre>
                                        );
                                    }
                                })()}
                            </div>

                            {/* Raw Event Data */}
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-gray-600 rounded-full"></span>
                                    Raw Event Data (JSON)
                                </h4>
                                <pre className="bg-white p-3 rounded-md text-xs overflow-x-auto border border-gray-300 max-h-64">
                                    {JSON.stringify({
                                        ...selectedEvent,
                                        eventId: selectedEvent.id, // Add eventId
                                        planStartDate: selectedEvent.startDate, // Rename startDate
                                        planEndDate: selectedEvent.endDate, // Rename endDate
                                        id: undefined, // Remove id
                                        startDate: undefined, // Remove startDate
                                        endDate: undefined // Remove endDate
                                    }, (key, value) => ['id', 'startDate', 'endDate'].includes(key) ? undefined : value, 2)}
                                </pre>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                            <button
                                onClick={() => setSelectedEvent(null)}
                                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
