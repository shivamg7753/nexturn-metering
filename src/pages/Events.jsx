import React, { useState } from 'react';
import { EventSchemasTab } from '../components/events/EventSchemasTab';
import { EventsStreamTab } from '../components/events/EventsStreamTab';

export const Events = () => {
    const [activeTab, setActiveTab] = useState('schemas'); // 'stream' or 'schemas'

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Events</h1>
                <p className="text-gray-500 mt-1">Manage event schemas and view event streams</p>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex gap-6">
                    <button
                        onClick={() => setActiveTab('stream')}
                        className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'stream'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Events Stream
                    </button>
                    <button
                        onClick={() => setActiveTab('schemas')}
                        className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'schemas'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Event Schemas
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === 'stream' ? <EventsStreamTab /> : <EventSchemasTab />}
            </div>
        </div>
    );
};
