import React from 'react';
import { Mail, Clock } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

/**
 * CustomerHeader Component
 * Displays customer info header with avatar and lifetime value
 */
export const CustomerHeader = ({ customer, totalSpent }) => {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center">
                <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xl font-bold mr-4">
                    {customer.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
                    <div className="flex items-center text-gray-500 mt-1 space-x-4">
                        <span className="flex items-center text-sm">
                            <Mail className="w-4 h-4 mr-1.5" />
                            {customer.email}
                        </span>
                        <span className="flex items-center text-sm">
                            <Clock className="w-4 h-4 mr-1.5" />
                            Joined {new Date(customer.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </div>
            <div className="text-right">
                <p className="text-sm text-gray-500 mb-1">Lifetime Value</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalSpent, customer.currency)}</p>
            </div>
        </div>
    );
};
