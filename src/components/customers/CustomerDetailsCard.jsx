import React from 'react';
import { MapPin, CreditCard, Clock } from 'lucide-react';

/**
 * CustomerDetailsCard Component
 * Displays customer details sidebar card
 */
export const CustomerDetailsCard = ({ customer }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Details</h2>
                <button className="text-sm text-indigo-600 hover:text-indigo-700">Edit</button>
            </div>
            <div className="space-y-4">
                <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Billing Address</p>
                    <div className="flex items-start text-sm text-gray-900">
                        <MapPin className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                        <div>
                            <p>{customer.billingAddress.line1}</p>
                            <p>{customer.billingAddress.city}, {customer.billingAddress.country} {customer.billingAddress.zip}</p>
                        </div>
                    </div>
                </div>
                <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Currency</p>
                    <div className="flex items-center text-sm text-gray-900">
                        <CreditCard className="w-4 h-4 text-gray-400 mr-2" />
                        {customer.currency}
                    </div>
                </div>
                <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Timezone</p>
                    <div className="flex items-center text-sm text-gray-900">
                        <Clock className="w-4 h-4 text-gray-400 mr-2" />
                        {customer.timezone || 'UTC'}
                    </div>
                </div>
                <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">External ID</p>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                        {customer.externalId}
                    </code>
                </div>
            </div>
        </div>
    );
};
